function spawnEnemy(state, canvas, GAME_CONSTANTS, forcedType) {
  let type = forcedType || "miniom";
  if (!forcedType) {
    const weights = GAME_CONSTANTS.ENEMY_SPAWN_WEIGHTS;
    const entries = [
      ["miniom", weights.miniom, 0],
      ["tanker", weights.tanker, 3600],
      ["voador", weights.voador, 7200],
      ["troll", weights.troll, 14400],
    ].filter(([t, _w, frame]) => state.timeFrames >= frame);
    const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
    let r = Math.random() * totalWeight;
    for (const [t, w] of entries) {
      if (r < w) {
        type = t;
        break;
      }
      r -= w;
    }
  }

  const baseStats = GAME_CONSTANTS.ENEMY_BASE_STATS;
  const hpMult = Math.pow(GAME_CONSTANTS.ENEMY_HP_LEVEL_COEFF, state.level - 1);
  const speedMult = Math.pow(
    GAME_CONSTANTS.ENEMY_SPEED_LEVEL_COEFF,
    state.level - 1
  );
  const stats = baseStats[type];
  const groundY = canvas.height - stats.size - 30;
  const enemy = {
    x: canvas.width + 20 + Math.random() * 40,
    y:
      type === "voador"
        ? canvas.height / 2 + (Math.random() * 120 - 60)
        : groundY,
    speed: stats.speed * speedMult,
    hp: Math.floor(stats.hp * hpMult),
    maxHp: Math.floor(stats.hp * hpMult),
    size: stats.size,
    burn: 0,
    burnPct: 0,
    slow: 0,
    slowFactor: 1,
    knockback: 0,
    flash: 0,
    type,
    flying: type === "voador",
  };
  if (type === "voador") {
    enemy.baseY = enemy.y;
    enemy.zigzag = Math.random() < 0.5;
    enemy.angle = Math.random() * Math.PI * 2;
    enemy.amplitude = 30;
  }
  if (type === "miniom") {
    enemy.baseY = groundY;
    enemy.vy = 0;
    enemy.jumpCooldown =
      Math.floor(Math.random() * GAME_CONSTANTS.MINIOM_JUMP_COOLDOWN_VAR) +
      GAME_CONSTANTS.MINIOM_JUMP_COOLDOWN_MIN;
  }
  if (type === "tanker") {
    enemy.dashCooldown =
      Math.floor(Math.random() * GAME_CONSTANTS.TANKER_DASH_COOLDOWN_VAR) +
      GAME_CONSTANTS.TANKER_DASH_COOLDOWN_MIN;
    enemy.dashDuration = GAME_CONSTANTS.TANKER_DASH_DURATION;
    enemy.dashTime = 0;
  }
  state.enemies.push(enemy);
}

function spawnTrunk(state, canvas, GAME_CONSTANTS, troncoImg, x) {
  const barrier = {
    x,
    y: canvas.height - GAME_CONSTANTS.TRUNK_BASE_Y,
    width: 120,
    height: 120,
    hp: 20,
    elements: [],
    image: troncoImg,
    hostile: true,
  };
  state.barriers.push(barrier);
}

if (typeof module !== "undefined") {
  module.exports = { spawnEnemy, spawnTrunk };
} else {
  window.spawnEnemy = spawnEnemy;
  window.spawnTrunk = spawnTrunk;
}
