// Constantes pour les positions des quilles
export const PIN_POSITIONS = [
  [0, 0.5, -15], // Première rangée
  [-0.4, 0.5, -15.6], // Deuxième rangée
  [0.4, 0.5, -15.6],
  [-0.8, 0.5, -16.2], // Troisième rangée
  [0, 0.5, -16.2],
  [0.8, 0.5, -16.2],
  [-1.2, 0.5, -16.8], // Quatrième rangée
  [-0.4, 0.5, -16.8],
  [0.4, 0.5, -16.8],
  [1.2, 0.5, -16.8],
];

// Constantes pour la boule
export const BALL_SETTINGS = {
  INITIAL_POSITION: [0, 1, 9],
  MASS: 50,
  RADIUS: 0.5,
  RESTITUTION: 0.5,
  FRICTION: 0.2,
  COLOR: "#000080",
  LINEAR_DAMPING: 0.2,
  ANGULAR_DAMPING: 0.2,
};

// Constantes pour les quilles
export const PIN_SETTINGS = {
  RADIUS: 0.15,
  HEIGHT: 1,
  MASS: 1.5,
  RESTITUTION: 0.3,
  FRICTION: 0.8,
  POSITIONS: PIN_POSITIONS,
};

// Constantes pour la piste
export const LANE_SETTINGS = {
  WIDTH: 3,
  LENGTH: 20,
  GUTTER_WIDTH: 0.3,
  GUTTER_HEIGHT: 0.5,
  HEIGHT: 0.5,
};

// Constantes pour le jeu
export const GAME_SETTINGS = {
  MAX_FRAMES: 10,
  MAX_ROLLS_PER_FRAME: 2,
  STRIKE_BONUS: 10,
  SPARE_BONUS: 5,
};

// Constantes pour les timings et animations
export const TIMING = {
  RESET_DELAY: 1500,
  BALL_STOP_CHECK_INTERVAL: 200,
  POWER_INDICATOR_TRANSITION: "0.05s",
};

// Constantes pour la physique
export const PHYSICS = {
  GRAVITY: -9.81,
  GUTTER_THRESHOLD_X: 0.8,
  BALL_STOP_THRESHOLD_Z: -17,
  BALL_STOP_THRESHOLD_Y: -2,
  REBOUND_FORCE: 20,
  JUMP_FORCE: 10,
  MAX_THROW_SPEED: 30,
  MIN_THROW_SPEED: 5,
  DRAG_SENSITIVITY: 0.5,
  MAX_DRAG_DISTANCE: 100,
  MAX_CHARGE_TIME: 2000, // Temps maximum de charge en ms
  BALL_STOP_SPEED: 0.1, // Vitesse à laquelle la balle est considérée comme arrêtée
};
