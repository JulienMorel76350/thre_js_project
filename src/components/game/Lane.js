import React from "react";
import { useBox } from "@react-three/cannon";
import { LANE_SETTINGS } from "../../constants/gameSettings";
import logger from "../../utils/logger";

/**
 * Composant pour la piste de bowling
 */
const Lane = () => {
  // Physique de la piste
  const [ref] = useBox(() => ({
    args: [LANE_SETTINGS.WIDTH, 0.2, LANE_SETTINGS.LENGTH],
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    type: "static",
    material: {
      friction: 0.1,
      restitution: 0.5,
    },
  }));

  logger.debug("Rendering bowling lane");

  return (
    <>
      <mesh ref={ref} receiveShadow>
        <boxGeometry args={[LANE_SETTINGS.WIDTH, 0.2, LANE_SETTINGS.LENGTH]} />
        <meshStandardMaterial color="#66a398" metalness={0.3} roughness={0.8} />
      </mesh>
    </>
  );
};

/**
 * Composant pour les gouttières de la piste
 */
const Gutters = () => {
  // Gouttière gauche
  const [leftRef] = useBox(() => ({
    args: [
      LANE_SETTINGS.GUTTER_WIDTH,
      LANE_SETTINGS.GUTTER_HEIGHT,
      LANE_SETTINGS.LENGTH,
    ],
    position: [
      -LANE_SETTINGS.WIDTH / 2 - LANE_SETTINGS.GUTTER_WIDTH / 2,
      LANE_SETTINGS.GUTTER_HEIGHT / 2 - 0.1,
      0,
    ],
    rotation: [0, 0, -Math.PI / 4],
    type: "static",
    material: {
      friction: 0.5,
      restitution: 0.3,
    },
  }));

  // Gouttière droite
  const [rightRef] = useBox(() => ({
    args: [
      LANE_SETTINGS.GUTTER_WIDTH,
      LANE_SETTINGS.GUTTER_HEIGHT,
      LANE_SETTINGS.LENGTH,
    ],
    position: [
      LANE_SETTINGS.WIDTH / 2 + LANE_SETTINGS.GUTTER_WIDTH / 2,
      LANE_SETTINGS.GUTTER_HEIGHT / 2 - 0.1,
      0,
    ],
    rotation: [0, 0, Math.PI / 4],
    type: "static",
    material: {
      friction: 0.5,
      restitution: 0.3,
    },
  }));

  logger.debug("Rendering gutters");

  return (
    <>
      {/* Gouttière gauche */}
      <mesh ref={leftRef} receiveShadow>
        <boxGeometry
          args={[
            LANE_SETTINGS.GUTTER_WIDTH,
            LANE_SETTINGS.GUTTER_HEIGHT,
            LANE_SETTINGS.LENGTH,
          ]}
        />
        <meshStandardMaterial color="#444" roughness={0.8} />
      </mesh>

      {/* Gouttière droite */}
      <mesh ref={rightRef} receiveShadow>
        <boxGeometry
          args={[
            LANE_SETTINGS.GUTTER_WIDTH,
            LANE_SETTINGS.GUTTER_HEIGHT,
            LANE_SETTINGS.LENGTH,
          ]}
        />
        <meshStandardMaterial color="#444" roughness={0.8} />
      </mesh>
    </>
  );
};

export { Lane, Gutters };
