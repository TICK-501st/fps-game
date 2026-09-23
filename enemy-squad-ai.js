(() => {
  function normalizeEnemyRoles() {
    if (typeof enemies === 'undefined') return;
    enemies.forEach((enemy, index) => {
      if (!enemy.role) {
        enemy.role = index % 2 === 0 ? 'leader' : 'rifleman';
      }
    });
  }

  function getSquadLeader(squadName) {
    if (typeof enemies === 'undefined') return null;
    return enemies.find(enemy =>
      enemy.squad === squadName &&
      !enemy.dead &&
      enemy.role === 'leader'
    ) || null;
  }

  function applyLeaderlessSquadTactics(enemy, dt) {
    if (!enemy || enemy.dead || enemy.role === 'leader') return;

    const driftPhase = (performance.now() * 0.004) + (enemy.order || 0) * 3.2;
    const sideStepX = Math.cos(driftPhase) * 0.12;
    const sideStepY = Math.sin(driftPhase * 1.4) * 0.12;

    enemy.alert = Math.min(enemy.alert || 0, 1.2);
    enemy.shot = Math.max(enemy.shot || 0, 2.0 + Math.random() * 1.2);
    enemy.lastKnown = {
      x: player.x + (Math.random() - 0.5) * 2.8,
      y: player.y + (Math.random() - 0.5) * 2.8
    };

    const toPlayerX = player.x - enemy.x;
    const toPlayerY = player.y - enemy.y;
    const distance = Math.hypot(toPlayerX, toPlayerY) || 1;

    if (distance < 6) {
      enemy.x -= (toPlayerX / distance) * dt * 0.5;
      enemy.y -= (toPlayerY / distance) * dt * 0.5;
    }

    enemy.x += sideStepX * dt;
    enemy.y += sideStepY * dt;
  }

  const originalEnemyAI = typeof enemyAI === 'function' ? enemyAI : null;

  function patchedEnemyAI(dt) {
    normalizeEnemyRoles();

    if (typeof enemies !== 'undefined') {
      const squadNames = [...new Set(enemies.filter(enemy => !enemy.dead).map(enemy => enemy.squad))];

      for (const squadName of squadNames) {
        const leader = getSquadLeader(squadName);
        if (!leader) {
          enemies
            .filter(enemy => enemy.squad === squadName && !enemy.dead)
            .forEach(enemy => applyLeaderlessSquadTactics(enemy, dt));
        }
      }
    }

    if (typeof originalEnemyAI === 'function') {
      return originalEnemyAI(dt);
    }
  }

  window.enemyAI = patchedEnemyAI;
})();
