const GAME_CONSTANTS = {
  SPAWN_INTERVAL: 110, // time between enemy spawns in frames
  SPAWN_INCREASE_SECONDS: 20, // seconds until spawn interval increases
  SPAWN_INCREASE_TIMER: 20 * 60, // frames until spawn interval increases
  SPAWN_INCREASE_COEFF: 1.2, // multiplier applied to spawnInterval
  PLAYER_SPEED: 3, // player movement speed
  PLAYER_MAX_HP: 10, // base player life (unused yet)
  BULLET_SPEED: 5, // speed of basic player bullets
  TURRET_BULLET_SPEED: 6, // speed of turret bullets
  PLAYER_FIRE_COOLDOWN: 40, // frames between player shots
  TURRET_FIRE_COOLDOWN: 60, // frames between turret shots
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
  value: -5,
  desc: "Tiros mais rápidos",
};
