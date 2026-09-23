function drawEnemyCharacter(enemy, screenX, screenY, size, alpha = 1) {
  const isLeader = enemy.role === 'leader';
  const torso = isLeader ? '#ff7a5a' : '#dfe7e6';
  const armor = isLeader ? '#f9c78a' : '#a7b7be';
  const accent = isLeader ? '#ffd5a1' : '#edf3f5';
  const outline = 'rgba(14,18,20,0.9)';

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(screenX, screenY + size * 0.16, size * 0.24, size * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = outline;
  ctx.lineWidth = Math.max(1, size * 0.015);

  ctx.fillStyle = torso;
  ctx.fillRect(screenX - size * 0.11, screenY - size * 0.2, size * 0.22, size * 0.45);
  ctx.strokeRect(screenX - size * 0.11, screenY - size * 0.2, size * 0.22, size * 0.45);

  ctx.fillStyle = armor;
  ctx.fillRect(screenX - size * 0.09, screenY - size * 0.08, size * 0.18, size * 0.18);
  ctx.strokeRect(screenX - size * 0.09, screenY - size * 0.08, size * 0.18, size * 0.18);

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(screenX, screenY - size * 0.38, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#1a1e22';
  ctx.fillRect(screenX - size * 0.09, screenY - size * 0.5, size * 0.18, size * 0.12);

  ctx.fillStyle = '#1a1e22';
  ctx.fillRect(screenX - size * 0.045, screenY + size * 0.25, size * 0.06, size * 0.23);
  ctx.fillRect(screenX - size * 0.12, screenY + size * 0.25, size * 0.06, size * 0.23);

  ctx.fillStyle = '#2d3238';
  ctx.fillRect(screenX + size * 0.08, screenY - size * 0.02, size * 0.24, size * 0.06);
  ctx.fillRect(screenX + size * 0.13, screenY - size * 0.08, size * 0.1, size * 0.18);

  ctx.fillStyle = '#71ffb5';
  ctx.fillRect(screenX - size * 0.18, screenY - size * 0.62, size * 0.36 * (enemy.hp / 100), 4);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.strokeRect(screenX - size * 0.18, screenY - size * 0.62, size * 0.36, 4);

  ctx.restore();
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
      drawEnemyCharacter(enemy, screenX, screenY, size, 1);
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
    mctx.fillRect(enemy.x * cell - 3, enemy.y * cell - 3, 6, 6);
    mctx.strokeStyle = enemy.role === 'leader' ? '#ffd2d2' : '#f3f7f7';
    mctx.strokeRect(enemy.x * cell - 4, enemy.y * cell - 4, 8, 8);
  }
}
