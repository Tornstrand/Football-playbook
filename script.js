const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');
const addBtn = document.getElementById('addPlayer');
const lineTypeSelect = document.getElementById('lineType');

const players = [];
let selectedPlayer = null;

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.routes = [];
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.stroke();

    this.routes.forEach(r => drawLine(this.x, this.y, r.x, r.y, r.type));
  }
}

function drawField() {
  ctx.fillStyle = '#2e7d32';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  const step = canvas.width / 12;
  for (let i = 0; i <= 12; i++) {
    const x = i * step;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

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
  const p = new Player(canvas.width / 2, canvas.height / 2);
  players.push(p);
  redraw();
});

canvas.addEventListener('click', e => {
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
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = 10;
  const bx = x2 - len * Math.sin(angle);
  const by = y2 + len * Math.cos(angle);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(bx, by);
  ctx.stroke();
}

redraw();
