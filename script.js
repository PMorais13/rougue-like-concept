const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  player.y = canvas.height - 65;
});
const mageImg = new Image();
mageImg.src = "mage.png";
const goblinImg = new Image();
goblinImg.src = "goblin.png";
const orcImg = new Image();
orcImg.src = "orc.png";
const batImg = new Image();
batImg.src = "bat.png";
const magiaImg = new Image();
magiaImg.src = "magia.png";
const trollImg = new Image();
trollImg.src = "troll.png";
const troncoImg = new Image();
troncoImg.src = "tronco.png";

const state = {
  level: 1,
  xp: 0,
  xpToNext: 10,
  upgrades: { Q: [], W: [], E: [] },
  generalUpgrades: [],
  spellElements: { Q: [], W: [], E: [] },
  enemies: [],
  bullets: [],
  turrets: [],
  barriers: [],
  cooldowns: { Q: 0, W: 0, E: 0 },
  keys: {},
  autoFireTimer: 0,
  autoFireDelay: GAME_CONSTANTS.PLAYER_FIRE_COOLDOWN,
  baseDamage: 1,
  qDamageBonus: 0,
  wBonusHp: 0,
  eDamageBonus: 0,
  qCooldown: 300,
  turretFireDelay: GAME_CONSTANTS.TURRET_FIRE_COOLDOWN,
  barrierHeight: 40,
  bulletAOE: 0,
  pendingUpgrade: null,
  nextUpgrade: null,
  upgradeOptions: [],
  upgradeType: null,
  paused: false,
  mouseX: 0,
  mouseY: 0,
  spawnInterval: GAME_CONSTANTS.SPAWN_INTERVAL,
  spawnTimer: GAME_CONSTANTS.SPAWN_INTERVAL,
  spawnIncreaseTimer: GAME_CONSTANTS.SPAWN_INCREASE_TIMER,
  timeFrames: 0,
  beams: [],
  comboName: "",
  comboTimer: 0,
};

const player = {
  x: 100,
  y: canvas.height - 65,
  radius: 30,
  speed: GAME_CONSTANTS.PLAYER_SPEED,
};

function spawnEnemy(forcedType) {
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
  const mult = Math.pow(1.2, Math.floor(state.level / 5));
  const stats = baseStats[type];
  const groundY = canvas.height - stats.size - 30;
  const enemy = {
    x: canvas.width + 20 + Math.random() * 40,
    y:
      type === "voador"
        ? canvas.height / 2 + (Math.random() * 120 - 60)
        : groundY,
    speed: stats.speed,
    hp: Math.floor(stats.hp * mult),
    maxHp: Math.floor(stats.hp * mult),
    size: stats.size,
    burn: 0,
    burnPct: 0,
    slow: 0,
    slowFactor: 1,
    knockback: 0,
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
      GAME_CONSTANTS.MINIOM_JUMP_COOLDOWN_MIN; // 2-5 segundos
  }
  if (type === "tanker") {
    enemy.dashCooldown =
      Math.floor(Math.random() * GAME_CONSTANTS.TANKER_DASH_COOLDOWN_VAR) +
      GAME_CONSTANTS.TANKER_DASH_COOLDOWN_MIN;
    enemy.dashDuration = GAME_CONSTANTS.TANKER_DASH_DURATION;
    enemy.dashTime = 0;
  }
  // trolls não têm habilidades especiais
  state.enemies.push(enemy);
}

function shootBasic() {
  const angle = Math.atan2(state.mouseY - player.y, state.mouseX - player.x);
  const speed = GAME_CONSTANTS.BULLET_SPEED;
  state.bullets.push({
    x: player.x,
    y: player.y,
    dx: Math.cos(angle) * speed,
    dy: Math.sin(angle) * speed,
    dmg: state.baseDamage,
    elements: [],
    aoe: state.bulletAOE,
  });
}

function castQ() {
  if (state.cooldowns.Q > 0 || state.paused) return;
  const range = 15 + state.upgrades.Q.length * 10;
  state.cooldowns.Q = state.qCooldown;
  state.enemies.forEach((e) => {
    // calcula usando o centro do inimigo para acertar o Q em alvos grandes
    const centerY = e.y + e.size / 2;
    if (
      centerY > player.y - range &&
      centerY < player.y + range &&
      e.x > player.x
    ) {
      // usamos uma cópia para evitar mudar o array de elementos da magia
      applyElementEffects(e, state.spellElements.Q.slice());
      e.hp -= state.baseDamage + state.qDamageBonus;
    }
  });

  // efeito visual do relâmpago
  const cols = { Fire: "red", Ice: "cyan", Wind: "yellow" };
  let color = "white";
  state.spellElements.Q.forEach((el) => {
    if (cols[el]) color = cols[el];
  });
  const width = 4 + state.spellElements.Q.length * 2;
  const pts = [];
  for (let x = player.x; x < canvas.width; x += 20) {
    pts.push({
      x,
      y:
        player.y +
        (Math.random() - 0.5) * 10 * (state.spellElements.Q.length + 1),
    });
  }
  state.beams.push({ points: pts, color, width, frames: 10 });
}

