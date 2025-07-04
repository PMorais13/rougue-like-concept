function spawnEnemy(state, canvas, GAME_CONSTANTS, forcedType) {
  let type = forcedType || "miniom";
  if (!forcedType) {
    const weights = GAME_CONSTANTS.ENEMY_SPAWN_WEIGHTS;
    let miniomWeight = 100;
    const entries = [["miniom", miniomWeight, 0]];

    if (state.timeFrames >= 3600) {
      miniomWeight = 80;
      entries.push(["tanker", weights.tanker, 3600]);
    }
    if (state.timeFrames >= 7200) {
      miniomWeight = 70;
      entries.push(["voador", weights.voador, 7200]);
    }
    if (state.timeFrames >= 14400) {
      miniomWeight = 60;
      entries.push(["spider", weights.spider, 14400]);
    }
    if (state.timeFrames >= 18000) {
      miniomWeight = 50;
      entries.push(["troll", weights.troll, 18000]);
    }

    entries[0][1] = miniomWeight;

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
    x:
      type === "spider"
        ? Math.random() * (canvas.width - 200) + 160
        : canvas.width + 20 + Math.random() * 40,
    y:
      type === "voador"
        ? canvas.height / 2 + (Math.random() * 120 - 60)
        : type === "spider"
        ? -stats.size
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
    descending: type === "spider",
    groundY,
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
  if (type === "spider") {
    const extra = Math.floor(
      Math.max(0, state.timeFrames - 5 * 60 * 60) / 3600
    );
    enemy.speed += extra * 0.2;
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
