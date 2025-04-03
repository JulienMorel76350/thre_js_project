import React, {
  createContext,
  useContext,
  useReducer,
  useRef,
  useEffect,
} from "react";
import { BALL_SETTINGS, GAME_SETTINGS } from "../constants/gameSettings";
import logger from "../utils/logger";

// État initial du jeu
const initialState = {
  // État de la boule
  ballPosition: [0, 0.5, 8],
  thrown: false,
  controlsEnabled: true,
  throwPower: 0,
  isCharging: false,

  // État des quilles
  fallenPins: [],
  standingPins: 10,

  // État du jeu
  resetKey: 0,
  resetCamera: false,

  // État du score
  frames: [],
  currentFrame: 1,
  currentRoll: 1,
  totalScore: 0,
  gameOver: false,
  stats: {
    strikes: 0,
    spares: 0,
    splits: 0,
    gutterBalls: 0,
    highestFrame: 0,
    averageScore: 0,
  },
};

// Types d'actions pour le reducer
export const ActionTypes = {
  // Actions liées à la boule
  SET_BALL_POSITION: "SET_BALL_POSITION",
  SET_THROWN: "SET_THROWN",
  SET_CONTROLS_ENABLED: "SET_CONTROLS_ENABLED",
  SET_BALL_REF: "SET_BALL_REF",
  SET_THROW_POWER: "SET_THROW_POWER",
  SET_IS_CHARGING: "SET_IS_CHARGING",

  // Actions liées aux quilles
  RECORD_PIN_FALL: "RECORD_PIN_FALL",
  RESET_PINS: "RESET_PINS",
  SET_STANDING_PINS: "SET_STANDING_PINS",

  // Actions liées au jeu
  INCREMENT_RESET_KEY: "INCREMENT_RESET_KEY",
  TOGGLE_RESET_CAMERA: "TOGGLE_RESET_CAMERA",

  // Actions liées au score
  RECORD_ROLL: "RECORD_ROLL",
  SET_FRAME: "SET_FRAME",
  SET_ROLL: "SET_ROLL",
  SET_FRAMES: "SET_FRAMES",
  UPDATE_STATS: "UPDATE_STATS",
  RESET_GAME: "RESET_GAME",
};

// Reducer pour gérer les états du jeu
const gameReducer = (state, action) => {
  logger.debug(`Action dispatched: ${action.type}`, action.payload);

  switch (action.type) {
    // Actions liées à la boule
    case ActionTypes.SET_BALL_POSITION:
      return { ...state, ballPosition: action.payload };

    case ActionTypes.SET_THROWN:
      return { ...state, thrown: action.payload };

    case ActionTypes.SET_CONTROLS_ENABLED:
      return { ...state, controlsEnabled: action.payload };

    case ActionTypes.SET_BALL_REF:
      return { ...state, ballRef: action.payload };

    case ActionTypes.SET_THROW_POWER:
      return { ...state, throwPower: action.payload };

    case ActionTypes.SET_IS_CHARGING:
      return { ...state, isCharging: action.payload };

    // Actions liées aux quilles
    case ActionTypes.RECORD_PIN_FALL: {
      const pinIndex = action.payload;
      if (state.fallenPins.includes(pinIndex)) {
        return state;
      }
      const newFallenPins = [...state.fallenPins, pinIndex];
      return {
        ...state,
        fallenPins: newFallenPins,
        standingPins: 10 - newFallenPins.length,
      };
    }

    case ActionTypes.RESET_PINS:
      return {
        ...state,
        fallenPins: [],
        standingPins: 10,
      };

    case ActionTypes.SET_STANDING_PINS:
      return { ...state, standingPins: action.payload };

    // Actions liées au jeu
    case ActionTypes.INCREMENT_RESET_KEY:
      return { ...state, resetKey: state.resetKey + 1 };

    case ActionTypes.TOGGLE_RESET_CAMERA:
      return { ...state, resetCamera: !state.resetCamera };

    // Actions liées au score
    case ActionTypes.RECORD_ROLL: {
      const { framesCopy, totalScore } = action.payload;
      return {
        ...state,
        frames: framesCopy,
        totalScore,
      };
    }

    case ActionTypes.SET_FRAME:
      return { ...state, currentFrame: action.payload };

    case ActionTypes.SET_ROLL:
      return { ...state, currentRoll: action.payload };

    case ActionTypes.SET_FRAMES:
      return { ...state, frames: action.payload };

    case ActionTypes.UPDATE_STATS:
      return { ...state, stats: action.payload };

    case ActionTypes.RESET_GAME:
      return {
        ...initialState,
        resetKey: state.resetKey + 1,
      };

    default:
      logger.warn(`Unknown action type: ${action.type}`);
      return state;
  }
};

