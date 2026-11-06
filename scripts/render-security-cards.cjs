/* Export JPEGs using installed Chrome and its DevTools protocol; no npm packages. */
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const os = require('node:os');

async function main() {
  const folder = path.resolve(process.argv[2] || '');
  const templates = path.resolve('.tmp/security-cards', path.basename(folder));
  if (!fs.existsSync(path.join(templates, 'card-1.html'))) throw Error('Generate the bulletin before exporting cards');
  const candidates = [process.env.CHROME_PATH, 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome', '/usr/bin/chromium'];
  const executable = candidates.find(p => p && fs.existsSync(p));
  if (!executable) throw Error('Chrome not found; set CHROME_PATH');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'security-cards-'));
  const child = spawn(executable, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
  let socket;
  try {
    const portFile = path.join(profile, 'DevToolsActivePort');
    for (let i = 0; !fs.existsSync(portFile); i++) {
      if (i > 150 || child.exitCode !== null) throw Error('Chrome startup failed');
      await new Promise(r => setTimeout(r, 100));
    }
    const port = fs.readFileSync(portFile, 'utf8').split('\n')[0];
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socket = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let id = 0;
    const pending = new Map();
    socket.onmessage = ({ data }) => {
      const message = JSON.parse(data);
      if (!pending.has(message.id)) return;
      const { resolve, reject, timer } = pending.get(message.id);
      clearTimeout(timer); pending.delete(message.id);
      message.error ? reject(Error(message.error.message)) : resolve(message.result);
    };
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const n = ++id;
      const timer = setTimeout(() => { pending.delete(n); reject(Error(`Chrome timeout: ${method}`)); }, 20000);
      pending.set(n, { resolve, reject, timer });
      socket.send(JSON.stringify({ id: n, method, params }));
    });
    await send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false });
    for (let number = 1; number <= 5; number++) {
      const file = path.join(templates, `card-${number}.html`);
      await send('Page.navigate', { url: pathToFileURL(file).href });
      let loaded = false;
      for (let i = 0; i < 100; i++) {
        const state = await send('Runtime.evaluate', { expression: 'document.readyState + "|" + location.href', returnByValue: true });
        if (state.result.value === 'complete|' + pathToFileURL(file).href) { loaded = true; break; }
        await new Promise(r => setTimeout(r, 50));
      }
      if (!loaded) throw Error('Card navigation timed out');
      const fit = await send('Runtime.evaluate', { awaitPromise: true, returnByValue: true, expression: `(async()=>{await document.fonts.ready;const main=document.querySelector('main'),h=document.querySelector('h1'),p=document.querySelector('p');for(let i=0;i<35 && main.scrollHeight>main.clientHeight;i++){h.style.fontSize=(parseFloat(getComputedStyle(h).fontSize)-1)+'px';p.style.fontSize=(parseFloat(getComputedStyle(p).fontSize)-.6)+'px'}return main.scrollHeight<=main.clientHeight && document.body.scrollWidth<=1080})()` });
      if (fit.result.value !== true) throw Error(`Card ${number} text overflows; refusing clipped export`);
      const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 94, clip: { x: 0, y: 0, width: 1080, height: 1350, scale: 1 } });
      fs.writeFileSync(path.join(folder, `card-${number}.jpg`), Buffer.from(shot.data, 'base64'));
    }
    console.log('Exported five 1080 × 1350 JPEG cards.');
  } finally {
    socket?.close();
    child.kill();
    await new Promise(resolve => child.exitCode !== null ? resolve() : child.once('exit', resolve));
    if (path.dirname(profile) !== path.resolve(os.tmpdir()) || !path.basename(profile).startsWith('security-cards-')) throw Error('Unexpected Chrome profile path');
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
