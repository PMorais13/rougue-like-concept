const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const overlay = document.getElementById("overlay");
const menuOverlay = document.getElementById("menuOverlay");
const resumeBtn = document.getElementById("resumeBtn");
const loadingScreen = document.getElementById("loadingScreen");
// cache frequently accessed HUD elements for performance
const hudEls = {
  level: document.getElementById("level"),
  xpBar: document.getElementById("xpBar"),
  qUpgrades: document.getElementById("qUpgrades"),
  wUpgrades: document.getElementById("wUpgrades"),
  eUpgrades: document.getElementById("eUpgrades"),
  qCd: document.getElementById("qCd"),
  wCd: document.getElementById("wCd"),
  eCd: document.getElementById("eCd"),
  eBombCd: document.getElementById("eBombCd"),
  timer: document.getElementById("timer"),
  comboName: document.getElementById("comboName"),
  lives: document.getElementById("lives"),
  barrierHp: document.getElementById("barrierHp"),
  abilities: {
    Q: document.getElementById("qAbility"),
    W: document.getElementById("wAbility"),
    E: document.getElementById("eAbility"),
  },
};

// store last rendered values to avoid unnecessary DOM writes
const hudCache = {
  level: null,
  xpPct: null,
  qUpgrades: null,
  wUpgrades: null,
  eUpgrades: null,
  qCd: null,
  wCd: null,
  eCd: null,
  eBombCd: null,
  timer: null,
  comboName: null,
  lives: null,
  barrierHp: null,
  skillsUnlocked: { Q: null, W: null, E: null },
};
const isMobile =
  typeof navigator !== "undefined" &&
  ("ontouchstart" in window || navigator.maxTouchPoints > 0);
let lastFrameTime =
  typeof performance !== "undefined" && performance.now
    ? performance.now()
    : Date.now();
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  player.y = canvas.height - 65;
});

let mageImg = new Image();
let goblinFrames = [new Image(), new Image(), new Image()];
let orcFrames = [new Image(), new Image(), new Image()];
let batImg = new Image();
let magiaImg = new Image();
let trollImg = new Image();
let troncoImg = new Image();
let crosshairImg = new Image();
let spiderDownImg = new Image();
let spiderSoloImg = new Image();

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function loadAudio(src) {
  return new Promise((resolve, reject) => {
    const aud = new Audio();
    aud.addEventListener("canplaythrough", () => resolve(aud), { once: true });
    aud.onerror = reject;
    aud.src = src;
  });
}

async function loadAssets() {
  [
    mageImg,
    batImg,
    magiaImg,
    trollImg,
    troncoImg,
    crosshairImg,
    spiderDownImg,
    spiderSoloImg,
  ] = await Promise.all([
    loadImage("../images/mage.png"),
    loadImage("../images/bat.png"),
    loadImage("../images/magia.png"),
    loadImage("../images/troll.png"),
    loadImage("../images/tronco.png"),
    loadImage("../images/reticule.png"),
    loadImage("../images/spider-down.png"),
    loadImage("../images/spider-solo.png"),
  ]);
  goblinFrames = await Promise.all([
    loadImage("../images/goblin-1.png"),
    loadImage("../images/goblin-2.png"),
    loadImage("../images/goblin-3.png"),
  ]);
  orcFrames = await Promise.all([
    loadImage("../images/orc-1.png"),
    loadImage("../images/orc-2.png"),
    loadImage("../images/orc-3.png"),
  ]);
}

function loadKillCounts() {
  try {
    const data = localStorage.getItem("killCounts");
    if (data) return JSON.parse(data);
  } catch (e) {}
  return { miniom: 0, tanker: 0, voador: 0, troll: 0, spider: 0 };
}

function saveKillCounts() {
  try {
    localStorage.setItem("killCounts", JSON.stringify(state.killCounts));
  } catch (e) {}
}

