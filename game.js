const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const mapCanvas = document.getElementById('minimap');
const mctx = mapCanvas.getContext('2d');

const briefing = document.getElementById('briefing');
const hud = document.getElementById('hud');
const endScreen = document.getElementById('end-screen');
const objectiveEl = document.getElementById('objective');
const objectiveProgress = document.getElementById('objective-progress');
const healthValue = document.getElementById('health-value');
const healthProgress = document.getElementById('health-progress');
const ammoValue = document.getElementById('ammo');
const intelValue = document.getElementById('intel');
const timerValue = document.getElementById('timer');
const killsValue = document.getElementById('kills');
const toastEl = document.getElementById('toast');
const hitMarker = document.getElementById('hit-marker');
const damageVignette = document.getElementById('damage-vignette');
const mapToggle = document.getElementById('map');

const FOV = Math.PI / 3;
const VIEW_DISTANCE = 18;
const PLAYER_SPEED = 2.8;
const SPRINT_MULTIPLIER = 1.45;
const PLAYER_RAD = 0.25;

const maps = [
  {
    name: 'Neon Harbor',
    description: 'A rain-soaked canal district with open sightlines and stacked crates.',
    start: { x: 2.5, y: 2.5, a: 0 },
    grid: [
      '##################',
      '#..............##',
      '#..##......##...##',
      '#......#.......##',
      '#.##..#..##....##',
      '#....#.....#....##',
      '#....#....#.....##',
      '#...............##',
      '#..##......##...##',
      '#...............##',
      '#...#..#........##',
      '#...............##',
      '#..##....#......##',
      '#..............##',
      '##################'
    ],
    enemies: [
      { x: 11.5, y: 3.5, role: 'leader' },
      { x: 9.5, y: 7.5, role: 'rifleman' },
      { x: 13.5, y: 8.5, role: 'rifleman' },
      { x: 11.5, y: 11.5, role: 'leader' },
      { x: 7.5, y: 10.5, role: 'rifleman' }
    ],
    pickups: [
      { x: 4.8, y: 11.4, kind: 'intel' },
      { x: 13.8, y: 5.5, kind: 'intel' },
      { x: 7.8, y: 5.4, kind: 'ammo' },
      { x: 12.3, y: 11.7, kind: 'medkit' }
    ]
  },
  {
    name: 'Misty Rail',
    description: 'Narrow train lanes with hard angles and choke points.',
    start: { x: 2.5, y: 10.5, a: 0 },
    grid: [
      '##################',
      '#...#......#....##',
      '#...#..##..#....##',
      '#..............##',
      '###.####.###....##',
      '#...#....#......##',
      '#...#....#......##',
      '#.......##......##',
      '#.#####.####....##',
      '#...............##',
      '#..#..#..#......##',
      '#..#..#..#......##',
      '#...............##',
      '#..............##',
      '##################'
    ],
    enemies: [
      { x: 11.5, y: 3.5, role: 'leader' },
      { x: 13.5, y: 5.5, role: 'rifleman' },
      { x: 9.5, y: 8.5, role: 'rifleman' },
      { x: 11.5, y: 11.5, role: 'leader' },
      { x: 6.5, y: 10.5, role: 'rifleman' }
    ],
    pickups: [
      { x: 13.8, y: 11.7, kind: 'intel' },
      { x: 4.8, y: 3.5, kind: 'intel' },
      { x: 7.8, y: 12.4, kind: 'ammo' },
      { x: 14.8, y: 7.2, kind: 'medkit' }
    ]
  },
  {
    name: 'Glass Foundry',
    description: 'An industrial riot zone of broken columns and long corridors.',
    start: { x: 2.5, y: 2.5, a: 0 },
    grid: [
      '##################',
      '#..............##',
      '#.#####..##.....##',
      '#.....#..#......##',
      '#.###.#.###.....##',
      '#.#...#...#.....##',
      '#.#.###.#.#.....##',
      '#...#...#.#.....##',
      '#.###.#.#.#.....##',
      '#.....#...#.....##',
      '#.#####.#.###...##',
      '#...............##',
      '#..##....##.....##',
      '#..............##',
      '##################'
    ],
    enemies: [
      { x: 12.5, y: 3.5, role: 'leader' },
      { x: 8.5, y: 5.5, role: 'rifleman' },
      { x: 13.5, y: 7.5, role: 'rifleman' },
      { x: 10.5, y: 9.5, role: 'leader' },
      { x: 14.5, y: 11.5, role: 'rifleman' }
    ],
    pickups: [
      { x: 5.5, y: 12.1, kind: 'intel' },
      { x: 14.5, y: 2.3, kind: 'intel' },
      { x: 9.8, y: 12.3, kind: 'ammo' },
      { x: 15.2, y: 7.8, kind: 'medkit' }
    ]
  },
  {
    name: 'Granite Ridge',
    description: 'High ground with exposed angles and brutal crossfire lanes.',
    start: { x: 2.5, y: 12.5, a: 0 },
    grid: [
      '##################',
      '#..............##',
      '#..###....###...##',
      '#.....#..#......##',
      '#..#..#..#..#...##',
      '#..#........#...##',
      '#..#..##....#...##',
      '#....#..#...#...##',
      '#.###.#..#.#....##',
      '#.....#..#......##',
      '#..##....##.....##',
      '#.....#.........##',
      '#..#..#..###....##',
      '#...............##',
      '##################'
    ],
    enemies: [
      { x: 12.5, y: 3.5, role: 'leader' },
      { x: 11.5, y: 6.5, role: 'rifleman' },
      { x: 14.5, y: 7.5, role: 'rifleman' },
      { x: 10.5, y: 9.5, role: 'leader' },
      { x: 8.5, y: 11.5, role: 'rifleman' }
    ],
    pickups: [
      { x: 15.5, y: 12.3, kind: 'intel' },
      { x: 5.5, y: 3.5, kind: 'intel' },
      { x: 12.2, y: 9.2, kind: 'ammo' },
      { x: 8.8, y: 6.6, kind: 'medkit' }
    ]
  }
];