function castW() {
  if (state.cooldowns.W > 0 || state.paused) return;
  state.cooldowns.W = 300;
  const extraHp = state.upgrades.W.length * 5;
  const barrier = {
    x: player.x + 60,
    y: player.y - 10,
    width: 20,
    height: state.barrierHeight,
    hp: 5 + state.level * 2 + extraHp + state.wBonusHp,
    elements: state.spellElements.W.slice(),
    hostile: false,
  };
  state.barriers.push(barrier);
}

function castE() {
  if (state.cooldowns.E > 0 || state.paused || state.turrets.length > 0) return;
  state.cooldowns.E = 300;
  const dmg = 1 + state.upgrades.E.length + state.eDamageBonus;
  state.turrets.push({
    x: player.x + 50,
    y: player.y,
    hp: 1,
    cooldown: 0,
    dmg,
  });
}

function spawnTrunk(x) {
  const barrier = {
    x,
    y: player.y - 10,
    width: 60,
    height: 60,
    hp: 20,
    elements: [],
    image: troncoImg,
    hostile: true,
  };
  state.barriers.push(barrier);
}

function getBulletColor(elements) {
  const map = { Fire: "red", Ice: "cyan", Wind: "yellow" };
  if (!elements || elements.length === 0) return "#c8a2c8";
  const last = elements[elements.length - 1];
  return map[last] || "#c8a2c8";
}

const elementOptions = ["Fire", "Ice", "Wind"];
const generalUpgradesPool = [
  UPGRADE_FAST_SHOT,
  UPGRADE_BASE_DAMAGE,
  UPGRADE_Q_DAMAGE,
  UPGRADE_W_HEALTH,
  UPGRADE_E_DAMAGE,
  UPGRADE_Q_COOLDOWN,
  UPGRADE_TURRET_FASTER,
  UPGRADE_BARRIER_HEIGHT,
  UPGRADE_BULLET_AOE,
];

const comboMap = {
  "Fire,Ice": "Vapor",
  "Fire,Wind": "Fogo Selvagem",
  "Ice,Wind": "Nevasca",
  "Fire,Fire": "Chama Azul",
  "Ice,Ice": "Geada Profunda",
  "Wind,Wind": "Tornado",
  "Fire,Fire,Fire": "Chama Branca",
  "Ice,Ice,Ice": "Era Glacial",
  "Wind,Wind,Wind": "Ciclone",
  "Fire,Fire,Ice": "Vapor Escaldante",
  "Fire,Fire,Wind": "Tempestade de Fogo",
  "Ice,Ice,Fire": "Gelo Candente",
  "Ice,Ice,Wind": "Nevasca Congelante",
  "Wind,Wind,Fire": "Furacão Flamejante",
  "Wind,Wind,Ice": "Tempestade Gélida",
  "Fire,Ice,Wind": "Tempestade Elemental",
};

function getComboName(elems) {
  if (!elems || elems.length < 2) return null;
  const key = elems.slice(0, 3).sort().join(",");
  return comboMap[key] || null;
}

function levelUp() {
  state.xp -= state.xpToNext;
  state.level++;
  state.xpToNext = Math.floor(state.xpToNext * GAME_CONSTANTS.XP_LEVEL_COEFF);

  const opts = [];
  while (opts.length < 3) {
    const rand =
      generalUpgradesPool[
        Math.floor(Math.random() * generalUpgradesPool.length)
      ];
    if (!opts.includes(rand)) opts.push(rand);
  }
  state.upgradeOptions = opts;
  state.pendingUpgrade = true;
  state.paused = true;
  state.upgradeType = "general";
  showGeneralUpgrades();
}

function applyElementUpgrade(key) {
  const up = state.nextUpgrade;
  if (!up) return;
  if (up.type === "element") {
    state.spellElements[key].push(up.element);
    state.upgrades[key].push(up.element);
  }
  state.pendingUpgrade = false;
  state.paused = false;
  state.nextUpgrade = null;
  state.upgradeType = null;
  document.getElementById("upgradePrompt").style.display = "none";
}

