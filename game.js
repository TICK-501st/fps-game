const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const mapCanvas = document.querySelector('#minimap');
const mctx = mapCanvas.getContext('2d');

let W = 0, H = 0, dpr = 1;
let keys = {};
let mouseDown = false;
let running = false;
let paused = false;
let showMap = false;
let last = 0;
let elapsed = 0;
let flash = 0;
let damageFlash = 0;
let reloadTimer = null;
let lastToast = 0;

const TEAM_NAME = 'TASK FORCE NEMESIS';
const SQUAD_NAMES = ['Viper', 'Raptor', 'Ghost'];
const FOV = Math.PI / 3;
const VIEW_DISTANCE = 16;

const maps = [
  {
    name: 'Kestrel Yard',
    description: 'Open industrial yard with partial cover and long sight lines.',
    start: { x: 2.5, y: 2.5, a: 0 },
    grid: [
      '##################',
      '#..............##',
      '#..##....##....##',
      '#..............##',
      '#......#.......##',
      '#......#..#....##',
      '#..............##',
      '#..###....###...##',
      '#..............##',
      '#....#.......#..##',
      '#....#......#...##',
      '#...............##',
      '#..####....#....##',
      '#..............##',
      '##################'
    ],
    enemies: [
      { x: 12.5, y: 5.5, squad: 'Viper', role: 'leader' },
      { x: 10.5, y: 6.5, squad: 'Viper', role: 'rifleman' },
      { x: 9.5, y: 9.5, squad: 'Viper', role: 'rifleman' },
      { x: 14.5, y: 10.5, squad: 'Raptor', role: 'leader' },
      { x: 12.5, y: 11.5, squad: 'Raptor', role: 'rifleman' },
      { x: 15.5, y: 7.5, squad: 'Ghost', role: 'leader' }
    ],
    items: [
      { x: 4.5, y: 12.5 },
      { x: 16.5, y: 12.5 }
    ]
  },
  {
    name: 'Iron Line',
    description: 'A rail-cut patrol route with narrow choke points and hard angles.',
    start: { x: 2.5, y: 10.5, a: 0 },
    grid: [
      '##################',
      '#...#........#..##',
      '#...#..##....#..##',
      '#.............#..##',
      '###.####.###..#..##',
      '#...#....#....#..##',
      '#...#....#....#..##',
      '#.............#..##',
      '#.#####.#####.#..##',
      '#.............#..##',
      '#..#..#..#....#..##',
      '#..#..#..#....#..##',
      '#.............#..##',
      '#.............#..##',
      '##################'
    ],
    enemies: [
      { x: 11.5, y: 4.5, squad: 'Raptor', role: 'leader' },
      { x: 13.5, y: 4.5, squad: 'Raptor', role: 'rifleman' },
      { x: 15.5, y: 8.5, squad: 'Viper', role: 'leader' },
      { x: 15.5, y: 10.5, squad: 'Viper', role: 'rifleman' },
      { x: 9.5, y: 8.5, squad: 'Ghost', role: 'leader' },
      { x: 6.5, y: 10.5, squad: 'Ghost', role: 'rifleman' }
    ],
    items: [
      { x: 13.5, y: 12.5 },
      { x: 5.5, y: 4.5 }
    ]
  },
  {
    name: 'Echo Depot',
    description: 'Warehouse ruins and collapsed columns force close-quarters combat.',
    start: { x: 2.5, y: 2.5, a: 0 },
    grid: [
      '##################',
      '#..............##',
      '#.###..###.....##',
      '#.....#........##',
      '#.###.#.###....##',
      '#.#...#...#....##',
      '#.#.###.#.#....##',
      '#...#...#.#....##',
      '#.###.#.#.#....##',
      '#.....#...#....##',
      '#.#####.#.###..##',
      '#..............##',
      '#..##....##....##',
      '#..............##',
      '##################'
    ],
    enemies: [
      { x: 11.5, y: 4.5, squad: 'Ghost', role: 'leader' },
      { x: 9.5, y: 5.5, squad: 'Ghost', role: 'rifleman' },
      { x: 14.5, y: 7.5, squad: 'Ghost', role: 'rifleman' },
      { x: 11.5, y: 9.5, squad: 'Raptor', role: 'leader' },
      { x: 8.5, y: 10.5, squad: 'Raptor', role: 'rifleman' },
      { x: 14.5, y: 11.5, squad: 'Viper', role: 'leader' }
    ],
    items: [
      { x: 5.5, y: 12.5 },
      { x: 14.5, y: 2.5 }
    ]
  },
  {
    name: 'Stone Ridge',
    description: 'High ground, commanding angles, and rocky cover over a narrow canyon.',
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
      { x: 12.5, y: 3.5, squad: 'Viper', role: 'leader' },
      { x: 11.5, y: 5.5, squad: 'Viper', role: 'rifleman' },
      { x: 14.5, y: 7.5, squad: 'Raptor', role: 'leader' },
      { x: 10.5, y: 8.5, squad: 'Raptor', role: 'rifleman' },
      { x: 13.5, y: 11.5, squad: 'Ghost', role: 'leader' },
      { x: 8.5, y: 9.5, squad: 'Ghost', role: 'rifleman' }
    ],
    items: [
      { x: 15.5, y: 12.5 },
      { x: 5.5, y: 3.5 }
    ]
  },
  {
    name: 'Ghost Basin',
    description: 'Low-light basin terrain with blind corners and broken sight lines.',
    start: { x: 2.5, y: 2.5, a: 0 },
    grid: [
      '##################',
      '#..............##',
      '#.####..####....##',
      '#......#........##',
      '#.##..#..##.....##',
      '#....#..#.......##',
      '#.##....##.###..##',
      '#......#........##',
      '#..##..#..##....##',
      '#....#....#.....##',
      '#.##.#.##.#.....##',
      '#....#....#.....##',
      '#..##....##.....##',
      '#..............##',
      '##################'
    ],
    enemies: [
      { x: 12.5, y: 3.5, squad: 'Ghost', role: 'leader' },
      { x: 13.5, y: 5.5, squad: 'Ghost', role: 'rifleman' },
      { x: 11.5, y: 7.5, squad: 'Ghost', role: 'rifleman' },
      { x: 15.5, y: 10.5, squad: 'Viper', role: 'leader' },
      { x: 8.5, y: 10.5, squad: 'Viper', role: 'rifleman' },
      { x: 12.5, y: 12.5, squad: 'Raptor', role: 'leader' }
    ],
    items: [
      { x: 16.5, y: 4.5 },
      { x: 5.5, y: 11.5 }
    ]
  }
];