function registerKill(type) {
  if (!type) return;
  if (!state.killCounts[type]) state.killCounts[type] = 0;
  state.killCounts[type]++;
  saveKillCounts();
}

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
  eBombDamageBonus: 0,
  eBombAoeBonus: 0,
  qCooldown: 300,
  turretFireDelay: GAME_CONSTANTS.TURRET_FIRE_COOLDOWN,
  turretSpecialCd: 0,
  barrierHeight: 40,
  bulletAOE: 0,
  crosshair: null,
  pendingUpgrade: null,
  nextUpgrade: null,
  upgradeOptions: [],
  upgradeType: null,
  paused: true,
  mouseX: 0,
  mouseY: 0,
  killCounts: loadKillCounts(),
  skillsUnlocked: { Q: false, W: false, E: false },
  spawnInterval: GAME_CONSTANTS.SPAWN_INTERVAL,
  spawnTimer: GAME_CONSTANTS.SPAWN_INTERVAL,
  spawnIncreaseTimer: GAME_CONSTANTS.SPAWN_INCREASE_TIMER,
  timeFrames: 0,
  elapsedMs: 0,
  orcFrame: 0,
  goblinFrame: 0,
  beams: [],
  explosions: [],
  comboName: "",
  comboTimer: 0,
  lives: 4,
  gameOver: false,
};

if (typeof module !== "undefined") {
  global.state = state;
}

function setPaused(p) {
  state.paused = p;
  if (overlay) overlay.style.display = p ? "block" : "none";
  if (menuOverlay && p) menuOverlay.style.display = "block";
  if (menuOverlay && !p) menuOverlay.style.display = "none";
}

if (typeof module !== "undefined") {
  global.setPaused = setPaused;
  global.menuOverlay = menuOverlay;
}

const player = {
  x: 100,
  y: canvas.height - 65,
  radius: 30,
  speed: GAME_CONSTANTS.PLAYER_SPEED,
};

if (typeof module !== "undefined") {
  var { spawnEnemy, spawnTrunk } = require("./spawner.js");
  var {
    levelUp,
    applyElementUpgrade,
    showGeneralUpgrades,
    chooseUpgrade,
    applyStatUpgrade,
  } = require("./upgrades.js");
  var { drawGame } = require("./renderer.js");
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
  if (!state.skillsUnlocked.Q || state.cooldowns.Q > 0 || state.paused) return;
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
      e.flash = 5;
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
  if (!state.skillsUnlocked.W || state.cooldowns.W > 0 || state.paused) return;
  state.cooldowns.W = 300;
  const extraHp = state.upgrades.W.length * 5;
  const barrierBottom = player.y + player.radius;
  const barrier = {
    x: player.x + 60,
    y: barrierBottom - state.barrierHeight,
    width: 20,
    height: state.barrierHeight,
    hp: 5 + state.level * 2 + extraHp + state.wBonusHp,
    elements: state.spellElements.W.slice(),
    hostile: false,
  };
  state.barriers.push(barrier);
}

function castE() {
  if (!state.skillsUnlocked.E || state.paused) return;

  // se a torreta já estiver ativa, dispare o projétil especial se a recarga permitir
  if (state.turrets.length > 0) {
    if (state.turretSpecialCd > 0) return;
    const t = state.turrets[0];
    const target = state.crosshair || state.enemies[0];
    if (target) {
      const ang = Math.atan2(target.y - t.y, target.x - t.x);
      const spd = GAME_CONSTANTS.TURRET_BULLET_SPEED;
      state.bullets.push({
        x: t.x,
        y: t.y,
        dx: Math.cos(ang) * spd,
        dy: Math.sin(ang) * spd,
        dmg: t.dmg + state.eBombDamageBonus,
        elements: [],
        color: "red",
        image: null,
        aoe: 80 + state.eBombAoeBonus,
      });
      state.turretSpecialCd = GAME_CONSTANTS.TURRET_SPECIAL_COOLDOWN;
    }
    return;
  }

  if (state.cooldowns.E > 0) return;
  state.cooldowns.E = 300;
  const dmg = 1 + state.upgrades.E.length + state.eDamageBonus;
  state.turrets.push({
    x: player.x + 50,
    y: player.y,
    hp: 1,
    cooldown: 0,
    dmg,
  });
  state.crosshair = {
    x: player.x + 150,
    y: player.y - 60,
    radius: 20,
    dragging: false,
  };
}

