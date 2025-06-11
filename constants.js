const GAME_CONSTANTS = {
  SPAWN_INTERVAL: 160, // time between enemy spawns in frames
  SPAWN_INCREASE_SECONDS: 20, // seconds until spawn interval increases
  SPAWN_INCREASE_TIMER: 20 * 60, // frames until spawn interval increases
  // coefficient applied to spawnInterval over time. Values below 1 will
  // decrease the interval, making enemies spawn more frequently.
  SPAWN_INCREASE_COEFF: 0.8,
  PLAYER_SPEED: 3, // player movement speed
  PLAYER_MAX_HP: 10, // base player life (unused yet)
  BULLET_SPEED: 5, // speed of basic player bullets
  TURRET_BULLET_SPEED: 6, // speed of turret bullets
  PLAYER_FIRE_COOLDOWN: 80, // frames between player shots
  TURRET_FIRE_COOLDOWN: 100, // frames between turret shots
  MINIOM_JUMP_VELOCITY: -12, // initial jump velocity for miniom enemies
  MINIOM_JUMP_COOLDOWN_MIN: 60, // minimum frames before miniom jumps again
  MINIOM_JUMP_COOLDOWN_VAR: 120, // additional random cooldown range
  GRAVITY: 0.5, // gravity applied to jumping enemies
  TANKER_DASH_COOLDOWN_MIN: 120, // minimum cooldown before tanker dashes
  TANKER_DASH_COOLDOWN_VAR: 240, // additional random cooldown range
  TANKER_DASH_DURATION: 70, // duration of tanker dash
  DASH_SPEED_MULTIPLIER: 3, // speed multiplier while dashing
  XP_PER_ENEMY: 1, // experience points gained per enemy defeated
  XP_LEVEL_COEFF: 1.2, // multiplier for XP needed per level
  ENEMY_BASE_STATS: {
    miniom: { hp: 3, speed: 1.8, size: 60 },
    tanker: { hp: 10, speed: 1, size: 100 },
    voador: { hp: 2, speed: 2.5, size: 50 },
  },
};

// upgrade definitions
const UPGRADE_FAST_SHOT = {
  type: "stat",
  prop: "autoFireDelay",
  value: -10,
  desc: "Tiros mais rápidos",
};

const UPGRADE_BASE_DAMAGE = {
  type: "stat",
  prop: "baseDamage",
  value: 1,
  desc: "+1 dano base",
};

const UPGRADE_Q_DAMAGE = {
  type: "stat",
  prop: "qDamageBonus",
  value: 1,
  desc: "+1 dano do Q",
};

const UPGRADE_W_HEALTH = {
  type: "stat",
  prop: "wBonusHp",
  value: 5,
  desc: "+5 vida do W",
};

const UPGRADE_E_DAMAGE = {
  type: "stat",
  prop: "eDamageBonus",
  value: 1,
  desc: "+1 dano do E",
};

const UPGRADE_Q_COOLDOWN = {
  type: "stat",
  prop: "qCooldown",
  value: -30,
  desc: "Q recarrega mais rápido",
};

const UPGRADE_TURRET_FASTER = {
  type: "stat",
  prop: "turretFireDelay",
  value: -10,
  desc: "Torreta atira mais rápido",
};

const UPGRADE_BARRIER_HEIGHT = {
  type: "stat",
  prop: "barrierHeight",
  value: 10,
  desc: "Barreira mais alta",
};

const UPGRADE_BULLET_AOE = {
  type: "stat",
  prop: "bulletAOE",
  value: 20,
  desc: "Ataque básico em área",
};
