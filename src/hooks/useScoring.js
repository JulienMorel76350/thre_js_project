import { useState, useCallback, useEffect } from "react";
import { GAME_SETTINGS } from "../constants/gameSettings";
import logger from "../utils/logger";

/**
 * Hook personnalisé pour gérer le système de score
 */
export const useScoring = () => {
  // États du système de score
  const [frames, setFrames] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(1);
  const [currentRoll, setCurrentRoll] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [totalScore, setTotalScore] = useState(0);
  const [stats, setStats] = useState({
    strikes: 0,
    spares: 0,
    splits: 0,
    gutterBalls: 0,
    highestFrame: 0,
    averageScore: 0,
  });

  // Initialisation du jeu
  const initializeGame = useCallback(() => {
    logger.info("Initializing game");

    // Un jeu de bowling a 10 frames
    const newFrames = Array(GAME_SETTINGS.FRAMES)
      .fill(null)
      .map((_, index) => ({
        rolls: [],
        score: 0,
        cumulative: 0,
        isSpare: false,
        isStrike: false,
        isSplit: false,
        isGutterBall: false,
        isComplete: false,
        pinsLeft: GAME_SETTINGS.PINS_PER_FRAME,
        pinsKnockedDown: 0,
        frameNumber: index + 1,
      }));

    setFrames(newFrames);
    setCurrentFrame(1);
    setCurrentRoll(1);
    setGameOver(false);
    setTotalScore(0);
    setStats({
      strikes: 0,
      spares: 0,
      splits: 0,
      gutterBalls: 0,
      highestFrame: 0,
      averageScore: 0,
    });
  }, []);

  // Initialiser le jeu au montage du composant
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Enregistrer un lancer
  const recordRoll = useCallback(
    ({ pinsKnockedDown, isGutterBall = false }) => {
      if (gameOver) {
        logger.warn("Game is over, cannot record roll");
        return;
      }

      logger.info(
        `Recording roll: ${pinsKnockedDown} pins, frame ${currentFrame}, roll ${currentRoll}`,
        { isGutterBall }
      );

      // Validation de l'entrée
      if (
        pinsKnockedDown < 0 ||
        pinsKnockedDown > GAME_SETTINGS.PINS_PER_FRAME
      ) {
        logger.error("Invalid pin count:", pinsKnockedDown);
        return;
      }

      // Mise à jour des frames
      const framesCopy = [...frames];
      const frameIndex = currentFrame - 1;

      if (frameIndex < GAME_SETTINGS.FRAMES) {
        const frame = framesCopy[frameIndex];

        // Validation du second lancer dans une frame standard (1-9)
        if (currentRoll === 2 && frameIndex < GAME_SETTINGS.FRAMES - 1) {
          const firstRoll = frame.rolls[0] || 0;
          if (firstRoll + pinsKnockedDown > GAME_SETTINGS.PINS_PER_FRAME) {
            logger.error(
              "Invalid total pins for frame:",
              firstRoll + pinsKnockedDown
            );
            return;
          }
        }

        // Ajouter le score de ce lancer
        frame.rolls.push(pinsKnockedDown);
        frame.pinsKnockedDown += pinsKnockedDown;
        frame.pinsLeft = GAME_SETTINGS.PINS_PER_FRAME - frame.pinsKnockedDown;
        frame.isGutterBall = isGutterBall;

        // Mettre à jour le statut du lancer
        updateRollStatus(framesCopy, frameIndex, pinsKnockedDown);

        // Calculer les scores
        calculateScores(framesCopy);

        // Mettre à jour les statistiques
        updateStats(framesCopy);

        // Vérifier si c'est un strike
        if (frame.isStrike && frameIndex < GAME_SETTINGS.FRAMES - 1) {
          // Passer directement au frame suivant
          setCurrentFrame(currentFrame + 1);
          setCurrentRoll(1);
        } else {
          // Passer au lancer/frame suivant
          advanceToNextRoll(framesCopy, frameIndex, pinsKnockedDown);
        }

        // Mettre à jour les frames
        setFrames(framesCopy);
      }
    },
    [currentFrame, currentRoll, frames, gameOver]
  );

  // Mettre à jour le statut du lancer
  const updateRollStatus = useCallback(
    (framesCopy, frameIndex, pinsKnockedDown) => {
      const frame = framesCopy[frameIndex];
      const firstRoll = frame.rolls[0] || 0;

      // Vérifier si c'est un strike (premier lancer abat toutes les quilles)
      if (
        currentRoll === 1 &&
        pinsKnockedDown === GAME_SETTINGS.PINS_PER_FRAME
      ) {
        frame.isStrike = true;
        frame.rolls.push(null); // Ajouter un lancer "fantôme" pour maintenir la cohérence
        setStats((prev) => ({
          ...prev,
          strikes: prev.strikes + 1,
        }));
      }
      // Vérifier si c'est un spare (deux lancers abattent toutes les quilles)
      else if (
        currentRoll === 2 &&
        firstRoll + pinsKnockedDown === GAME_SETTINGS.PINS_PER_FRAME
      ) {
        frame.isSpare = true;
        setStats((prev) => ({
          ...prev,
          spares: prev.spares + 1,
        }));
      }
      // Vérifier si c'est un split
      else if (currentRoll === 1 && pinsKnockedDown > 0) {
        const remainingPins = GAME_SETTINGS.PINS_PER_FRAME - pinsKnockedDown;
        if (remainingPins > 0 && remainingPins % 2 === 0) {
          frame.isSplit = true;
          setStats((prev) => ({
            ...prev,
            splits: prev.splits + 1,
          }));
        }
      }
    },
    [currentRoll]
  );

  // Calculer les scores avec les règles officielles du bowling
  const calculateScores = useCallback((framesCopy) => {
    let runningTotal = 0;

    for (let i = 0; i < framesCopy.length; i++) {
      const frame = framesCopy[i];
      const rolls = frame.rolls.filter((roll) => roll !== null); // Ignorer les lancers "fantômes"

      // Réinitialiser le score pour le recalculer
      frame.score = 0;

      // Strike
      if (frame.isStrike) {
        // Chercher les deux prochains lancers effectifs
        let nextRolls = [];
        let nextFrameIndex = i + 1;

        while (nextFrameIndex < GAME_SETTINGS.FRAMES && nextRolls.length < 2) {
          const nextFrame = framesCopy[nextFrameIndex];
          const validRolls = nextFrame.rolls.filter((roll) => roll !== null);

          nextRolls = [
            ...nextRolls,
            ...validRolls.slice(0, 2 - nextRolls.length),
          ];
          nextFrameIndex++;
        }

        // Calculer le score si on a assez de données
        if (nextRolls.length === 2 || i === GAME_SETTINGS.FRAMES - 1) {
          frame.score =
            GAME_SETTINGS.PINS_PER_FRAME +
            (nextRolls[0] || 0) +
            (nextRolls[1] || 0);
          frame.isComplete = true;
        }
      }
      // Spare
      else if (frame.isSpare) {
        // Chercher le prochain lancer effectif
        let nextRoll = 0;

        if (i < GAME_SETTINGS.FRAMES - 1) {
          const nextFrame = framesCopy[i + 1];
          const validRolls = nextFrame.rolls.filter((roll) => roll !== null);
          nextRoll = validRolls[0] || 0;
        } else if (rolls.length >= 3) {
          // 10ème frame
          nextRoll = rolls[2] || 0;
        }

        // Calculer le score si on a assez de données
        if (
          (i < GAME_SETTINGS.FRAMES - 1 && nextRoll !== undefined) ||
          (i === GAME_SETTINGS.FRAMES - 1 && rolls.length >= 3)
        ) {
          frame.score = GAME_SETTINGS.PINS_PER_FRAME + nextRoll;
          frame.isComplete = true;
        }
      }
      // Frame normale
      else if (
        rolls.length >= 2 ||
        (i === GAME_SETTINGS.FRAMES - 1 &&
          rolls.length >= 2 &&
          !frame.isStrike &&
          !frame.isSpare)
      ) {
        frame.score = (rolls[0] || 0) + (rolls[1] || 0);
        frame.isComplete = true;
      }

      // Traitement spécial pour la 10ème frame
      if (i === GAME_SETTINGS.FRAMES - 1) {
        if (frame.isStrike || frame.isSpare) {
          // Score pour strike ou spare en 10ème frame
          if (rolls.length >= 3) {
            frame.score = (rolls[0] || 0) + (rolls[1] || 0) + (rolls[2] || 0);
            frame.isComplete = true;
          } else {
            frame.isComplete = false;
          }
        } else if (rolls.length >= 2) {
          // Score normal en 10ème frame
          frame.score = (rolls[0] || 0) + (rolls[1] || 0);
          frame.isComplete = true;
        }
      }

      // Ajouter au score cumulatif si la frame est complète
      if (frame.isComplete) {
        runningTotal += frame.score;
        frame.cumulative = runningTotal;
      }
    }

    setTotalScore(runningTotal);
  }, []);

  // Passer au lancer/frame suivant
  const advanceToNextRoll = useCallback(
    (framesCopy, frameIndex, pinsKnockedDown) => {
      // Gestion spéciale pour la 10ème frame
      if (frameIndex === GAME_SETTINGS.FRAMES - 1) {
        if (currentRoll === 1) {
          if (pinsKnockedDown === GAME_SETTINGS.PINS_PER_FRAME) {
            // Strike en 10ème frame, on continue avec le 2ème lancer
            setCurrentRoll(2);
          } else {
            // Pas un strike, on passe au 2ème lancer
            setCurrentRoll(2);
          }
        } else if (currentRoll === 2) {
          const frame = framesCopy[frameIndex];

          if (frame.isStrike || frame.isSpare) {
            // Après un strike ou spare, on a droit à un 3ème lancer
            setCurrentRoll(3);
          } else {
            // Sinon, le jeu est terminé
            setGameOver(true);
          }
        } else {
          // Après le 3ème lancer, le jeu est toujours terminé
          setGameOver(true);
        }
      } else {
        // Frames 1-9
        if (
          pinsKnockedDown === GAME_SETTINGS.PINS_PER_FRAME &&
          currentRoll === 1
        ) {
          // Strike, on passe directement à la frame suivante
          setCurrentFrame(currentFrame + 1);
          setCurrentRoll(1);
        } else if (currentRoll === 1) {
          // Premier lancer, pas un strike, on passe au second lancer
          setCurrentRoll(2);
        } else {
          // Après le second lancer, on passe à la frame suivante
          setCurrentFrame(currentFrame + 1);
          setCurrentRoll(1);
        }
      }
    },
    [currentFrame, currentRoll]
  );

  // Mettre à jour les statistiques
  const updateStats = useCallback(
    (framesCopy) => {
      const newStats = { ...stats };

      // Calculer les statistiques
      let strikes = 0;
      let spares = 0;
      let splits = 0;
      let gutterBalls = 0;
      let highestFrameScore = 0;

      framesCopy.forEach((frame) => {
        if (frame.isStrike) strikes++;
        if (frame.isSpare) spares++;
        if (frame.isSplit) splits++;
        if (frame.isGutterBall) gutterBalls++;
        if (frame.score > highestFrameScore) highestFrameScore = frame.score;
      });

      // Calculer la moyenne
      const completedFrames = framesCopy.filter((f) => f.isComplete);
      const averageScore =
        completedFrames.length > 0
          ? completedFrames.reduce((acc, f) => acc + f.score, 0) /
            completedFrames.length
          : 0;

      // Mettre à jour les stats
      newStats.strikes = strikes;
      newStats.spares = spares;
      newStats.splits = splits;
      newStats.gutterBalls = gutterBalls;
      newStats.highestFrame = highestFrameScore;
      newStats.averageScore = averageScore;

      setStats(newStats);
    },
    [stats]
  );

  // Réinitialiser le jeu
  const resetGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  return {
    // État
    frames,
    currentFrame,
    currentRoll,
    totalScore,
    gameOver,
    stats,

    // Actions
    recordRoll,
    resetGame,
    setCurrentFrame,
    setCurrentRoll,
  };
};

export default useScoring;