function showGeneralUpgrades() {
  const cont = document.getElementById("generalUpgradePrompt");
  cont.innerHTML = "";
  state.upgradeOptions.forEach((u, i) => {
    const div = document.createElement("div");
    div.className = "upgradeCard";
    div.textContent = u.desc;
    div.onclick = () => chooseUpgrade(i);
    cont.appendChild(div);
  });
  cont.style.display = "block";
}

function chooseUpgrade(idx) {
  if (state.upgradeType !== "general") return;
  const up = state.upgradeOptions[idx];
  applyStatUpgrade(up);
  state.upgradeOptions = [];
  state.upgradeType = null;
  document.getElementById("generalUpgradePrompt").style.display = "none";
  state.pendingUpgrade = false;
  state.paused = false;
  if (state.level % 5 === 0) {
    const el =
      elementOptions[Math.floor(Math.random() * elementOptions.length)];
    state.nextUpgrade = { type: "element", element: el, desc: el };
    state.pendingUpgrade = true;
    state.paused = true;
    document.getElementById("upgradeElement").textContent = el;
    document.getElementById("upgradePrompt").style.display = "block";
    state.upgradeType = "element";
  }
}

function applyStatUpgrade(up) {
  if (up.prop === "autoFireDelay") {
    state.autoFireDelay = Math.max(5, state.autoFireDelay + up.value);
  } else if (up.prop === "baseDamage") {
    state.baseDamage += up.value;
  } else if (up.prop === "qDamageBonus") {
    state.qDamageBonus += up.value;
  } else if (up.prop === "wBonusHp") {
    state.wBonusHp += up.value;
  } else if (up.prop === "eDamageBonus") {
    state.eDamageBonus += up.value;
  } else if (up.prop === "qCooldown") {
    state.qCooldown = Math.max(60, state.qCooldown + up.value);
  } else if (up.prop === "turretFireDelay") {
    state.turretFireDelay = Math.max(10, state.turretFireDelay + up.value);
  } else if (up.prop === "barrierHeight") {
    state.barrierHeight += up.value;
  } else if (up.prop === "bulletAOE") {
    state.bulletAOE += up.value;
  }
  state.generalUpgrades.push(up.desc);
}

function formatTime(frames) {
  const sec = Math.floor(frames / 60);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ":" + (s < 10 ? "0" + s : s);
}

function formatElements(elems) {
  if (!elems || elems.length === 0) return "-";
  const combo = getComboName(elems);
  return combo || elems.join(",");
}

function updateHUD() {
  document.getElementById("level").textContent = state.level;
  const pct = Math.min(1, state.xp / state.xpToNext) * 100;
  document.getElementById("xpBar").style.width = pct + "%";
  document.getElementById("qUpgrades").textContent = formatElements(
    state.upgrades.Q
  );
  document.getElementById("wUpgrades").textContent = formatElements(
    state.upgrades.W
  );
  document.getElementById("eUpgrades").textContent = formatElements(
    state.upgrades.E
  );
  document.getElementById("timer").textContent = formatTime(state.timeFrames);
  document.getElementById("comboName").textContent =
    state.comboTimer > 0 ? state.comboName : "None";
}