let W = 0;
let H = 0;
let dpr = 1;
let lastFrame = 0;
let keys = {};
let mouseDown = false;
let pointerLocked = false;

let currentMapIndex = 0;
let currentMap = maps[currentMapIndex];
let player = null;
let enemies = [];
let pickups = [];
let ammo = 30;
let reserve = 120;
let kills = 0;
let intel = 0;
let reloading = false;
let elapsed = 0;
let messageTimer = null;
let flash = 0;
let damageFlash = 0;
let running = false;
let showMap = false;

function setMessage(txt) {
  toastEl.textContent = txt;
  toastEl.classList.add('show');
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function wallAt(x, y, map = currentMap) {
  const gx = Math.floor(x);
  const gy = Math.floor(y);
  if (gx < 0 || gy < 0 || gy >= map.grid.length || gx >= map.grid[0].length) return true;
  return map.grid[gy][gx] === '#';
}

function dist(a, b, c, d) {
  return Math.hypot(a - c, b - d);
}

function norm(a) {
  while (a < -Math.PI) a += Math.PI * 2;
  while (a > Math.PI) a -= Math.PI * 2;
  return a;
}

function updateHud() {
  if (!player) return;
  healthValue.textContent = Math.max(0, Math.ceil(player.hp));
  healthProgress.style.width = Math.max(0, player.hp) + '%';
  ammoValue.textContent = `${ammo} / ${reserve}`;
  intelValue.textContent = `${intel} / 2`;
  timerValue.textContent = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(Math.floor(elapsed % 60)).padStart(2, '0')}`;
  killsValue.textContent = String(kills);
  objectiveEl.textContent = `CLEAR ${currentMap.name.toUpperCase()} HOSTILES`;
  objectiveProgress.style.width = `${Math.min(100, (kills / Math.max(1, enemies.length)) * 100)}%`;
}

function setMap(index) {
  currentMapIndex = index;
  currentMap = maps[currentMapIndex];
  document.querySelectorAll('.map-option').forEach((btn) => {
    btn.classList.toggle('active', Number(btn.dataset.map) === index);
  });
  document.getElementById('brief-map-name').textContent = currentMap.name;
  objectiveEl.textContent = `CLEAR ${currentMap.name.toUpperCase()} HOSTILES`;
}

function resetMission() {
  const map = currentMap;
  player = { x: map.start.x, y: map.start.y, a: map.start.a, hp: 100, muzzle: 0 };
  enemies = map.enemies.map((enemy, index) => ({
    x: enemy.x,
    y: enemy.y,
    hp: 100,
    role: enemy.role || (index % 2 === 0 ? 'leader' : 'rifleman'),
    dead: false,
    shot: 0.8 + Math.random() * 1.4,
    muzzle: 0,
    alert: 0,
    order: index
  }));
  pickups = map.pickups.map((item) => ({ ...item, picked: false }));
  ammo = 30;
  reserve = 120;
  kills = 0;
  intel = 0;
  elapsed = 0;
  reloading = false;
  showMap = false;
  flash = 0;
  damageFlash = 0;
  running = true;
  mapToggle.classList.add('hidden');
  setMessage(`OPERATION: ${map.name.toUpperCase()}`);
  updateHud();
}

function finish(won) {
  running = false;
  hud.classList.add('hidden');
  endScreen.classList.add('active');
  const endTitle = document.getElementById('end-title');
  const endCopy = document.getElementById('end-copy');
  const endKicker = document.getElementById('end-kicker');

  if (won) {
    endKicker.textContent = 'MISSION REPORT';
    endTitle.textContent = 'MISSION COMPLETE';
    endCopy.textContent = `Zone secured. ${kills} hostiles neutralized and ${intel} intel drive(s) recovered in ${Math.floor(elapsed)} seconds.`;
  } else {
    endKicker.textContent = 'MISSION REPORT';
    endTitle.textContent = 'MISSION FAILED';
    endCopy.textContent = 'The zone went hot before extraction. Re-enter the operation and try again.';
  }
}

function reload() {
  if (!running || reloading || ammo >= 30 || reserve <= 0) return;
  reloading = true;
  setMessage('RELOADING');
  setTimeout(() => {
    const need = 30 - ammo;
    const used = Math.min(need, reserve);
    ammo += used;
    reserve -= used;
    reloading = false;
    updateHud();
  }, 420);
}

function shoot() {
  if (!running || reloading) return;
  if (ammo <= 0) {
    reload();
    return;
  }

  ammo -= 1;
  flash = 0.13;
  player.muzzle = 0.13;

  let bestTarget = null;
  let bestDistance = 99;

  for (const enemy of enemies) {
    if (enemy.dead) continue;
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const angle = norm(Math.atan2(dy, dx) - player.a);
    const d = Math.hypot(dx, dy);
    if (Math.abs(angle) < 0.08 && d < bestDistance && !blocked(player.x, player.y, enemy.x, enemy.y)) {
      bestTarget = enemy;
      bestDistance = d;
    }
  }

  if (bestTarget) {
    bestTarget.hp -= 45;
    bestTarget.alert = 1;
    hitMarker.classList.add('show');
    setTimeout(() => hitMarker.classList.remove('show'), 80);
    if (bestTarget.hp <= 0) {
      bestTarget.dead = true;
      kills += 1;
      setMessage(`${bestTarget.role.toUpperCase()} DOWN`);
      if (intel >= 2 && kills === enemies.length) finish(true);
    }
  }

  updateHud();
}

function blocked(x1, y1, x2, y2) {
  const steps = Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 8);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const px = x1 + (x2 - x1) * t;
    const py = y1 + (y2 - y1) * t;
    if (wallAt(px, py)) return true;
  }
  return false;
}

function pickupItem() {
  for (const item of pickups) {
    if (item.picked) continue;
    if (dist(player.x, player.y, item.x, item.y) < 0.7) {
      item.picked = true;
      if (item.kind === 'intel') {
        intel += 1;
        setMessage('INTEL RECOVERED');
      }
      if (item.kind === 'ammo') {
        reserve += 30;
        setMessage('AMMO CACHE');
      }
      if (item.kind === 'medkit') {
        player.hp = Math.min(100, player.hp + 25);
        setMessage('MEDKIT');
      }
      updateHud();
      if (intel >= 2 && kills === enemies.length) finish(true);
    }
  }
}

function move(dt) {
  const sprinting = keys.ShiftLeft || keys.ShiftRight;
  const speed = PLAYER_SPEED * (sprinting ? SPRINT_MULTIPLIER : 1);
  const forward = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
  const strafe = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  const len = Math.hypot(forward, strafe) || 1;
  const fx = forward / len;
  const sy = strafe / len;

  const dx = Math.cos(player.a) * fx + Math.cos(player.a + Math.PI / 2) * sy;
  const dy = Math.sin(player.a) * fx + Math.sin(player.a + Math.PI / 2) * sy;

  let nx = player.x + dx * speed * dt;
  let ny = player.y + dy * speed * dt;
  if (!wallAt(nx, player.y)) player.x = nx;
  if (!wallAt(player.x, ny)) player.y = ny;

  player.x = Math.max(1.2, Math.min(currentMap.grid[0].length - 1.2, player.x));
  player.y = Math.max(1.2, Math.min(currentMap.grid.length - 1.2, player.y));
}

function updateEnemyAI(dt) {
  for (const enemy of enemies) {
    if (enemy.dead) continue;
    enemy.muzzle = Math.max(0, enemy.muzzle - dt);
    enemy.shot -= dt;

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const d = Math.hypot(dx, dy) || 1;
    const nx = dx / d;
    const ny = dy / d;

    const targetSpeed = enemy.role === 'leader' ? 0.85 : 0.58;
    const nextX = enemy.x + nx * dt * targetSpeed;
    const nextY = enemy.y + ny * dt * targetSpeed;
    const canMove = !wallAt(nextX, enemy.y) && !wallAt(enemy.x, nextY);
    if (canMove) {
      enemy.x = nextX;
      enemy.y = nextY;
    }

    if (d < 7 && enemy.shot <= 0 && !blocked(enemy.x, enemy.y, player.x, player.y)) {
      enemy.shot = enemy.role === 'leader' ? 1.2 + Math.random() * 0.6 : 1.8 + Math.random() * 0.7;
      enemy.muzzle = 0.15;
      player.hp -= enemy.role === 'leader' ? 12 : 8;
      damageFlash = 0.22;
      if (player.hp <= 0) finish(false);
    }
  }
}

function raycast(angle) {
  let distance = 0;
  while (distance < VIEW_DISTANCE) {
    distance += 0.02;
    const tx = player.x + Math.cos(angle) * distance;
    const ty = player.y + Math.sin(angle) * distance;
    if (wallAt(tx, ty)) return distance;
  }
  return VIEW_DISTANCE;
}

function render() {
  ctx.clearRect(0, 0, W, H);
  const horizon = H / 2;

  ctx.fillStyle = '#0b121a';
  ctx.fillRect(0, 0, W, horizon);

  const sky = ctx.createLinearGradient(0, 0, 0, horizon);
  sky.addColorStop(0, '#0a1320');
  sky.addColorStop(1, '#1a2d38');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, horizon);

  const floor = ctx.createLinearGradient(0, horizon, 0, H);
  floor.addColorStop(0, '#1d312d');
  floor.addColorStop(1, '#0d1717');
  ctx.fillStyle = floor;
  ctx.fillRect(0, horizon, W, H - horizon);

  for (let x = 0; x < W; x += 3) {
    const angle = player.a - FOV / 2 + (x / W) * FOV;
    const dist = raycast(angle);
    const wallHeight = Math.min(H, (H / dist) * 0.9);
    const top = horizon - wallHeight / 2;
    const shade = Math.max(0, 1 - dist / VIEW_DISTANCE);
    const lum = Math.floor(58 + shade * 75);
    ctx.fillStyle = `rgba(${lum}, ${Math.floor(72 + shade * 48)}, ${Math.floor(76 + shade * 38)}, 1)`;
    ctx.fillRect(x, top, 3, wallHeight);
  }

  for (const pickup of pickups) {
    if (pickup.picked) continue;
    const dx = pickup.x - player.x;
    const dy = pickup.y - player.y;
    const d = Math.hypot(dx, dy);
    const ang = norm(Math.atan2(dy, dx) - player.a);
    if (Math.abs(ang) < FOV * 0.8 && d < VIEW_DISTANCE) {
      const screenX = W / 2 + Math.tan(ang) * W * 0.7;
      const screenY = H / 2 + 15;
      const size = (1 / d) * 700;
      ctx.fillStyle = pickup.kind === 'intel' ? '#7feaff' : pickup.kind === 'ammo' ? '#ffd67a' : '#7bffa4';
      ctx.fillRect(screenX - size * 0.12, screenY - size * 0.28, size * 0.24, size * 0.56);
    }
  }

  for (const enemy of enemies) {
    if (enemy.dead) continue;
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const d = Math.hypot(dx, dy);
    const ang = norm(Math.atan2(dy, dx) - player.a);
    if (Math.abs(ang) < FOV * 0.82 && d < VIEW_DISTANCE) {
      const screenX = W / 2 + Math.tan(ang) * W * 0.7;
      const screenY = H / 2 + 16;
      const size = (1 / d) * 760;
      ctx.fillStyle = enemy.role === 'leader' ? '#ff8a8a' : '#dfe7ee';
      ctx.fillRect(screenX - size * 0.12, screenY - size * 0.28, size * 0.24, size * 0.56);
      ctx.fillStyle = '#0d1519';
      ctx.fillRect(screenX - size * 0.18, screenY - size * 0.38, size * 0.36, 4);
      ctx.fillStyle = '#86ffb2';
      ctx.fillRect(screenX - size * 0.18, screenY - size * 0.38, size * 0.36 * (enemy.hp / 100), 4);
    }
  }

  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flash})`;
    ctx.fillRect(0, 0, W, H);
  }

  if (damageFlash > 0) {
    ctx.fillStyle = `rgba(192, 45, 45, ${damageFlash * 0.8})`;
    ctx.fillRect(0, 0, W, H);
  }

  if (showMap) drawMap();
}

