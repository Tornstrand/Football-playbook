const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');
const playNameInput = document.getElementById('playName');
const roleSelect = document.getElementById('roleSelect');
const addPlayerBtn = document.getElementById('addPlayer');
const routeModeBtn = document.getElementById('routeMode');
const savePlayBtn = document.getElementById('savePlay');
const loadPlayBtn = document.getElementById('loadPlay');
const playListEl = document.getElementById('playList');

let players = [];
let selectedPlayer = null;
let draggingPlayer = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let routeMode = false;

class Player {
  constructor(x, y, role) {
    this.x = x;
    this.y = y;
    this.role = role;
    this.route = [];
  }

  get side() {
    const offense = ['QB', 'RB', 'WR', 'TE', 'OL', 'FB', 'C', 'G', 'T'];
    return offense.includes(this.role) ? 'offense' : 'defense';
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = this.side === 'offense' ? '#1E90FF' : '#FF4136';
    ctx.fill();
    ctx.lineWidth = selectedPlayer === this ? 3 : 1;
    ctx.strokeStyle = selectedPlayer === this ? '#FFD700' : '#000000';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.role, this.x, this.y + 4);

    if (this.route.length) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      this.route.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }
  }
}

function drawField() {
  ctx.fillStyle = '#0B6623';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  const lines = 12;
  for (let i = 0; i <= lines; i++) {
    const x = (canvas.width / lines) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
}

function redraw() {
  drawField();
  players.forEach(p => p.draw());
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

addPlayerBtn.addEventListener('click', () => {
  const role = roleSelect.value;
  const p = new Player(canvas.width / 2, canvas.height / 2, role);
  players.push(p);
  redraw();
});

routeModeBtn.addEventListener('click', () => {
  routeMode = !routeMode;
  routeModeBtn.classList.toggle('active', routeMode);
});

savePlayBtn.addEventListener('click', saveCurrentPlay);

loadPlayBtn.addEventListener('click', () => {
  const name = playNameInput.value.trim();
  if (name) loadPlayByName(name);
});

canvas.addEventListener('mousedown', e => {
  if (routeMode) return;
  const { x, y } = getMousePos(e);
  const hit = players.find(p => Math.hypot(p.x - x, p.y - y) < 12);
  if (hit) {
    draggingPlayer = hit;
    selectedPlayer = hit;
    dragOffsetX = x - hit.x;
    dragOffsetY = y - hit.y;
    redraw();
  }
});

canvas.addEventListener('mousemove', e => {
  if (!draggingPlayer) return;
  const { x, y } = getMousePos(e);
  const newX = x - dragOffsetX;
  const newY = y - dragOffsetY;
  const dx = newX - draggingPlayer.x;
  const dy = newY - draggingPlayer.y;
  draggingPlayer.x = newX;
  draggingPlayer.y = newY;
  draggingPlayer.route.forEach(pt => {
    pt.x += dx;
    pt.y += dy;
  });
  redraw();
});

canvas.addEventListener('mouseup', () => {
  draggingPlayer = null;
});

canvas.addEventListener('click', e => {
  if (draggingPlayer) return;
  const { x, y } = getMousePos(e);
  const hit = players.find(p => Math.hypot(p.x - x, p.y - y) < 12);
  if (routeMode) {
    if (hit) {
      selectedPlayer = hit;
    } else if (selectedPlayer) {
      selectedPlayer.route.push({ x, y });
    }
    redraw();
  } else {
    selectedPlayer = hit || null;
    redraw();
  }
});

function saveCurrentPlay() {
  const name = playNameInput.value.trim();
  if (!name) {
    alert('Ange spelnamn');
    return;
  }
  const play = {
    name,
    players: players.map(p => ({
      x: p.x,
      y: p.y,
      role: p.role,
      route: p.route
    }))
  };
  const plays = JSON.parse(localStorage.getItem('plays') || '[]');
  const existing = plays.findIndex(pl => pl.name === name);
  if (existing >= 0) {
    plays[existing] = play;
  } else {
    plays.push(play);
  }
  localStorage.setItem('plays', JSON.stringify(plays));
  loadPlayList();
}

function loadPlayByName(name) {
  const plays = JSON.parse(localStorage.getItem('plays') || '[]');
  const play = plays.find(p => p.name === name);
  if (!play) return;
  playNameInput.value = play.name;
  players = play.players.map(p => {
    const pl = new Player(p.x, p.y, p.role);
    pl.route = p.route || [];
    return pl;
  });
  selectedPlayer = null;
  redraw();
}

function loadPlayList() {
  playListEl.innerHTML = '';
  const plays = JSON.parse(localStorage.getItem('plays') || '[]');
  plays.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.name;
    li.addEventListener('click', () => loadPlayByName(p.name));
    playListEl.appendChild(li);
  });
}

loadPlayList();
redraw();