function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  state.beams = state.beams.filter((b) => {
    ctx.strokeStyle = b.color;
    ctx.lineWidth = b.width;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    b.points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.stroke();
    b.frames--;
    return b.frames > 0;
  });

  ctx.fillStyle = "#444";
  ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

  if (mageImg.complete) {
    ctx.drawImage(mageImg, player.x - 40, player.y - 40, 80, 80);
  } else {
    ctx.fillStyle = "purple";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  state.enemies.forEach((e) => {
    let img;
    if (e.type === "tanker") img = orcImg;
    else if (e.type === "voador") img = batImg;
    else if (e.type === "troll") img = trollImg;
    else img = goblinImg;
    if (img.complete) {
      ctx.drawImage(img, e.x, e.y, e.size, e.size);
    } else {
      if (e.type === "tanker") ctx.fillStyle = "brown";
      else if (e.type === "voador") ctx.fillStyle = "yellow";
      else if (e.type === "troll") ctx.fillStyle = "darkgreen";
      else ctx.fillStyle = "green";
      ctx.fillRect(e.x, e.y, e.size, e.size);
    }
    if (e.burn > 0 && state.timeFrames % 20 < 10) {
      ctx.fillStyle = "rgba(255,100,0,0.5)";
      ctx.fillRect(e.x, e.y, e.size, e.size);
    }
  });

  state.bullets.forEach((b) => {
    if (magiaImg.complete) {
      ctx.drawImage(magiaImg, b.x - 10, b.y - 10, 20, 20);
    } else {
      ctx.fillStyle = b.color || "white";
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  state.barriers.forEach((b) => {
    if (b.image && b.image.complete) {
      ctx.drawImage(b.image, b.x, b.y, b.width, b.height);
    } else {
      ctx.fillStyle = "blue";
      ctx.fillRect(b.x, b.y, b.width, b.height);
    }
  });

  ctx.fillStyle = "orange";
  state.turrets.forEach((t) => {
    ctx.beginPath();
    ctx.arc(t.x, t.y, 10, 0, Math.PI * 2);
    ctx.fill();
  });
}

function applyElementEffects(enemy, elements) {
  if (!elements) return;
  const combo = getComboName(elements);
  if (combo) {
    state.comboName = combo;
    state.comboTimer = 120;
  }

  const fireCount = elements.filter((e) => e === "Fire").length;
  const iceCount = elements.filter((e) => e === "Ice").length;
  const windCount = elements.filter((e) => e === "Wind").length;

  if (fireCount > 0) {
    if (fireCount === 1) {
      enemy.burn = 120; // 2 segundos
      enemy.burnPct = 0.1;
    } else if (fireCount === 2) {
      enemy.burn = 240; // 4 segundos
      enemy.burnPct = 0.1;
    } else {
      enemy.burn = 360; // 6 segundos
      enemy.burnPct = 0.15;
    }
  }

  if (iceCount > 0) {
    enemy.slow = iceCount >= 3 ? 120 : iceCount === 2 ? 120 : 90;
    enemy.slowFactor = iceCount >= 3 ? 0 : iceCount === 2 ? 0.5 : 0.75;
  }

  if (windCount > 0) {
    enemy.knockback = windCount === 1 ? 20 : windCount === 2 ? 40 : 80;
  }
}

function updateGame() {
  state.timeFrames++;
  if (state.comboTimer > 0) state.comboTimer--;
  if (++state.autoFireTimer % state.autoFireDelay === 0) shootBasic();
  if (!state.paused) {
    if (state.spawnTimer-- <= 0) {
      spawnEnemy();
      state.spawnTimer = state.spawnInterval;
    }
    if (--state.spawnIncreaseTimer <= 0) {
      state.spawnInterval = Math.floor(
        state.spawnInterval * GAME_CONSTANTS.SPAWN_INCREASE_COEFF
      );
      state.spawnIncreaseTimer = GAME_CONSTANTS.SPAWN_INCREASE_TIMER;
    }
  }
  if (state.paused) return;

  const remainingEnemies = [];
  state.enemies.forEach((e) => {
    if (e.burn > 0) {
      e.burn--;
      e.hp -= (e.burnPct * e.maxHp) / 60;
    }
    if (e.slow > 0) {
      e.slow--;
      if (e.slow === 0) e.slowFactor = 1;
    }

    if (e.knockback && e.knockback > 0) {
      e.x += e.knockback;
      e.knockback *= 0.6;
      if (e.knockback < 1) e.knockback = 0;
    }

    if (e.type === "miniom") {
      if (e.jumpCooldown > 0) {
        e.jumpCooldown--;
      } else if (e.vy === 0) {
        e.vy = GAME_CONSTANTS.MINIOM_JUMP_VELOCITY; // impulso do pulo
        e.jumpCooldown =
          Math.floor(Math.random() * GAME_CONSTANTS.MINIOM_JUMP_COOLDOWN_VAR) +
          GAME_CONSTANTS.MINIOM_JUMP_COOLDOWN_MIN;
      }
      e.y += e.vy;
      if (e.y < e.baseY) {
        e.vy += GAME_CONSTANTS.GRAVITY; // gravidade
      } else {
        e.y = e.baseY;
        e.vy = 0;
      }
    }
    if (e.type === "voador" && e.zigzag) {
      e.angle += 0.1;
      e.y = e.baseY + Math.sin(e.angle) * e.amplitude;
    }

    let spd = e.slow > 0 ? e.speed * e.slowFactor : e.speed;
    if (e.type === "tanker") {
      if (e.dashTime > 0) {
        e.dashTime--;
        spd *= GAME_CONSTANTS.DASH_SPEED_MULTIPLIER;
      } else {
        if (e.dashCooldown-- <= 0) {
          e.dashTime = e.dashDuration;
          e.dashCooldown =
            Math.floor(
              Math.random() * GAME_CONSTANTS.TANKER_DASH_COOLDOWN_VAR
            ) + GAME_CONSTANTS.TANKER_DASH_COOLDOWN_MIN;
        }
      }
    }
    e.x -= spd;
    if (e.hp > 0 && e.x > -e.size) {
      remainingEnemies.push(e);
    } else if (e.hp <= 0) {
      if (e.type === "troll") spawnTrunk(e.x);
      state.xp += GAME_CONSTANTS.XP_PER_ENEMY;
    }
  });
  state.enemies = remainingEnemies;

  // lógica da torreta
  state.turrets.forEach((t) => {
    if (t.cooldown > 0) {
      t.cooldown--;
      return;
    }
    const target = state.enemies[0];
    if (target) {
      const ang = Math.atan2(target.y - t.y, target.x - t.x);
      const spd = GAME_CONSTANTS.TURRET_BULLET_SPEED;
      state.bullets.push({
        x: t.x,
        y: t.y,
        dx: Math.cos(ang) * spd,
        dy: Math.sin(ang) * spd,
        dmg: t.dmg,
        // usa os elementos atuais para que melhorias afetem torretas existentes
        elements: state.spellElements.E.slice(),
        color: getBulletColor(state.spellElements.E),
        aoe: state.bulletAOE,
      });
    }
    t.cooldown = state.turretFireDelay;
  });

  // movimenta projéteis e trata colisões
  state.bullets = state.bullets.filter((b) => {
    b.x += b.dx;
    b.y += b.dy;
    for (let i = 0; i < state.enemies.length; i++) {
      const e = state.enemies[i];
      const half = e.size / 2;
      if (
        Math.abs(b.x - (e.x + half)) < half &&
        Math.abs(b.y - (e.y + half)) < half
      ) {
        applyElementEffects(e, b.elements);
        e.hp -= b.dmg;
        if (b.aoe > 0) {
          state.enemies.forEach((o) => {
            if (o === e) return;
            const h2 = o.size / 2;
            const dist = Math.hypot(b.x - (o.x + h2), b.y - (o.y + h2));
            if (dist < b.aoe) {
              applyElementEffects(o, b.elements);
              o.hp -= b.dmg;
            }
          });
        }
        if (e.hp <= 0) {
          state.enemies.splice(i, 1);
          if (e.type === "troll") spawnTrunk(e.x);
          state.xp += GAME_CONSTANTS.XP_PER_ENEMY;
        }
        return false;
      }
    }
    for (let j = 0; j < state.barriers.length; j++) {
      const barr = state.barriers[j];
      if (!barr.hostile) continue;
      if (
        b.x > barr.x &&
        b.x < barr.x + barr.width &&
        b.y > barr.y &&
        b.y < barr.y + barr.height
      ) {
        barr.hp -= b.dmg;
        return false;
      }
    }
    return b.x < canvas.width && b.y > 0 && b.y < canvas.height;
  });

  // colisão simples da barreira
  state.barriers = state.barriers.filter((barr) => {
    if (!barr.hostile) {
      state.enemies.forEach((e) => {
        if (
          e.x < barr.x + barr.width &&
          e.x + e.size > barr.x &&
          e.y < barr.y + barr.height &&
          e.y + e.size > barr.y
        ) {
          applyElementEffects(e, barr.elements);
          e.x = barr.x + barr.width;
          barr.hp--;
        }
      });
    }
    return barr.hp > 0;
  });

  Object.keys(state.cooldowns).forEach(
    (k) => (state.cooldowns[k] = Math.max(0, state.cooldowns[k] - 1))
  );

  if (state.xp >= state.xpToNext && !state.pendingUpgrade) levelUp();
}

function gameLoop() {
  updateGame();
  drawGame();
  updateHUD();
  requestAnimationFrame(gameLoop);
}

if (typeof module === "undefined") {
  gameLoop();

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    state.mouseX = e.clientX - rect.left;
    state.mouseY = e.clientY - rect.top;
  });

  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "q") castQ();
    if (e.key.toLowerCase() === "w") castW();
    if (e.key.toLowerCase() === "e") castE();
  });

  document.getElementById("levelUpBtn").addEventListener("click", () => {
    if (!state.pendingUpgrade) {
      state.xp = state.xpToNext;
      levelUp();
    }
  });

  const btn = document.getElementById("spawnTrollBtn");
  if (btn) {
    btn.addEventListener("click", () => spawnEnemy("troll"));
  }
}

if (typeof module !== "undefined") {
  module.exports = { state, levelUp };
}
