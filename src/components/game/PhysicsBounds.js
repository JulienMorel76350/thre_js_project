import React from "react";
import { Box } from "@react-three/drei";
import { useBox } from "@react-three/cannon";
import { PHYSICS, LANE_SETTINGS } from "../../constants/gameSettings";
import { useGameContext } from "../../context/GameContext";
import logger from "../../utils/logger";

const PhysicsBounds = () => {
  const { actions, ballRef } = useGameContext();

  const handleCollision = (e) => {
    if (!e.body?.userData?.isBall) return;

    logger.debug("Ball collision detected");

    // Forcer l'arrêt de la boule
    e.body.api.velocity.set(0, 0, 0);
    e.body.api.angularVelocity.set(0, 0, 0);

    // Mettre à jour l'état de la boule
    if (ballRef.current) {
      ballRef.current.userData.isStopped = true;
    }

    // Attendre un court délai avant de traiter la collision
    setTimeout(() => {
      actions.setThrown(true);
      actions.processFrameEnd();
    }, 500);
  };

  // Mur gauche
  const [leftWallRef] = useBox(() => ({
    args: [0.1, 1, LANE_SETTINGS.LENGTH],
    position: [-LANE_SETTINGS.WIDTH / 2 - 0.1, 0.5, 0],
    type: "Static",
    onCollide: handleCollision,
  }));

  // Mur droit
  const [rightWallRef] = useBox(() => ({
    args: [0.1, 1, LANE_SETTINGS.LENGTH],
    position: [LANE_SETTINGS.WIDTH / 2 + 0.1, 0.5, 0],
    type: "Static",
    onCollide: handleCollision,
  }));

  // Mur arrière (but)
  const [backWallRef] = useBox(() => ({
    args: [LANE_SETTINGS.WIDTH, 1, 0.1],
    position: [0, 0.5, -LANE_SETTINGS.LENGTH / 2 - 0.1],
    type: "Static",
    onCollide: handleCollision,
  }));

  // Mur avant
  const [frontWallRef] = useBox(() => ({
    args: [LANE_SETTINGS.WIDTH, 1, 0.1],
    position: [0, 0.5, LANE_SETTINGS.LENGTH / 2 + 0.1],
    type: "Static",
    onCollide: handleCollision,
  }));

  return (
    <group>
      {/* Murs latéraux */}
      <Box
        ref={leftWallRef}
        args={[0.1, 1, LANE_SETTINGS.LENGTH]}
        position={[-LANE_SETTINGS.WIDTH / 2 - 0.1, 0.5, 0]}
      >
        <meshStandardMaterial
          color="#333333"
          transparent
          opacity={0.3}
          wireframe={false}
        />
      </Box>
      <Box
        ref={rightWallRef}
        args={[0.1, 1, LANE_SETTINGS.LENGTH]}
        position={[LANE_SETTINGS.WIDTH / 2 + 0.1, 0.5, 0]}
      >
        <meshStandardMaterial
          color="#333333"
          transparent
          opacity={0.3}
          wireframe={false}
        />
      </Box>

      {/* Mur arrière (but) */}
      <Box
        ref={backWallRef}
        args={[LANE_SETTINGS.WIDTH, 1, 0.1]}
        position={[0, 0.5, -LANE_SETTINGS.LENGTH / 2 - 0.1]}
      >
        <meshStandardMaterial
          color="#ff0000"
          transparent
          opacity={0.3}
          wireframe={false}
        />
      </Box>

      {/* Mur avant */}
      <Box
        ref={frontWallRef}
        args={[LANE_SETTINGS.WIDTH, 1, 0.1]}
        position={[0, 0.5, LANE_SETTINGS.LENGTH / 2 + 0.1]}
      >
        <meshStandardMaterial
          color="#333333"
          transparent
          opacity={0.3}
          wireframe={false}
        />
      </Box>
    </group>
  );
};

export default PhysicsBounds;
