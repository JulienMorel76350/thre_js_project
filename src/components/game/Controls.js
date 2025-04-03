import React, { useEffect, useRef } from "react";
import { extend, useThree } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import PropTypes from "prop-types";
import logger from "../../utils/logger";

// Étendre le repertoire de composants fiber avec OrbitControls
extend({ OrbitControls });

/**
 * Composant qui gère les contrôles de la caméra (rotation, zoom, etc.)
 */
const ManagedOrbitControls = ({
  enabled = true,
  reset = false,
  thrown = false,
}) => {
  const controlsRef = useRef();
  const { camera, gl } = useThree();

  // Réinitialiser la caméra si nécessaire
  useEffect(() => {
    if (reset && controlsRef.current) {
      logger.debug("Resetting camera position");
      camera.position.set(0, 5, 20);
      camera.lookAt(0, 0, 0);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [reset, camera]);

  // Bloquer la caméra si la balle n'est pas lancée
  useEffect(() => {
    if (controlsRef.current) {
      if (!thrown) {
        // Sauvegarder la position actuelle
        const currentPosition = camera.position.clone();
        const currentTarget = controlsRef.current.target.clone();

        // Désactiver les contrôles
        controlsRef.current.enabled = false;

        // Restaurer la position après un court délai
        setTimeout(() => {
          if (controlsRef.current) {
            camera.position.copy(currentPosition);
            controlsRef.current.target.copy(currentTarget);
            controlsRef.current.update();
          }
        }, 100);
      } else {
        // Réactiver les contrôles quand la balle est lancée
        controlsRef.current.enabled = true;
      }
    }
  }, [thrown, camera]);

  return (
    <orbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.5}
      enablePan={false}
      minDistance={3}
      maxDistance={30}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI / 2.5}
      enabled={enabled}
    />
  );
};

ManagedOrbitControls.propTypes = {
  enabled: PropTypes.bool,
  reset: PropTypes.bool,
  thrown: PropTypes.bool,
};

export { ManagedOrbitControls };
