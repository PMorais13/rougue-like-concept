const GAME_CONSTANTS = {
  SPAWN_INTERVAL: Math.round(2.5 * 60), // spawn inicial um pouco mais lento
  SPAWN_INCREASE_SECONDS: 30, // a cada 30s o intervalo de spawn diminui
  SPAWN_INCREASE_TIMER: 30 * 60, // equivalente em quadros a 30 segundos
  // coeficiente aplicado ao spawnInterval. Abaixo de 1 reduz o intervalo
  // tornando os inimigos mais frequentes.
  SPAWN_INCREASE_COEFF: 0.8, // crescimento de dificuldade suavizado
  PLAYER_SPEED: 3, // velocidade de movimento do jogador
  PLAYER_MAX_HP: 10, // vida base do jogador (ainda não usado)
  BULLET_SPEED: 5, // velocidade dos projéteis básicos do jogador
  TURRET_BULLET_SPEED: 6, // velocidade dos projéteis das torretas
  PLAYER_FIRE_COOLDOWN: 80, // quadros entre disparos do jogador
  TURRET_FIRE_COOLDOWN: 100, // quadros entre disparos da torre
  MINIOM_JUMP_VELOCITY: -12, // velocidade inicial do pulo dos minioms
  MINIOM_JUMP_COOLDOWN_MIN: 60, // quadros mínimos antes do miniom pular
  MINIOM_JUMP_COOLDOWN_VAR: 120, // intervalo aleatório adicional de recarga
  GRAVITY: 0.5, // gravidade aplicada aos inimigos que pulam
  TANKER_DASH_COOLDOWN_MIN: 120, // recarga mínima antes do tanker investir
  TANKER_DASH_COOLDOWN_VAR: 240, // intervalo aleatório adicional
  TANKER_DASH_DURATION: 70, // duração da investida do tanker
  DASH_SPEED_MULTIPLIER: 3, // multiplicador de velocidade na investida
  TRUNK_BASE_Y: 150, // altura do topo do tronco em relação à base da tela
  ORC_ANIMATION_SPEED: 8, // quadros entre quadros da animação do orc
  GOBLIN_ANIMATION_SPEED: 8, // quadros entre quadros da animação do goblin
  XP_PER_ENEMY: 3, // XP ganho por inimigo derrotado
  XP_LEVEL_COEFF: 1.2, // multiplicador do XP necessário por nível
  ENEMY_HP_LEVEL_COEFF: 1.05, // multiplicador de HP por nível
  ENEMY_SPEED_LEVEL_COEFF: 1.01, // multiplicador de velocidade por nível
  ENEMY_BASE_STATS: {
    miniom: { hp: 2, speed: 1.8, size: 60 },
    tanker: { hp: 6, speed: 1, size: 90 },
    voador: { hp: 1, speed: 2.5, size: 50 },
    troll: { hp: 30, speed: 0.7, size: 240 },
  },
  ENEMY_SPAWN_WEIGHTS: {
    miniom: 65,
    tanker: 20,
    voador: 10,
    troll: 5,
  },
};

// upgrade definitions
const UPGRADE_FAST_SHOT = {
  type: "stat",
  prop: "autoFireDelay",
  value: -15,
  desc: "Tiros mais rápidos",
};

const UPGRADE_Q_DAMAGE = {
  type: "stat",
  prop: "qDamageBonus",
  value: 1,
  desc: "+ dano do Q",
};

const UPGRADE_W_HEALTH = {
  type: "stat",
  prop: "wBonusHp",
  value: 10,
  desc: "+ vida do W",
};

const UPGRADE_E_DAMAGE = {
  type: "stat",
  prop: "eDamageBonus",
  value: 1,
  desc: "+ dano do E",
};

const UPGRADE_Q_COOLDOWN = {
  type: "stat",
  prop: "qCooldown",
  value: -10,
  desc: "Q recarrega mais rápido",
};

const UPGRADE_TURRET_FASTER = {
  type: "stat",
  prop: "turretFireDelay",
  value: -20,
  desc: "Torreta atira mais rápido",
};

const UPGRADE_BARRIER_HEIGHT = {
  type: "stat",
  prop: "barrierHeight",
  value: 40,
  desc: "Barreira mais alta",
};

const UPGRADE_BULLET_AOE = {
  type: "stat",
  prop: "bulletAOE",
  value: 70,
  desc: "Ataque básico em área",
};

if (typeof module !== "undefined") {
  module.exports = {
    GAME_CONSTANTS,
    UPGRADE_FAST_SHOT,
    UPGRADE_Q_DAMAGE,
    UPGRADE_W_HEALTH,
    UPGRADE_E_DAMAGE,
    UPGRADE_Q_COOLDOWN,
    UPGRADE_TURRET_FASTER,
    UPGRADE_BARRIER_HEIGHT,
    UPGRADE_BULLET_AOE,
  };
}
