(function () {
  const canvas = document.getElementById('blockCanvas'), context = canvas.getContext('2d'), size = 30, columns = 10, rows = 20;
  const shapes = [[[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[1,0,0],[1,1,1]], [[0,0,1],[1,1,1]], [[0,1,1],[1,1,0]], [[1,1,0],[0,1,1]]];
  const colors = ['#e66c5a','#e1b643','#4a9f8c','#5b85d6','#a66bc4','#d46d9b','#6fa655'];
  const board = Array.from({ length: rows }, () => Array(columns).fill(0));
  let piece, score = 0, lines = 0, level = 1, running = false, timer = null;
  const scoreEl = document.getElementById('blockScore'), linesEl = document.getElementById('blockLines'), levelEl = document.getElementById('blockLevel'), bestEl = document.getElementById('blockBest'), resultEl = document.getElementById('blockResult');
  function createPiece() { const index = Math.floor(Math.random() * shapes.length); return { shape: shapes[index].map(row => row.slice()), color: colors[index], x: Math.floor((columns - shapes[index][0].length) / 2), y: 0 }; }
  function collide(current, dx, dy, matrix) { const shape = matrix || current.shape; return shape.some((row, y) => row.some((cell, x) => cell && (current.x + x + dx < 0 || current.x + x + dx >= columns || current.y + y + dy >= rows || (current.y + y + dy >= 0 && board[current.y + y + dy][current.x + x + dx])))); }
  function drawCell(x, y, color) { context.fillStyle = color; context.fillRect(x * size + 1, y * size + 1, size - 2, size - 2); }
  function draw() { context.fillStyle = '#11151b'; context.fillRect(0, 0, canvas.width, canvas.height); board.forEach((row, y) => row.forEach((cell, x) => { if (cell) drawCell(x, y, cell); })); if (piece) piece.shape.forEach((row, y) => row.forEach((cell, x) => { if (cell && piece.y + y >= 0) drawCell(piece.x + x, piece.y + y, piece.color); })); }
  function updateStats() { scoreEl.textContent = score; linesEl.textContent = lines; levelEl.textContent = level; bestEl.textContent = readStoredNumber('blockPuzzleBest'); }
  function merge() { piece.shape.forEach((row, y) => row.forEach((cell, x) => { if (cell && piece.y + y >= 0) board[piece.y + y][piece.x + x] = piece.color; })); }
  function resetTimer() { clearInterval(timer); timer = setInterval(drop, Math.max(160, 850 - (level - 1) * 70)); }
  function clearLines() { let cleared = 0; for (let y = rows - 1; y >= 0; y--) if (board[y].every(Boolean)) { board.splice(y, 1); board.unshift(Array(columns).fill(0)); cleared++; y++; } if (cleared) { lines += cleared; score += [0,100,300,500,800][cleared] * level; level = Math.floor(lines / 10) + 1; updateStats(); resetTimer(); } }
  function spawn() { piece = createPiece(); if (collide(piece, 0, 0)) gameOver(); }
  function drop() { if (!running) return; if (!collide(piece, 0, 1)) piece.y++; else { merge(); clearLines(); spawn(); } draw(); }
  function move(dx) { if (running && !collide(piece, dx, 0)) { piece.x += dx; draw(); } }
  function rotate() { if (!running) return; const rotated = piece.shape[0].map((_, index) => piece.shape.map(row => row[index]).reverse()); if (!collide(piece, 0, 0, rotated)) { piece.shape = rotated; draw(); } }
  function hardDrop() { if (!running) return; while (!collide(piece, 0, 1)) piece.y++; drop(); }
  function gameOver() { running = false; clearInterval(timer); const best = readStoredNumber('blockPuzzleBest'), newBest = score > best; if (newBest) writeStoredNumber('blockPuzzleBest', score); updateStats(); resultEl.innerHTML = '<strong>GAME OVER</strong><b>' + score + '</b><p>Lines: ' + lines + ' · Level: ' + level + (newBest ? ' · 🏆 NEW RECORD!' : '') + '</p>'; resultEl.classList.remove('hidden'); }
  function start() { board.forEach(row => row.fill(0)); score = lines = 0; level = 1; resultEl.classList.add('hidden'); running = true; spawn(); updateStats(); resetTimer(); draw(); }
  document.addEventListener('keydown', event => { if (!running) return; if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(event.key)) event.preventDefault(); if (event.key === 'ArrowLeft') move(-1); if (event.key === 'ArrowRight') move(1); if (event.key === 'ArrowUp') rotate(); if (event.key === 'ArrowDown') drop(); if (event.key === ' ') hardDrop(); });
  [['blockLeft', () => move(-1)], ['blockRight', () => move(1)], ['blockRotate', rotate], ['blockDown', drop], ['blockDrop', hardDrop]].forEach(([id, fn]) => document.getElementById(id).addEventListener('click', fn)); document.getElementById('blockStart').addEventListener('click', start); document.getElementById('blockCopy').addEventListener('click', () => copyGameLink(window.location.href, { container: resultEl })); document.getElementById('blockShare').addEventListener('click', () => { if (!running && score) shareGameResult({ title: document.title, text: '🎮 블록 퍼즐\n\nScore: ' + score + '\nLines: ' + lines + '\nLevel: ' + level, container: resultEl }); }); updateStats(); draw();

if (typeof renderRelatedByCategory === 'function') {
  renderRelatedByCategory('relatedList', 'games', 'block-puzzle', 5);
}
})();