let currentMapIndex = 0;
let currentMap = maps[currentMapIndex];
let player = null;
let enemies = [];
let items = [];
let ammo = 30;
let reserve = 120;
let kills = 0;
let intel = 0;
let reloading = false;

function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function wallAt(x, y) {
  const gx = Math.floor(x);
  const gy = Math.floor(y);
  if (gx < 0 || gy < 0 || gy >= currentMap.grid.length || gx >= currentMap.grid[0].length) return true;
  return currentMap.grid[gy][gx] === '#';
}

function dist(a, b, c, d) {
  return Math.hypot(a - c, b - d);
}

function norm(a) {
  while (a < -Math.PI) a += Math.PI * 2;
  while (a > Math.PI) a -= Math.PI * 2;
  return a;
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

function squadAssignments(n) {
  const a = [];
  for (let i = 0; i < n; i++) {
    a.push({ team: TEAM_NAME, squad: SQUAD_NAMES[i % SQUAD_NAMES.length] });
  }
  return a;
}

function toast(message) {
  const el = document.querySelector('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(lastToast);
  lastToast = setTimeout(() => el.classList.remove('show'), 2200);
}

function updateHud() {
  const health = document.querySelector('#health-value');
  const progress = document.querySelector('#health-progress');
  const ammoEl = document.querySelector('#ammo');
  const intelEl = document.querySelector('#intel');
  const objective = document.querySelector('#objective');
  if (health) health.textContent = Math.max(0, Math.ceil(player.hp));
  if (progress) progress.style.width = Math.max(0, player.hp) + '%';
  if (ammoEl) ammoEl.textContent = `${ammo} / ${reserve}`;
  if (intelEl) intelEl.textContent = `${intel} / 2`;
  if (objective) objective.textContent = `CLEAR ${currentMap.name.toUpperCase()} HOSTILES`;
}

function updateMissionText() {
  document.querySelector('#objective').textContent = `CLEAR ${currentMap.name.toUpperCase()} HOSTILES`;
}

function reset() {
  const map = currentMap;
  player = { x: map.start.x, y: map.start.y, a: map.start.a, hp: 100, muzzle: 0 };
  enemies = map.enemies.map((pt, index) => ({
    x: pt.x,
    y: pt.y,
    hp: 100,
    alert: 0,
    shot: Math.random() * 1.8,
    muzzle: 0,
    dead: false,
    death: 0,
    despawn: 0,
    squad: pt.squad || SQUAD_NAMES[index % SQUAD_NAMES.length],
    role: pt.role || (index % 3 === 0 ? 'leader' : 'rifleman'),
    team: TEAM_NAME,
    order: index,
    lastKnown: null
  }));
  items = map.items.map((pt) => ({ x: pt.x, y: pt.y, got: false }));
  elapsed = 0;
  kills = 0;
  intel = 0;
  ammo = 30;
  reserve = 120;
  reloading = false;
  running = true;
  paused = false;
  showMap = false;
  flash = 0;
  damageFlash = 0;
  toast(`OPERATION: ${map.name.toUpperCase()}`);
  updateHud();
  updateMissionText();
}

function finish(won) {
  running = false;
  document.querySelector('#hud').classList.add('hidden');
  document.querySelector('#end-screen').classList.add('active');
  const endTitle = document.querySelector('#end-title');
  const endCopy = document.querySelector('#end-copy');
  const endKicker = document.querySelector('#end-kicker');
  if (won) {
    endKicker.textContent = 'MISSION REPORT';
    endTitle.textContent = 'MISSION COMPLETE';
    endCopy.textContent = `Objective recovered. ${kills} hostiles neutralized in ${Math.floor(elapsed)} seconds.`;
  } else {
    endKicker.textContent = 'MISSION REPORT';
    endTitle.textContent = 'MISSION FAILED';
    endCopy.textContent = 'The outpost fell silent before extraction. Re-enter the operation to retry.';
  }
}

function reload() {
  if (reloading || ammo === 30 || reserve <= 0) return;
  reloading = true;
  toast('RELOADING');
  setTimeout(() => {
    const needed = 30 - ammo;
    const used = Math.min(needed, reserve);
    ammo += used;
    reserve -= used;
    reloading = false;
    updateHud();
  }, 450);
}

function membersOfSquad(enemy) {
  return enemies.filter((x) => !x.dead && x.squad === enemy.squad);
}

function enemyAI(dt) {
  for (const enemy of enemies) {
    if (enemy.dead) {
      enemy.death = Math.min(1, enemy.death + dt / 0.45);
      enemy.despawn = Math.max(0, enemy.despawn - dt);
      continue;
    }

    enemy.muzzle = Math.max(0, enemy.muzzle - dt);
    enemy.shot -= dt;

    const squad = membersOfSquad(enemy);
    const leader = squad.find((x) => !x.dead && x.role === 'leader') || null;
    const leaderless = !leader && squad.length > 0;

    if (leaderless) {
      const drift = (performance.now() * 0.004) + enemy.order;
      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const d = Math.hypot(dx, dy) || 1;
      const vx = dx / d;
      const vy = dy / d;
      const offsetX = Math.cos(drift + enemy.order) * 0.18;
      const offsetY = Math.sin(drift * 1.6 + enemy.order) * 0.18;

      if (d < 5) {
        enemy.x -= vx * dt * 0.45;
        enemy.y -= vy * dt * 0.45;
      }
      enemy.x += offsetX * dt;
      enemy.y += offsetY * dt;

      if (Math.random() < 0.02 && enemy.shot <= 0) {
        enemy.shot = 1.8 + Math.random() * 1.4;
        if (d < 8 && Math.random() < 0.35) {
          player.hp -= 7 + Math.random() * 5;
          damageFlash = 0.2;
        }
      }
      continue;
    }

    let targetX = player.x;
    let targetY = player.y;
    if (enemy.role === 'leader') {
      targetX = player.x;
      targetY = player.y;
    } else {
      const lead = leader || enemy;
      targetX = lead ? lead.x : player.x;
      targetY = lead ? lead.y : player.y;
      if (dist(enemy.x, enemy.y, player.x, player.y) < 6 && leader) {
        targetX = player.x + Math.sin(enemy.order + elapsed) * 0.6;
        targetY = player.y + Math.cos(enemy.order + elapsed) * 0.6;
      }
    }

    const dx = targetX - enemy.x;
    const dy = targetY - enemy.y;
    const d = Math.hypot(dx, dy) || 1;
    const nx = dx / d;
    const ny = dy / d;

    let moveSpeed = 0.75;
    if (enemy.role === 'leader') moveSpeed = 0.9;
    if (enemy.role === 'rifleman') moveSpeed = 0.53;

    const nextX = enemy.x + nx * dt * moveSpeed;
    const nextY = enemy.y + ny * dt * moveSpeed;
    const canMove = !wallAt(nextX, enemy.y) && !wallAt(enemy.x, nextY);
    if (canMove) {
      enemy.x = nextX;
      enemy.y = nextY;
    }

    if (d < 7 && enemy.shot <= 0 && !blocked(enemy.x, enemy.y, player.x, player.y)) {
      enemy.shot = enemy.role === 'leader' ? 1.1 + Math.random() * 0.7 : 1.6 + Math.random() * 0.8;
      enemy.muzzle = 0.16;
      player.hp -= enemy.role === 'leader' ? 10 : 7;
      damageFlash = 0.2;
      if (player.hp <= 0) finish(false);
    }

    if (enemy.role !== 'leader') enemy.alert = Math.min(1, enemy.alert + dt * 0.2);
  }
}

function shoot() {
  if (!running || paused || reloading) return;
  if (ammo <= 0) {
    reload();
    return;
  }

  ammo -= 1;
  flash = 0.12;
  player.muzzle = 0.12;

  let hitEnemy = null;
  let best = 99;

  for (const enemy of enemies) {
    if (enemy.dead) continue;
    const a = Math.atan2(enemy.y - player.y, enemy.x - player.x) - player.a;
    const distTo = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (Math.abs(a) < 0.08 && distTo < best && !blocked(player.x, player.y, enemy.x, enemy.y)) {
      hitEnemy = enemy;
      best = distTo;
    }
  }

  if (hitEnemy) {
    hitEnemy.hp -= 50;
    hitEnemy.alert = 1;
    if (hitEnemy.hp <= 0) {
      hitEnemy.dead = true;
      hitEnemy.death = 0;
      hitEnemy.despawn = 5;
      kills += 1;
      toast(`${hitEnemy.squad.toUpperCase()} MEMBER DOWN`);
      updateHud();
    }
  }

  updateHud();
}

function collect() {
  for (const pickup of items) {
    if (!pickup.got && dist(player.x, player.y, pickup.x, pickup.y) < 0.7) {
      pickup.got = true;
      intel += 1;
      toast('INTEL DRIVE RECOVERED');
      if (intel >= 2 && enemies.every((enemy) => enemy.dead)) finish(true);
    }
  }
  if (intel >= 2 && enemies.every((enemy) => enemy.dead)) finish(true);
}

function move(dt) {
  const sprint = keys.ShiftLeft || keys.ShiftRight;
  const speed = sprint ? 3.8 : 2.35;
  const f = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0);
  const s = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
  const len = Math.hypot(f, s) || 1;
  const fx = f / len;
  const sy = s / len;

  const dx = Math.cos(player.a) * fx + Math.cos(player.a + Math.PI / 2) * sy;
  const dy = Math.sin(player.a) * fx + Math.sin(player.a + Math.PI / 2) * sy;

  let nx = player.x + dx * speed * dt;
  let ny = player.y + dy * speed * dt;

  if (!wallAt(nx, player.y)) player.x = nx;
  if (!wallAt(player.x, ny)) player.y = ny;

  if (player.x < 1.2) player.x = 1.2;
  if (player.y < 1.2) player.y = 1.2;
  if (player.x > currentMap.grid[0].length - 1.2) player.x = currentMap.grid[0].length - 1.2;
  if (player.y > currentMap.grid.length - 1.2) player.y = currentMap.grid.length - 1.2;
}

function raycast(angle) {
  let distance = 0;
  let hit = false;
  while (!hit && distance < VIEW_DISTANCE) {
    distance += 0.02;
    const tx = player.x + Math.cos(angle) * distance;
    const ty = player.y + Math.sin(angle) * distance;
    if (wallAt(tx, ty)) hit = true;
  }
  return distance;
}

function render() {
  const h = H / 2;
  ctx.fillStyle = '#0b1318';
  ctx.fillRect(0, 0, W, h);

  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, '#09151d');
  sky.addColorStop(1, '#1b2d33');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, h);

  const floor = ctx.createLinearGradient(0, h, 0, H);
  floor.addColorStop(0, '#1d2f2d');
  floor.addColorStop(1, '#0f1715');
  ctx.fillStyle = floor;
  ctx.fillRect(0, h, W, H - h);

  for (let x = 0; x < W; x += 3) {
    const angle = player.a - FOV / 2 + (x / W) * FOV;
    const dist = raycast(angle);
    const wallHeight = Math.min(H, (H / dist) * 0.9);
    const top = H / 2 - wallHeight / 2;
    const shade = Math.max(0, 1 - dist / VIEW_DISTANCE);
    ctx.fillStyle = `rgba(${Math.floor(65 + shade * 55)}, ${Math.floor(90 + shade * 55)}, ${Math.floor(86 + shade * 30)}, 1)`;
    ctx.fillRect(x, top, 3, wallHeight);
  }

  for (const item of items) {
    if (item.got) continue;
    const dx = item.x - player.x;
    const dy = item.y - player.y;
    const d = Math.hypot(dx, dy);
    const ang = norm(Math.atan2(dy, dx) - player.a);
    const size = (1 / d) * 900;
    if (Math.abs(ang) < FOV * 0.8 && d < VIEW_DISTANCE) {
      const screenX = W / 2 + Math.tan(ang) * W * 0.7;
      const screenY = H / 2 + 20;
      ctx.fillStyle = '#9ef5ff';
      ctx.fillRect(screenX - 3, screenY - size * 0.3, 6, size * 0.6);
    }
  }

  for (const enemy of enemies) {
    if (enemy.dead) continue;
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const d = Math.hypot(dx, dy);
    const ang = norm(Math.atan2(dy, dx) - player.a);
    if (Math.abs(ang) < FOV * 0.8 && d < VIEW_DISTANCE) {
      const screenX = W / 2 + Math.tan(ang) * W * 0.7;
      const screenY = H / 2 + 18;
      const size = (1 / d) * 770;
      ctx.fillStyle = enemy.role === 'leader' ? '#ff7070' : '#d3d8d6';
      ctx.fillRect(screenX - size * 0.12, screenY - size * 0.28, size * 0.24, size * 0.56);
      ctx.fillStyle = '#111';
      ctx.fillRect(screenX - size * 0.18, screenY - size * 0.38, size * 0.36, 4);
      ctx.fillStyle = '#6fff9f';
      ctx.fillRect(screenX - size * 0.18, screenY - size * 0.38, size * 0.36 * (enemy.hp / 100), 4);
    }
  }

  if (flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${flash})`;
    ctx.fillRect(0, 0, W, H);
  }

  if (damageFlash > 0) {
    ctx.fillStyle = `rgba(180, 30, 30, ${damageFlash * 0.8})`;
    ctx.fillRect(0, 0, W, H);
  }

  if (showMap) drawMiniMap();
}

function drawMiniMap() {
  const mapW = 170;
  const mapH = 170;
  mctx.fillStyle = '#0b120d';
  mctx.fillRect(0, 0, mapW, mapH);
  const grid = currentMap.grid;
  const cell = 10;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === '#') {
        mctx.fillStyle = '#5f6c5d';
      } else {
        mctx.fillStyle = '#1a281d';
      }
      mctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }

  mctx.fillStyle = '#9ee7ff';
  mctx.beginPath();
  mctx.arc(player.x * cell, player.y * cell, 2.5, 0, Math.PI * 2);
  mctx.fill();

  for (const enemy of enemies) {
    if (enemy.dead) continue;
    mctx.fillStyle = enemy.role === 'leader' ? '#ff7f7f' : '#dfe5e2';
    mctx.fillRect(enemy.x * cell - 2, enemy.y * cell - 2, 4, 4);
  }
}

function loop(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000 || 0);
  last = ts;

  if (running && !paused) {
    elapsed += dt;
    move(dt);
    enemyAI(dt);
    collect();
    flash = Math.max(0, flash - dt * 2.2);
    damageFlash = Math.max(0, damageFlash - dt * 1.8);
    document.querySelector('#timer').textContent = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(Math.floor(elapsed % 60)).padStart(2, '0')}`;
    if (player.hp <= 0) finish(false);
  }

  render();
  requestAnimationFrame(loop);
}

