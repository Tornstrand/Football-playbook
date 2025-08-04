const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');
const addBtn = document.getElementById('addPlayer');
const lineTypeSelect = document.getElementById('lineType');

const players = [];
let selectedPlayer = null;
let dragPlayer = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragging = false;

class Player {
  constructor(x, y, name) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.routes = [];
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    ctx.fillStyle = 'black';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.name, this.x, this.y - 15);

    this.routes.forEach(r => drawLine(this.x, this.y, r.x, r.y, r.type));
  }
}

function drawField() {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
}

function redraw() {
  drawField();
  players.forEach(p => p.draw());
}

addBtn.addEventListener('click', () => {
  const name = prompt('Player name', `Player ${players.length + 1}`) || `Player ${players.length + 1}`;
  const p = new Player(canvas.width / 2, canvas.height / 2, name);
  players.push(p);
  redraw();
});

canvas.addEventListener('mousedown', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const hit = players.find(p => Math.hypot(p.x - x, p.y - y) < 10);
  if (hit) {
    dragPlayer = hit;
    selectedPlayer = hit;
    dragOffsetX = x - hit.x;
    dragOffsetY = y - hit.y;
  }
});

canvas.addEventListener('mousemove', e => {
  if (!dragPlayer) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  dragPlayer.x = x - dragOffsetX;
  dragPlayer.y = y - dragOffsetY;
  dragging = true;
  redraw();
});

canvas.addEventListener('mouseup', () => {
  dragPlayer = null;
  setTimeout(() => (dragging = false), 0);
});

canvas.addEventListener('click', e => {
  if (dragging) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const hit = players.find(p => Math.hypot(p.x - x, p.y - y) < 10);
  if (hit) {
    selectedPlayer = hit;
    return;
  }

  if (selectedPlayer) {
    selectedPlayer.routes.push({ x, y, type: lineTypeSelect.value });
    selectedPlayer = null;
    redraw();
  }
});

canvas.addEventListener('dblclick', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const hit = players.find(p => Math.hypot(p.x - x, p.y - y) < 10);
  if (hit) {
    const newName = prompt('Player name', hit.name);
    if (newName) {
      hit.name = newName;
      redraw();
    }
  }
});

function drawLine(x1, y1, x2, y2, type) {
  ctx.strokeStyle = 'yellow';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  if (type === 'route') {
    drawArrow(x1, y1, x2, y2);
  } else {
    drawBlock(x1, y1, x2, y2);
  }
}

function drawArrow(x1, y1, x2, y2) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = 10;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - len * Math.cos(angle - Math.PI / 6),
    y2 - len * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(x2, y2);
  ctx.lineTo(
    x2 - len * Math.cos(angle + Math.PI / 6),
    y2 - len * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

function drawBlock(x1, y1, x2, y2) {
  const len = 10;
  ctx.strokeStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(x2 - len, y2);
  ctx.lineTo(x2 + len, y2);
  ctx.stroke();
}

redraw();