function drawMap() {
  const cell = 10;
  mctx.fillStyle = '#0b120d';
  mctx.fillRect(0, 0, 170, 170);
  const grid = currentMap.grid;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      mctx.fillStyle = grid[y][x] === '#' ? '#58715b' : '#141f1a';
      mctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }

  mctx.fillStyle = '#7feaff';
  mctx.beginPath();
  mctx.arc(player.x * cell, player.y * cell, 3, 0, Math.PI * 2);
  mctx.fill();

  for (const enemy of enemies) {
    if (enemy.dead) continue;
    mctx.fillStyle = enemy.role === 'leader' ? '#ff7d7d' : '#edf5ff';
    mctx.fillRect(enemy.x * cell - 2, enemy.y * cell - 2, 4, 4);
  }

  for (const pickup of pickups) {
    if (pickup.picked) continue;
    mctx.fillStyle = pickup.kind === 'intel' ? '#7feaff' : pickup.kind === 'ammo' ? '#ffd67a' : '#7bffa4';
    mctx.fillRect(pickup.x * cell - 2, pickup.y * cell - 2, 4, 4);
  }
}

function loop(ts) {
  const dt = Math.min(0.05, (ts - lastFrame) / 1000 || 0.016);
  lastFrame = ts;

  if (running) {
    elapsed += dt;
    move(dt);
    updateEnemyAI(dt);
    pickupItem();
    flash = Math.max(0, flash - dt * 2.2);
    damageFlash = Math.max(0, damageFlash - dt * 2.1);
    updateHud();
  }

  render();
  requestAnimationFrame(loop);
}

