import { useRef, useCallback } from "react";
import { useBox } from "@react-three/cannon";
import { PIN_SETTINGS } from "../constants/gameSettings";
import logger from "../utils/logger";

/**
 * Hook personnalisé pour gérer la physique des quilles
 * @param {object} options Options de configuration
 * @param {Array} options.position Position de la quille [x, y, z]
 * @param {number} options.index Index de la quille
 * @param {function} options.onFall Callback appelé quand la quille tombe
 */
export const usePinPhysics = ({ position, index, onFall }) => {
  // Référence à la quille
  const pinRef = useRef();

  // État de la quille
  const fallen = useRef(false);
  const initialPosition = useRef(position);
  const currentRotation = useRef([0, 0, 0]);

  // Configuration du corps physique de la quille
  const [ref, api] = useBox(() => ({
    mass: PIN_SETTINGS.MASS,
    args: PIN_SETTINGS.SIZE,
    position,
    restitution: PIN_SETTINGS.RESTITUTION,
    friction: PIN_SETTINGS.FRICTION,
  }));

  // Détection de chute basée sur la rotation
  const checkFallStatus = useCallback(
    (rotation) => {
      if (!rotation || fallen.current) return;

      // Une quille est considérée comme tombée si elle est très inclinée
      const isTilted =
        Math.abs(rotation[0]) > PIN_SETTINGS.TILT_THRESHOLD ||
        Math.abs(rotation[2]) > PIN_SETTINGS.TILT_THRESHOLD;

      if (isTilted && !fallen.current) {
        logger.debug(`Pin ${index} has fallen`, { rotation });
        fallen.current = true;

        if (onFall) {
          onFall(index);
        }
      }
    },
    [index, onFall]
  );

  // Souscription aux changements de rotation
  const subscribeToRotation = useCallback(() => {
    return api.rotation.subscribe((rotation) => {
      currentRotation.current = rotation;
      checkFallStatus(rotation);
    });
  }, [api, checkFallStatus]);

  // Animer la quille (petite oscillation quand elle est debout)
  const animate = useCallback(
    (time) => {
      if (!fallen.current && ref.current) {
        try {
          const oscillation = Math.sin(time + index) * 0.01;
          api.rotation.set(oscillation, 0, oscillation);
        } catch (error) {
          logger.error(`Error animating pin ${index}`, error);
        }
      }
    },
    [api, index, ref]
  );

  // Réinitialiser la quille
  const reset = useCallback(() => {
    logger.debug(`Resetting pin ${index}`);
    api.position.set(...initialPosition.current);
    api.rotation.set(0, 0, 0);
    api.velocity.set(0, 0, 0);
    api.angularVelocity.set(0, 0, 0);
    fallen.current = false;
    currentRotation.current = [0, 0, 0];
  }, [api, index]);

  // Vérifier si la quille est tombée
  const isFallen = useCallback(() => {
    return fallen.current;
  }, []);

  return {
    ref,
    pinRef,
    api,
    fallen: fallen.current,
    subscribeToRotation,
    animate,
    reset,
    isFallen,
  };
};

export default usePinPhysics;
