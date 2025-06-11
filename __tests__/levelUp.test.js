const { JSDOM } = require('jsdom');
const constants = require('../constants.js');

beforeEach(() => {
  // create DOM
  const dom = new JSDOM(`<!DOCTYPE html><canvas id="gameCanvas"></canvas><div id="generalUpgradePrompt"></div><div id="upgradePrompt"></div><span id="upgradeElement"></span><div id="level"></div><div id="xpBar"></div><div id="qUpgrades"></div><div id="wUpgrades"></div><div id="eUpgrades"></div><div id="timer"></div><div id="comboName"></div><button id="levelUpBtn"></button>`);
  global.window = dom.window;
  global.document = dom.window.document;
  global.Image = dom.window.Image;
  global.GAME_CONSTANTS = constants.GAME_CONSTANTS;
  global.UPGRADE_FAST_SHOT = constants.UPGRADE_FAST_SHOT;
  global.UPGRADE_BASE_DAMAGE = constants.UPGRADE_BASE_DAMAGE;
  global.UPGRADE_Q_DAMAGE = constants.UPGRADE_Q_DAMAGE;
  global.UPGRADE_W_HEALTH = constants.UPGRADE_W_HEALTH;
  global.UPGRADE_E_DAMAGE = constants.UPGRADE_E_DAMAGE;
  global.UPGRADE_Q_COOLDOWN = constants.UPGRADE_Q_COOLDOWN;
  global.UPGRADE_TURRET_FASTER = constants.UPGRADE_TURRET_FASTER;
  global.UPGRADE_BARRIER_HEIGHT = constants.UPGRADE_BARRIER_HEIGHT;
  global.UPGRADE_BULLET_AOE = constants.UPGRADE_BULLET_AOE;
  const canvas = document.getElementById('gameCanvas');
  canvas.getContext = () => ({ clearRect() {}, fillRect() {}, beginPath() {}, arc() {}, fill() {}, drawImage() {}, stroke() {}, lineTo() {}, moveTo() {} });
});

test('level up keeps enemies on screen', () => {
  const { state, levelUp } = require('../script.js');
  state.enemies = [ { hp: 5 }, { hp: 3 } ];
  state.xp = state.xpToNext;
  levelUp();
  expect(state.enemies.length).toBe(2);
});
