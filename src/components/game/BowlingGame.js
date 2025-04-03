import React, {
  useRef,
  useState,
  useCallback,
  Suspense,
  useEffect,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import BowlingLane from "./BowlingLane";
import Ball from "./Ball";
import Pins from "./Pins";
import GameControls from "./GameControls";
import { BALL_SETTINGS, PHYSICS } from "../../constants/gameSettings";
import ScoreBoard from "./ScoreBoard";

// Détecteur de balle sortie de la piste ou arrivée au bout
const BallTracker = ({ position, onBallLost, onBallEnd }) => {
  const timer = useRef(null);

  useFrame(() => {
    // Si la balle tombe en dessous de la piste
    if (position[1] < -2) {
      onBallLost();
    }

    // Si la balle atteint le fond de la piste
    if (position[2] < -12) {
      // Démarrer le timer pour passer au lancer suivant
      if (!timer.current) {
        timer.current = setTimeout(() => {
          onBallEnd();
          timer.current = null;
        }, 5000); // 5 secondes
      }
    } else {
      // Si la balle n'est plus au fond, annuler le timer
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    }
  });

  // Nettoyer le timer quand le composant est démonté
  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  return null;
};

const BowlingGame = () => {
  // État du jeu
  const [score, setScore] = useState(0);
  const [frame, setFrame] = useState(1);
  const [roll, setRoll] = useState(1);
  const [pinsDown, setPinsDown] = useState([]);
  const [ballThrown, setBallThrown] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const [cameraLocked, setCameraLocked] = useState(false);
  const [waitingForPin, setWaitingForPin] = useState(false);
  const pinCheckTimer = useRef(null);
  const endTurnTimer = useRef(null);

  // État du score
  const [frameScores, setFrameScores] = useState(Array(10).fill(null));
  const [rollScores, setRollScores] = useState(Array(21).fill(null)); // 21 lancers max
  const [gameOver, setGameOver] = useState(false);

  const controlsRef = useRef();

  // Références pour les positions et vitesses
  const ballPositionRef = useRef([0, 0.5, 5]);
  const ballVelocityRef = useRef([0, 0, 0]);
  const ballAngularVelocityRef = useRef([0, 0, 0]);

  // Référence pour suivre l'index du lancer actuel (0 à 20)
  const rollIndexRef = useRef(0);

  // Nettoyer tous les timers
  const clearAllTimers = useCallback(() => {
    if (pinCheckTimer.current) {
      clearTimeout(pinCheckTimer.current);
      pinCheckTimer.current = null;
    }
    if (endTurnTimer.current) {
      clearTimeout(endTurnTimer.current);
      endTurnTimer.current = null;
    }
  }, []);

  // Gestionnaire pour la mise à jour de la position de la balle
  const handlePositionChange = useCallback((position) => {
    ballPositionRef.current = position;
  }, []);

  // Gestionnaire pour la mise à jour de la vitesse de la balle
  const handleVelocityChange = useCallback((velocity) => {
    ballVelocityRef.current = velocity;
  }, []);

  // Gestionnaire pour la mise à jour de la vitesse angulaire de la balle
  const handleAngularVelocityChange = useCallback((angularVelocity) => {
    ballAngularVelocityRef.current = angularVelocity;
  }, []);

  // Gestionnaire pour la balle perdue (tombée en-dessous de la piste)
  const handleBallLost = useCallback(() => {
    console.log("Ball lost!");
    clearAllTimers();
    // Attendre un court moment avant de passer au lancer suivant
    endTurnTimer.current = setTimeout(() => {
      handleThrowComplete();
    }, 1000);
  }, [clearAllTimers]);

  // Gestionnaire pour la balle qui atteint le mur du fond
  const handleHitBackWall = useCallback(() => {
    console.log("Ball hit back wall!");
    // Si la balle atteint le mur du fond, attendre 5 secondes puis passer au lancer suivant
    clearAllTimers();
    endTurnTimer.current = setTimeout(() => {
      handleThrowComplete();
    }, 5000);
  }, [clearAllTimers]);

  // Gestionnaire pour la balle arrêtée
  const handleBallStopped = useCallback(() => {
    console.log("Ball stopped!");
    // Si des quilles sont tombées, attendre un peu pour voir si d'autres tombent
    // Sinon, passer au lancer suivant
    clearAllTimers();
    if (pinsDown.length > 0) {
      endTurnTimer.current = setTimeout(() => {
        handleThrowComplete();
      }, 2000);
    } else {
      endTurnTimer.current = setTimeout(() => {
        handleThrowComplete();
      }, 1000);
    }
  }, [clearAllTimers, pinsDown.length]);

  // Gestionnaire pour la chute d'une quille
  const handlePinFall = useCallback(
    (pinIndex) => {
      console.log("Pin fallen:", pinIndex);
      if (!pinsDown.includes(pinIndex)) {
        setPinsDown((prev) => [...prev, pinIndex]);
      }
    },
    [pinsDown]
  );

  // Calculer le score pour une frame spécifique
  const calculateFrameScore = useCallback(
    (frameIndex) => {
      if (frameIndex >= 10) return null;

      const rollIndex = frameIndex * 2;

      // Si aucun lancer n'a été effectué dans cette frame
      if (rollScores[rollIndex] === null) return null;

      // Strike
      if (rollScores[rollIndex] === 10) {
        // Besoin des deux lancers suivants pour calculer le score
        if (rollScores[rollIndex + 2] === null) return null;
        if (
          rollScores[rollIndex + 2] === 10 &&
          rollScores[rollIndex + 4] === null &&
          frameIndex < 9
        )
          return null;

        // Calcul du score pour un strike
        if (frameIndex === 9) {
          // 10e frame
          return (
            10 +
            (rollScores[rollIndex + 1] || 0) +
            (rollScores[rollIndex + 2] || 0)
          );
        } else {
          // Si le lancer suivant est un strike
          if (rollScores[rollIndex + 2] === 10 && frameIndex < 8) {
            return 10 + 10 + (rollScores[rollIndex + 4] || 0);
          } else {
            return (
              10 +
              (rollScores[rollIndex + 2] || 0) +
              (rollScores[rollIndex + 3] || 0)
            );
          }
        }
      }

      // Spare
      if (rollScores[rollIndex] + (rollScores[rollIndex + 1] || 0) === 10) {
        // Besoin du lancer suivant pour calculer le score
        if (rollScores[rollIndex + 2] === null && frameIndex < 9) return null;

        // Calcul du score pour un spare
        return 10 + (rollScores[rollIndex + 2] || 0);
      }

      // Score normal
      return rollScores[rollIndex] + (rollScores[rollIndex + 1] || 0);
    },
    [rollScores]
  );

  // Mettre à jour tous les scores des frames
  const updateAllFrameScores = useCallback(() => {
    const newFrameScores = Array(10).fill(null);
    let runningTotal = 0;

    for (let i = 0; i < 10; i++) {
      const frameScore = calculateFrameScore(i);
      if (frameScore === null) break;

      runningTotal += frameScore;
      newFrameScores[i] = runningTotal;
    }

    setFrameScores(newFrameScores);
  }, [calculateFrameScore]);

  // Gérer la fin d'un lancer
  const handleThrowComplete = useCallback(() => {
    // Annuler tous les timers en cours
    clearAllTimers();

    // Mettre à jour le score du lancer actuel
    const newRollScores = [...rollScores];
    newRollScores[rollIndexRef.current] = pinsDown.length;
    setRollScores(newRollScores);

    // Déterminer si c'est un strike ou un spare
    const isStrike = pinsDown.length === 10 && roll === 1;
    const isSpare =
      pinsDown.length + (rollScores[rollIndexRef.current - 1] || 0) === 10 &&
      roll === 2;

    // Logique pour avancer au lancer/frame suivant
    if (frame < 10) {
      // Frames 1-9
      if (isStrike || roll === 2) {
        // Passer à la frame suivante
        setFrame(frame + 1);
        setRoll(1);
        rollIndexRef.current += roll === 1 ? 2 : 1; // Sauter un lancer pour un strike
      } else {
        // Passer au deuxième lancer de la même frame
        setRoll(2);
        rollIndexRef.current += 1;
      }
    } else {
      // Frame 10 (spéciale)
      if (roll === 1) {
        if (isStrike) {
          // Si strike, droit à deux lancers supplémentaires
          setRoll(2);
          rollIndexRef.current += 1;
        } else {
          // Sinon, passer au deuxième lancer
          setRoll(2);
          rollIndexRef.current += 1;
        }
      } else if (roll === 2) {
        if (isStrike || isSpare) {
          // Si strike ou spare au 2e lancer, droit à un lancer supplémentaire
          setRoll(3);
          rollIndexRef.current += 1;
        } else {
          // Sinon, fin du jeu
          setGameOver(true);
        }
      } else {
        // Après le 3e lancer, fin du jeu
        setGameOver(true);
      }
    }

    // Réinitialiser pour le prochain lancer
    setBallThrown(true);
    setControlsEnabled(false);
    setCameraLocked(false);
    setPinsDown([]);
    setWaitingForPin(false);

    // Mettre à jour les scores
    updateAllFrameScores();
  }, [clearAllTimers, frame, pinsDown, roll, rollScores, updateAllFrameScores]);

  // Réinitialiser le jeu pour un nouveau lancer
  const resetBall = useCallback(() => {
    setBallThrown(false);
    setControlsEnabled(true);
    setCameraLocked(false);
    setPinsDown([]);
    setWaitingForPin(false);

    // Réinitialiser la position et la vitesse de la balle
    ballPositionRef.current = [0, 0.5, 5];
    ballVelocityRef.current = [0, 0, 0];
    ballAngularVelocityRef.current = [0, 0, 0];

    // Annuler tous les timers en cours
    clearAllTimers();
  }, [clearAllTimers]);

  // Gestionnaire pour le début du lancer
  const handlePointerDown = useCallback(() => {
    setCameraLocked(true);
  }, []);

  // Gestionnaire pour la fin du lancer
  const handlePointerUp = useCallback(() => {
    // Le ballon a été lancé
    setBallThrown(true);
  }, []);

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 45 }}>
        <color attach="background" args={["#87CEEB"]} />
        <fog attach="fog" args={["#87CEEB", 20, 30]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        <Suspense fallback={null}>
          <Physics
            gravity={[0, PHYSICS.GRAVITY, 0]}
            defaultContactMaterial={{
              friction: 0.2,
              restitution: 0.5,
            }}
            iterations={8}
            allowSleep={true}
          >
            <BowlingLane />
            <Pins onPinFall={handlePinFall} />
            <Ball
              position={ballPositionRef.current}
              velocity={ballVelocityRef.current}
              angularVelocity={ballAngularVelocityRef.current}
              thrown={ballThrown}
              controlsEnabled={controlsEnabled}
              onPositionChange={handlePositionChange}
              onVelocityChange={handleVelocityChange}
              onAngularVelocityChange={handleAngularVelocityChange}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onBallLost={handleBallLost}
              onHitBackWall={handleHitBackWall}
              onBallStopped={handleBallStopped}
            />
          </Physics>

          <Environment preset="sunset" />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2 - 0.1}
          minPolarAngle={Math.PI / 4}
          enablePan={false}
          enabled={!ballThrown && !cameraLocked}
        />
      </Canvas>

      {/* Tableau de score professionnel */}
      <ScoreBoard
        rollScores={rollScores}
        frameScores={frameScores}
        currentFrame={frame}
        currentRoll={roll}
      />

      {/* Panneau de contrôle du jeu */}
      <GameControls
        score={score}
        frame={frame}
        roll={roll}
        pinsDown={pinsDown.length}
        onResetBall={resetBall}
        ballThrown={ballThrown}
      />
    </div>
  );
};

export default BowlingGame;
