import React from "react";
import { useBox } from "@react-three/cannon";
import { LANE_SETTINGS } from "../../constants/gameSettings";
import logger from "../../utils/logger";

/**
 * Composant pour la zone arrière de la piste
 */
const BackArea = () => {
  // Physique de la zone arrière
  const [backRef] = useBox(() => ({
    args: [LANE_SETTINGS.WIDTH * 2, 0.2, 100],
    position: [0, 0, -LANE_SETTINGS.LENGTH / 2 - 1],
    rotation: [0, 0, 0],
    type: "static",
    material: {
      friction: 0.5,
      restitution: 0.3,
    },
  }));

  logger.debug("Rendering back area");

  return (
    <mesh ref={backRef} receiveShadow>
      <boxGeometry args={[LANE_SETTINGS.WIDTH * 2, 0.2, 2]} />
      <meshStandardMaterial color="#333" roughness={1} />
    </mesh>
  );
};

export { BackArea };