function onKeyDown(event) {
  keys[event.code] = true;
  if (event.code === 'KeyR') reload();
  if (event.code === 'KeyM' && running) {
    showMap = !showMap;
    mapToggle.classList.toggle('hidden', !showMap);
  }
  if (event.code === 'Enter' && !running) {
    briefing.classList.remove('active');
    hud.classList.remove('hidden');
    resetMission();
  }
}

function onKeyUp(event) {
  keys[event.code] = false;
}

function onMouseMove(event) {
  if (pointerLocked && running) {
    player.a += event.movementX * 0.0032;
  }
}

function onMouseDown() {
  if (running) {
    mouseDown = true;
    shoot();
  }
}

function onMouseUp() {
  mouseDown = false;
}

window.addEventListener('resize', resize);
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);

canvas.addEventListener('click', () => {
  if (running) {
    canvas.requestPointerLock();
  }
});

document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === canvas;
});

document.querySelectorAll('.map-option').forEach((button) => {
  button.addEventListener('click', () => {
    const index = Number(button.dataset.map);
    if (!Number.isNaN(index)) {
      setMap(index);
      if (!running) {
        objectiveEl.textContent = `CLEAR ${currentMap.name.toUpperCase()} HOSTILES`;
      }
    }
  });
});

document.getElementById('start-btn').addEventListener('click', () => {
  briefing.classList.remove('active');
  hud.classList.remove('hidden');
  resetMission();
});

document.getElementById('restart-btn').addEventListener('click', () => {
  endScreen.classList.remove('active');
  briefing.classList.add('active');
  hud.classList.add('hidden');
  resetMission();
});

setMap(0);
resize();
requestAnimationFrame(loop);
