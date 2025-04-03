import { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { BALL_SETTINGS, PHYSICS } from "../constants/gameSettings";
import logger from "../utils/logger";

/**
 * Hook personnalisé pour gérer la physique de la boule de bowling
 * @param {object} options Options de configuration
 * @param {Array} options.initialPosition Position initiale de la boule [x, y, z]
 * @param {boolean} options.thrown État indiquant si la boule a été lancée
 * @param {function} options.onPositionChange Callback appelé quand la position change
 * @param {function} options.onVelocityChange Callback appelé quand la vélocité change
 * @param {function} options.onAngularVelocityChange Callback appelé quand la vélocité angulaire change
 */
export const useBallPhysics = ({
  ballRef,
  api,
  onThrowComplete,
  onPositionChange,
  onVelocityChange,
  onAngularVelocityChange,
}) => {
  const [isCharging, setIsCharging] = useState(false);
  const [power, setPower] = useState(0);
  const chargeStartTimeRef = useRef(0);
  const throwDirectionRef = useRef(new Vector3(0, 0, -1));

  // Mise à jour de la puissance pendant le chargement
  useFrame(() => {
    if (isCharging) {
      const currentTime = Date.now();
      const elapsedTime = currentTime - chargeStartTimeRef.current;
      const powerPercentage = Math.min(elapsedTime / 2000, 1.0); // Charge max en 2 secondes
      const newPower =
        PHYSICS.MIN_THROW_SPEED +
        powerPercentage * (PHYSICS.MAX_THROW_SPEED - PHYSICS.MIN_THROW_SPEED);

      setPower(newPower);
    }
  });

  const handlePointerDown = (e) => {
    if (ballRef.current) {
      logger.debug("Starting power charge");
      setIsCharging(true);
      setPower(PHYSICS.MIN_THROW_SPEED);
      chargeStartTimeRef.current = Date.now();

      // Direction par défaut vers l'avant (vers les quilles)
      throwDirectionRef.current.set(0, 0, -1);
    }
  };

  const handlePointerMove = (e) => {
    if (isCharging && e.point && ballRef.current) {
      // Ajuster la direction horizontale (gauche/droite)
      // Obtenir la position actuelle de la balle
      const ballPos = ballRef.current.position;

      // Calculer la direction à partir de la position de la souris par rapport à la balle
      const direction = new Vector3();
      direction.x = (e.point.x - ballPos.x) * 0.2; // Facteur pour contrôler l'amplitude
      direction.z = -1; // Toujours vers l'avant
      direction.normalize();

      // Sauvegarder la direction pour le lancement
      throwDirectionRef.current.copy(direction);
    }
  };

  const handlePointerUp = (e) => {
    if (isCharging && ballRef.current && api) {
      logger.debug("Releasing ball with power:", power);
      setIsCharging(false);

      // Utiliser la direction calculée pendant le mouvement
      const throwDirection = throwDirectionRef.current;

      // Appliquer la vélocité
      const velocity = throwDirection.clone().multiplyScalar(power);
      api.velocity.set(velocity.x, 0, velocity.z);

      // Appliquer une rotation pour l'effet
      const spinFactor = power * 0.1;
      api.angularVelocity.set(
        -throwDirection.z * spinFactor,
        0,
        throwDirection.x * spinFactor
      );

      // Informer le jeu que la balle a été lancée
      onThrowComplete();

      setPower(0);
    }
  };

  // Gérer l'annulation du lancement si l'utilisateur quitte la zone
  const handlePointerLeave = () => {
    if (isCharging) {
      setIsCharging(false);
      setPower(0);
    }
  };

  // Enregistrer les mises à jour de position et vélocité
  useFrame(() => {
    if (ballRef.current) {
      try {
        // Mettre à jour la position
        if (ballRef.current.position) {
          onPositionChange?.(ballRef.current.position.toArray());
        }

        // Mettre à jour la vélocité et la vélocité angulaire si l'API est disponible
        if (api) {
          // Lire la vélocité actuelle
          api.velocity.subscribe((v) => {
            onVelocityChange?.(v);
          });

          // Lire la vélocité angulaire actuelle
          api.angularVelocity.subscribe((v) => {
            onAngularVelocityChange?.(v);
          });
        }
      } catch (error) {
        logger.error("Error in physics update:", error);
      }
    }
  });

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
    isCharging,
    power,
    maxPower: PHYSICS.MAX_THROW_SPEED,
  };
};

export default useBallPhysics;
