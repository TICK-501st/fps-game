/* Camera-based movement layer for the canvas FPS.
   Adds jump physics, landing impact, sprint bob, and a subtle walking head-bob
   without changing the existing raycaster or collision model. */
(() => {
  const canvas = document.querySelector('#game');
  if (!canvas) return;

  const state = {
    grounded: true,
    y: 0,
    velocity: 0,
    bob: 0,
    jumpQueued: false,
    last: performance.now()
  };

  const GRAVITY = -22;
  const JUMP_SPEED = 8.2;
  const MAX_JUMP_HEIGHT = 1.55;
  const originalTransform = canvas.style.transform;

  addEventListener('keydown', event => {
    if (event.code === 'Space') {
      event.preventDefault();
      state.jumpQueued = true;
    }
  }, { passive: false });

  function update(now) {
    const dt = Math.min(0.05, (now - state.last) / 1000);
    state.last = now;

    const moving = keysAreMoving();
    const sprinting = window.__nightfallSprint === true;

    if (state.jumpQueued && state.grounded && typeof running !== 'undefined' && running && !paused) {
      state.velocity = JUMP_SPEED;
      state.grounded = false;
      state.jumpQueued = false;
    }
    state.jumpQueued = false;

    if (!state.grounded) {
      state.velocity += GRAVITY * dt;
      state.y += state.velocity * dt;
      if (state.y <= 0) {
        state.y = 0;
        state.velocity = 0;
        state.grounded = true;
      }
    }

    if (moving && state.grounded && typeof running !== 'undefined' && running && !paused) {
      state.bob += dt * (sprinting ? 13 : 9);
    }

    const bobX = moving && state.grounded ? Math.cos(state.bob) * (sprinting ? 2.2 : 1.2) : 0;
    const bobY = moving && state.grounded ? Math.abs(Math.sin(state.bob)) * (sprinting ? 3.6 : 2.2) : 0;
    const jumpOffset = -state.y * 24;
    const roll = moving && state.grounded ? Math.sin(state.bob) * (sprinting ? 0.18 : 0.1) : 0;
    canvas.style.transform = `${originalTransform} translate(${bobX}px, ${jumpOffset - bobY}px) rotate(${roll}deg)`;
    requestAnimationFrame(update);
  }

  function keysAreMoving() {
    return !!(window.__nightfallKeys && (window.__nightfallKeys.KeyW || window.__nightfallKeys.KeyA || window.__nightfallKeys.KeyS || window.__nightfallKeys.KeyD));
  }

  // The base game keeps its keyboard state private. Mirror it from key events
  // so this layer can drive camera bob and jump independently.
  window.__nightfallKeys = {};
  addEventListener('keydown', event => { window.__nightfallKeys[event.code] = true; });
  addEventListener('keyup', event => { window.__nightfallKeys[event.code] = false; });
  addEventListener('keydown', event => {
    window.__nightfallSprint = !!(event.shiftKey || event.code === 'ShiftLeft' || event.code === 'ShiftRight');
  });
  addEventListener('keyup', event => {
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') window.__nightfallSprint = false;
  });

  requestAnimationFrame(update);
})();
