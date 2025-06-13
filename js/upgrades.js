function levelUp() {
  state.xp -= state.xpToNext;
  state.level++;
  state.xpToNext = Math.floor(state.xpToNext * GAME_CONSTANTS.XP_LEVEL_COEFF);

  const nextSkill = ["Q", "W", "E"].find((s) => !state.skillsUnlocked[s]);
  if (nextSkill) {
    state.skillsUnlocked[nextSkill] = true;
    return;
  }

  const available = generalUpgradesPool.filter((u) => {
    if (u.prop === "eBombDamageBonus") return state.eBombDamageBonus < 5;
    if (u.prop === "eBombAoeBonus") return state.eBombAoeBonus < 5;
    return true;
  });
  const opts = [];
  while (opts.length < Math.min(3, available.length)) {
    const rand = available[Math.floor(Math.random() * available.length)];
    if (!opts.includes(rand)) opts.push(rand);
  }
  state.upgradeOptions = opts;
  state.pendingUpgrade = true;
  state.upgradeType = "general";
  setPaused(true);
  if (menuOverlay) menuOverlay.style.display = "none";
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
  setPaused(false);
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
  setPaused(false);
  if (state.level % 5 === 0) {
    const el = elementOptions[Math.floor(Math.random() * elementOptions.length)];
    state.nextUpgrade = { type: "element", element: el, desc: el };
    state.pendingUpgrade = true;
    setPaused(true);
    if (menuOverlay) menuOverlay.style.display = "none";
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
  } else if (up.prop === "eBombDamageBonus") {
    state.eBombDamageBonus += up.value;
  } else if (up.prop === "eBombAoeBonus") {
    state.eBombAoeBonus += up.value;
  }
  state.generalUpgrades.push(up.desc);
}

if (typeof module !== "undefined") {
  module.exports = {
    levelUp,
    applyElementUpgrade,
    showGeneralUpgrades,
    chooseUpgrade,
    applyStatUpgrade,
  };
} else {
  window.levelUp = levelUp;
  window.applyElementUpgrade = applyElementUpgrade;
  window.showGeneralUpgrades = showGeneralUpgrades;
  window.chooseUpgrade = chooseUpgrade;
  window.applyStatUpgrade = applyStatUpgrade;
}