function onKeyDown(event) {
  keys[event.code] = true;
  if (event.code === 'KeyR') reload();
  if (event.code === 'KeyM' && running) {
    showMap = !showMap;
    document.querySelector('#map').classList.toggle('hidden', !showMap);
  }
  if (event.code === 'Enter' && !running) {
    document.querySelector('#briefing').classList.remove('active');
    document.querySelector('#hud').classList.remove('hidden');
    reset();
  }
}

function onKeyUp(event) {
  keys[event.code] = false;
}

function onMouseMove(event) {
  if (document.pointerLockElement === canvas && running && !paused) {
    player.a += event.movementX * 0.0032;
  }
}

function onMouseDown() {
  if (running && !paused) {
    mouseDown = true;
    shoot();
  }
}

function onMouseUp() {
  mouseDown = false;
}

function bindMapPicker() {
  document.querySelectorAll('.map-option').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.map);
      if (!Number.isNaN(index)) {
        currentMapIndex = index;
        currentMap = maps[currentMapIndex];
        document.querySelectorAll('.map-option').forEach((b) => b.classList.toggle('active', b === button));
        toast(currentMap.name.toUpperCase());
        if (!running) {
          document.querySelector('#objective').textContent = `CLEAR ${currentMap.name.toUpperCase()} HOSTILES`;
        }
      }
    });
  });
}

window.addEventListener('resize', resize);
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);
window.addEventListener('mousemove', onMouseMove);
window.addEventListener('mousedown', onMouseDown);
window.addEventListener('mouseup', onMouseUp);

canvas.addEventListener('click', () => {
  if (running) canvas.requestPointerLock();
});

document.querySelector('#start-btn').addEventListener('click', () => {
  document.querySelector('#briefing').classList.remove('active');
  document.querySelector('#hud').classList.remove('hidden');
  reset();
});

document.querySelector('#restart-btn').addEventListener('click', () => {
  document.querySelector('#end-screen').classList.remove('active');
  document.querySelector('#briefing').classList.add('active');
  document.querySelector('#hud').classList.add('hidden');
  currentMap = maps[currentMapIndex];
  updateMissionText();
});

bindMapPicker();
resize();
currentMap = maps[currentMapIndex];
updateMissionText();
requestAnimationFrame(loop);