// Création du contexte
export const GameContext = createContext();

// Hook personnalisé pour utiliser le contexte
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};

// Composant Provider
export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const ballRef = useRef(null);

  // Créer des actions faciles à utiliser
  const actions = {
    // Actions liées à la boule
    setBallPosition: (position) =>
      dispatch({ type: ActionTypes.SET_BALL_POSITION, payload: position }),
    setThrown: (thrown) =>
      dispatch({ type: ActionTypes.SET_THROWN, payload: thrown }),
    setControlsEnabled: (enabled) =>
      dispatch({ type: ActionTypes.SET_CONTROLS_ENABLED, payload: enabled }),
    setBallRef: (ref) =>
      dispatch({ type: ActionTypes.SET_BALL_REF, payload: ref }),
    setThrowPower: (power) =>
      dispatch({ type: ActionTypes.SET_THROW_POWER, payload: power }),
    setIsCharging: (isCharging) =>
      dispatch({ type: ActionTypes.SET_IS_CHARGING, payload: isCharging }),

    // Actions liées aux quilles
    recordPinFall: (pinIndex) =>
      dispatch({ type: ActionTypes.RECORD_PIN_FALL, payload: pinIndex }),
    resetPins: () => dispatch({ type: ActionTypes.RESET_PINS }),
    setStandingPins: (count) =>
      dispatch({ type: ActionTypes.SET_STANDING_PINS, payload: count }),

    // Actions liées au jeu
    incrementResetKey: () =>
      dispatch({ type: ActionTypes.INCREMENT_RESET_KEY }),
    toggleResetCamera: () =>
      dispatch({ type: ActionTypes.TOGGLE_RESET_CAMERA }),

    // Actions de haut niveau combinant plusieurs actions
    resetForSecondRoll: () => {
      dispatch({
        type: ActionTypes.SET_BALL_POSITION,
        payload: BALL_SETTINGS.INITIAL_POSITION,
      });
      dispatch({ type: ActionTypes.SET_THROWN, payload: false });
      dispatch({ type: ActionTypes.SET_CONTROLS_ENABLED, payload: true });
      dispatch({ type: ActionTypes.INCREMENT_RESET_KEY });
    },

    resetForNextFrame: () => {
      dispatch({
        type: ActionTypes.SET_BALL_POSITION,
        payload: BALL_SETTINGS.INITIAL_POSITION,
      });
      dispatch({ type: ActionTypes.SET_THROWN, payload: false });
      dispatch({ type: ActionTypes.SET_CONTROLS_ENABLED, payload: true });
      dispatch({ type: ActionTypes.RESET_PINS });
      dispatch({ type: ActionTypes.INCREMENT_RESET_KEY });
    },

    // Actions liées au score
    recordRoll: (framesCopy, totalScore) =>
      dispatch({
        type: ActionTypes.RECORD_ROLL,
        payload: { framesCopy, totalScore },
      }),
    setFrame: (frame) =>
      dispatch({ type: ActionTypes.SET_FRAME, payload: frame }),
    setRoll: (roll) => dispatch({ type: ActionTypes.SET_ROLL, payload: roll }),
    updateStats: (stats) =>
      dispatch({ type: ActionTypes.UPDATE_STATS, payload: stats }),
    resetGame: () => dispatch({ type: ActionTypes.RESET_GAME }),
  };

  // Logging des changements d'état
  useEffect(() => {
    logger.debug("Game state updated", state);
  }, [state]);

  const processFrameEnd = () => {
    if (ballRef.current?.userData?.isStopped) {
      setTimeout(() => {
        if (state.currentRoll === 1) {
          actions.resetForSecondRoll();
        } else {
          actions.resetForNextFrame();
        }
      }, 1000);
    }
  };

  const contextValue = {
    state,
    actions: {
      ...actions,
      processFrameEnd,
    },
    ballRef,
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
};

export default GameProvider;