function clampCrosshair() {
  if (!state.crosshair || state.turrets.length === 0) return;
  const t = state.turrets[0];
  const dx = state.crosshair.x - t.x;
  const dy = state.crosshair.y - t.y;
  const dist = Math.hypot(dx, dy);
  const max = GAME_CONSTANTS.CROSSHAIR_MAX_DISTANCE;
  if (dist > max) {
    const ang = Math.atan2(dy, dx);
    state.crosshair.x = t.x + Math.cos(ang) * max;
    state.crosshair.y = t.y + Math.sin(ang) * max;
  }
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
  UPGRADE_Q_DAMAGE,
  UPGRADE_W_HEALTH,
  UPGRADE_E_DAMAGE,
  UPGRADE_Q_COOLDOWN,
  UPGRADE_TURRET_FASTER,
  UPGRADE_BARRIER_HEIGHT,
  UPGRADE_BULLET_AOE,
  UPGRADE_E_BOMB_DAMAGE,
  UPGRADE_E_BOMB_AOE,
];

if (typeof module !== "undefined") {
  global.elementOptions = elementOptions;
  global.generalUpgradesPool = generalUpgradesPool;
}

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

function formatTime(ms) {
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ":" + (s < 10 ? "0" + s : s);
}

function loadScores() {
  if (typeof localStorage === "undefined") return [];
  let str;
  try {
    str = localStorage.getItem("scores");
  } catch (e) {
    return [];
  }
  if (!str) return [];
  try {
    const arr = JSON.parse(str);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveScore(ms) {
  if (typeof localStorage === "undefined") return [];
  const scores = loadScores();
  scores.push(ms);
  scores.sort((a, b) => b - a);
  const top = scores.slice(0, 5);
  try {
    localStorage.setItem("scores", JSON.stringify(top));
  } catch (e) {}
  return top;
}

function updateScoreboard() {
  const list = document.getElementById("scoreboardList");
  const bestEl = document.getElementById("bestTime");
  const bestAch = document.getElementById("bestTimeAchievement");
  if (!list) return;
  if (typeof localStorage === "undefined") return;
  const scores = loadScores();
  list.innerHTML = scores
    .map((s, i) => `<li>${i + 1} - ${formatTime(s)}</li>`)
    .join("");
  if (bestEl) bestEl.textContent = scores[0] ? formatTime(scores[0]) : "0:00";
  if (bestAch)
    bestAch.textContent = scores[0] ? formatTime(scores[0]) : "0:00";
}

function resetState() {
  Object.assign(state, {
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
    eBombDamageBonus: 0,
    eBombAoeBonus: 0,
    qCooldown: 300,
    turretFireDelay: GAME_CONSTANTS.TURRET_FIRE_COOLDOWN,
    turretSpecialCd: 0,
    barrierHeight: 40,
    bulletAOE: 0,
    crosshair: null,
    pendingUpgrade: null,
    nextUpgrade: null,
    upgradeOptions: [],
    upgradeType: null,
    paused: false,
    mouseX: 0,
    mouseY: 0,
    skillsUnlocked: { Q: false, W: false, E: false },
    spawnInterval: GAME_CONSTANTS.SPAWN_INTERVAL,
    spawnTimer: GAME_CONSTANTS.SPAWN_INTERVAL,
    spawnIncreaseTimer: GAME_CONSTANTS.SPAWN_INCREASE_TIMER,
    timeFrames: 0,
    elapsedMs: 0,
    orcFrame: 0,
    goblinFrame: 0,
    beams: [],
    comboName: "",
    comboTimer: 0,
    lives: 4,
    gameOver: false,
  });
}

function showGameOver() {
  setPaused(true);
  if (menuOverlay) menuOverlay.style.display = "none";
  const over = document.getElementById("gameOverOverlay");
  const final = document.getElementById("finalTime");
  if (final) final.textContent = formatTime(state.elapsedMs);
  saveScore(state.elapsedMs);
  updateScoreboard();
  if (over) over.style.display = "block";
  state.gameOver = true;
}

function newGame() {
  const over = document.getElementById("gameOverOverlay");
  if (over) over.style.display = "none";
  resetState();
  lastFrameTime =
    typeof performance !== "undefined" && performance.now
      ? performance.now()
      : Date.now();
  updateHUD();
  updateScoreboard();
  setPaused(false);
}

function showAchievements() {
  const cont = document.getElementById("achievementsList");
  if (!cont) return;
  cont.innerHTML = `
    <p>Miniom: ${state.killCounts.miniom}</p>
    <p>Tanker: ${state.killCounts.tanker}</p>
    <p>Voador: ${state.killCounts.voador}</p>
    <p>Troll: ${state.killCounts.troll}</p>
    <p>Aranha: ${state.killCounts.spider}</p>
  `;
  updateScoreboard();
  document.getElementById("achievementsOverlay").style.display = "block";
}

function formatElements(elems) {
  if (!elems || elems.length === 0) return "-";
  const combo = getComboName(elems);
  return combo || elems.join(",");
}

function updateHUD() {
  if (hudEls.level && hudCache.level !== state.level) {
    hudEls.level.textContent = state.level;
    hudCache.level = state.level;
  }
  const pct = Math.min(1, state.xp / state.xpToNext) * 100;
  if (hudEls.xpBar && hudCache.xpPct !== pct) {
    hudEls.xpBar.style.width = pct + "%";
    hudCache.xpPct = pct;
  }

  const qUp = formatElements(state.upgrades.Q);
  if (hudEls.qUpgrades && hudCache.qUpgrades !== qUp) {
    hudEls.qUpgrades.textContent = qUp;
    hudCache.qUpgrades = qUp;
  }
  const wUp = formatElements(state.upgrades.W);
  if (hudEls.wUpgrades && hudCache.wUpgrades !== wUp) {
    hudEls.wUpgrades.textContent = wUp;
    hudCache.wUpgrades = wUp;
  }
  const eUp = formatElements(state.upgrades.E);
  if (hudEls.eUpgrades && hudCache.eUpgrades !== eUp) {
    hudEls.eUpgrades.textContent = eUp;
    hudCache.eUpgrades = eUp;
  }

  const qCdText =
    state.cooldowns.Q > 0 ? Math.ceil(state.cooldowns.Q / 60) : "";
  if (hudEls.qCd && hudCache.qCd !== qCdText) {
    hudEls.qCd.textContent = qCdText;
    hudCache.qCd = qCdText;
  }
  const wCdText =
    state.cooldowns.W > 0 ? Math.ceil(state.cooldowns.W / 60) : "";
  if (hudEls.wCd && hudCache.wCd !== wCdText) {
    hudEls.wCd.textContent = wCdText;
    hudCache.wCd = wCdText;
  }
  const eCdText =
    state.cooldowns.E > 0 ? Math.ceil(state.cooldowns.E / 60) : "";
  if (hudEls.eCd && hudCache.eCd !== eCdText) {
    hudEls.eCd.textContent = eCdText;
    hudCache.eCd = eCdText;
  }
  const bombCdText =
    state.turretSpecialCd > 0 ? Math.ceil(state.turretSpecialCd / 60) : "";
  if (hudEls.eBombCd && hudCache.eBombCd !== bombCdText) {
    hudEls.eBombCd.textContent = bombCdText;
    hudCache.eBombCd = bombCdText;
  }

  ["Q", "W", "E"].forEach((k) => {
    const ab = hudEls.abilities[k];
    if (!ab) return;
    if (hudCache.skillsUnlocked[k] !== state.skillsUnlocked[k]) {
      hudCache.skillsUnlocked[k] = state.skillsUnlocked[k];
      if (state.skillsUnlocked[k]) ab.classList.remove("locked");
      else ab.classList.add("locked");
    }
  });

  const timerText = formatTime(state.elapsedMs);
  if (hudEls.timer && hudCache.timer !== timerText) {
    hudEls.timer.textContent = timerText;
    hudCache.timer = timerText;
  }

  const comboText = state.comboTimer > 0 ? state.comboName : "None";
  if (hudEls.comboName && hudCache.comboName !== comboText) {
    hudEls.comboName.textContent = comboText;
    hudCache.comboName = comboText;
  }

  if (hudEls.lives && hudCache.lives !== state.lives) {
    hudEls.lives.textContent = state.lives;
    hudCache.lives = state.lives;
  }
  const bHp = state.barriers.length > 0 ? Math.ceil(state.barriers[0].hp) : 0;
  if (hudEls.barrierHp && hudCache.barrierHp !== bHp) {
    hudEls.barrierHp.textContent = bHp;
    hudCache.barrierHp = bHp;
  }
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
  if (!state.paused) {
    state.timeFrames++;
    if (state.timeFrames % GAME_CONSTANTS.ORC_ANIMATION_SPEED === 0) {
      state.orcFrame = (state.orcFrame + 1) % orcFrames.length;
    }
    if (state.timeFrames % GAME_CONSTANTS.GOBLIN_ANIMATION_SPEED === 0) {
      state.goblinFrame = (state.goblinFrame + 1) % goblinFrames.length;
    }
    if (state.comboTimer > 0) state.comboTimer--;
    if (state.turretSpecialCd > 0) state.turretSpecialCd--;
  }
  if (!state.paused && ++state.autoFireTimer % state.autoFireDelay === 0)
    shootBasic();
  if (!state.paused) {
    if (state.spawnTimer-- <= 0) {
      spawnEnemy(state, canvas, GAME_CONSTANTS);
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
    if (e.type === "spider" && e.descending) {
      e.y += e.speed;
      if (e.y >= e.groundY) {
        e.y = e.groundY;
        e.descending = false;
      }
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
    if (e.type === "spider" && e.descending) spd = 0;
    e.x -= spd;
    if (e.hp > 0) {
      if (e.x <= -e.size) {
        state.lives--;
      } else {
        remainingEnemies.push(e);
      }
    } else {
      if (e.type === "troll")
        spawnTrunk(state, canvas, GAME_CONSTANTS, troncoImg, e.x);
      registerKill(e.type);
      state.xp += GAME_CONSTANTS.XP_PER_ENEMY;
    }
  });
  state.enemies = remainingEnemies;
  if (state.lives <= 0 && !state.gameOver) {
    showGameOver();
  }

  // lógica da torreta
  state.turrets.forEach((t) => {
    if (t.cooldown > 0) {
      t.cooldown--;
      return;
    }
    const target = state.crosshair || state.enemies[0];
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
        aoe: 0,
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
        e.flash = 5;
        if (b.aoe > 0) {
          state.enemies.forEach((o) => {
            if (o === e) return;
            const h2 = o.size / 2;
            const dist = Math.hypot(b.x - (o.x + h2), b.y - (o.y + h2));
            if (dist < b.aoe) {
              applyElementEffects(o, b.elements);
              o.hp -= b.dmg;
              o.flash = 5;
            }
          });
          state.explosions.push({
            x: b.x,
            y: b.y,
            radius: b.aoe,
            color: b.color || "red",
            frames: 10,
          });
        }
        if (e.hp <= 0) {
          state.enemies.splice(i, 1);
          if (e.type === "troll")
            spawnTrunk(state, canvas, GAME_CONSTANTS, troncoImg, e.x);
          registerKill(e.type);
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
        if (b.aoe > 0) {
          state.explosions.push({
            x: b.x,
            y: b.y,
            radius: b.aoe,
            color: b.color || "red",
            frames: 10,
          });
        }
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
          e.flash = 5;
          barr.hp--;
        }
      });
    }
    return barr.hp > 0;
  });

  Object.keys(state.cooldowns).forEach(
    (k) => (state.cooldowns[k] = Math.max(0, state.cooldowns[k] - 1))
  );

  clampCrosshair();

  if (state.xp >= state.xpToNext && !state.pendingUpgrade) levelUp();
}

function gameLoop() {
  const now =
    typeof performance !== "undefined" && performance.now
      ? performance.now()
      : Date.now();
  const dt = now - lastFrameTime;
  lastFrameTime = now;
  if (!state.paused) state.elapsedMs += dt;
  updateGame();
  drawGame();
  updateHUD();
  requestAnimationFrame(gameLoop);
}

function initGame() {
  gameLoop();
  setPaused(true);
  updateScoreboard();

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    state.mouseX = e.clientX - rect.left;
    state.mouseY = e.clientY - rect.top;
    if (state.crosshair && state.crosshair.dragging) {
      state.crosshair.x = state.mouseX;
      state.crosshair.y = state.mouseY;
    }
  });

  canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    if (
      state.crosshair &&
      Math.hypot(mx - state.crosshair.x, my - state.crosshair.y) <=
        state.crosshair.radius * 2
    ) {
      state.crosshair.dragging = true;
    }
  });

  canvas.addEventListener("mouseup", () => {
    if (state.crosshair) state.crosshair.dragging = false;
  });

  canvas.addEventListener("click", () => {
    if (state.crosshair && !state.crosshair.dragging) {
      castE();
    }
  });

  if (isMobile) {
    const mobileControls = document.getElementById("mobileControls");
    if (mobileControls) mobileControls.style.display = "block";

    const handleTouch = (e) => {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches[0];
      if (t) {
        state.mouseX = t.clientX - rect.left;
        state.mouseY = t.clientY - rect.top;
        if (state.crosshair && state.crosshair.dragging) {
          state.crosshair.x = state.mouseX;
          state.crosshair.y = state.mouseY;
          clampCrosshair();
        }
      }
    };
    const pad = document.getElementById("shootPad");
    if (pad) {
      pad.addEventListener("touchstart", (e) => {
        handleTouch(e);
        if (
          state.crosshair &&
          Math.hypot(
            state.mouseX - state.crosshair.x,
            state.mouseY - state.crosshair.y
          ) <=
            state.crosshair.radius * 2
        ) {
          state.crosshair.dragging = true;
        }
      });
      pad.addEventListener("touchmove", handleTouch);
      pad.addEventListener("touchend", () => {
        if (state.crosshair) {
          if (!state.crosshair.dragging) castE();
          state.crosshair.dragging = false;
        }
      });
    }

    const qBtn = document.getElementById("btnQ");
    const wBtn = document.getElementById("btnW");
    const eBtn = document.getElementById("btnE");
    if (qBtn)
      qBtn.addEventListener("touchstart", (ev) => {
        ev.preventDefault();
        castQ();
      });
    if (wBtn)
      wBtn.addEventListener("touchstart", (ev) => {
        ev.preventDefault();
        castW();
      });
    if (eBtn)
      eBtn.addEventListener("touchstart", (ev) => {
        ev.preventDefault();
        castE();
      });
  }

  document.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (k === "p") {
      if (!state.pendingUpgrade) setPaused(!state.paused);
      return;
    }
    if (state.paused) return;
    if (k === "q") castQ();
    if (k === "w") castW();
    if (k === "e") castE();
  });

  if (resumeBtn) {
    resumeBtn.addEventListener("click", () => {
      if (!state.pendingUpgrade) setPaused(false);
    });
  }

  const achBtn = document.getElementById("achievementsBtn");
  const achClose = document.getElementById("achievementsCloseBtn");
  if (achBtn)
    achBtn.addEventListener("click", () => {
      showAchievements();
    });
  if (achClose)
    achClose.addEventListener("click", () => {
      document.getElementById("achievementsOverlay").style.display = "none";
    });

  const scoreBtn = document.getElementById("scoreboardBtn");
  const scoreClose = document.getElementById("scoreboardCloseBtn");
  if (scoreBtn)
    scoreBtn.addEventListener("click", () => {
      updateScoreboard();
      document.getElementById("scoreboardOverlay").style.display = "block";
    });
  if (scoreClose)
    scoreClose.addEventListener("click", () => {
      document.getElementById("scoreboardOverlay").style.display = "none";
    });

  const levelBtn = document.getElementById("levelUpBtn");
  if (levelBtn) {
    levelBtn.addEventListener("click", () => {
      if (!state.pendingUpgrade) {
        state.xp = state.xpToNext;
        levelUp();
      }
    });
  }

  const btn = document.getElementById("spawnTrollBtn");
  if (btn) {
    btn.addEventListener("click", () =>
      spawnEnemy(state, canvas, GAME_CONSTANTS, "troll")
    );
  }

  const restart = document.getElementById("restartBtn");
  if (restart) restart.addEventListener("click", newGame);
}

if (typeof module !== "undefined") {
  module.exports = { state, levelUp };
} else {
  (async () => {
    if (loadingScreen) loadingScreen.style.display = "block";
    try {
      await loadAssets();
    } catch (err) {
      console.error("Erro ao carregar assets", err);
    } finally {
      if (loadingScreen) loadingScreen.style.display = "none";
      initGame();
    }
  })();
}
