import React, { useMemo } from "react";
import { useBox } from "@react-three/cannon";
import { LANE_SETTINGS } from "../../constants/gameSettings";

// Optimisation: utiliser React.memo pour éviter les render inutiles
const BowlingLane = React.memo(() => {
  // Mémoriser les paramètres physiques
  const laneProps = useMemo(
    () => ({
      args: [LANE_SETTINGS.WIDTH, LANE_SETTINGS.HEIGHT, LANE_SETTINGS.LENGTH],
      position: [0, 0, -3], // Ajusté pour être plus proche de la position initiale de la balle
      type: "static",
      material: {
        friction: 0.1, // Friction réduite pour une meilleure performance
        restitution: 0.1,
      },
    }),
    []
  );

  const gutterLeftProps = useMemo(
    () => ({
      args: [
        LANE_SETTINGS.GUTTER_WIDTH,
        LANE_SETTINGS.GUTTER_HEIGHT,
        LANE_SETTINGS.LENGTH,
      ],
      position: [
        -(LANE_SETTINGS.WIDTH / 2 + LANE_SETTINGS.GUTTER_WIDTH / 2),
        0,
        -3,
      ], // Ajusté à la même position que la piste
      type: "static",
      material: {
        friction: 0.1,
        restitution: 0.1,
      },
    }),
    []
  );

  const gutterRightProps = useMemo(
    () => ({
      args: [
        LANE_SETTINGS.GUTTER_WIDTH,
        LANE_SETTINGS.GUTTER_HEIGHT,
        LANE_SETTINGS.LENGTH,
      ],
      position: [
        LANE_SETTINGS.WIDTH / 2 + LANE_SETTINGS.GUTTER_WIDTH / 2,
        0,
        -3,
      ], // Ajusté à la même position que la piste
      type: "static",
      material: {
        friction: 0.1,
        restitution: 0.1,
      },
    }),
    []
  );

  // Ajout d'un mur à la fin pour empêcher les quilles de tomber
  const backWallProps = useMemo(
    () => ({
      args: [LANE_SETTINGS.WIDTH + 2 * LANE_SETTINGS.GUTTER_WIDTH, 1.0, 0.5],
      position: [0, 0.5, -13], // Positionné juste après les quilles
      type: "static",
      material: {
        friction: 0.3,
        restitution: 0.2,
      },
    }),
    []
  );

  const [laneRef] = useBox(() => laneProps);
  const [gutterLeftRef] = useBox(() => gutterLeftProps);
  const [gutterRightRef] = useBox(() => gutterRightProps);
  const [backWallRef] = useBox(() => backWallProps);

  // Mémoriser les géométries et matériaux
  const laneGeometry = useMemo(
    () => (
      <boxGeometry
        args={[LANE_SETTINGS.WIDTH, LANE_SETTINGS.HEIGHT, LANE_SETTINGS.LENGTH]}
      />
    ),
    []
  );

  const laneMaterial = useMemo(
    () => (
      <meshStandardMaterial color="#c4a66a" roughness={0.6} metalness={0.1} />
    ),
    []
  );

  const gutterGeometry = useMemo(
    () => (
      <boxGeometry
        args={[
          LANE_SETTINGS.GUTTER_WIDTH,
          LANE_SETTINGS.GUTTER_HEIGHT,
          LANE_SETTINGS.LENGTH,
        ]}
      />
    ),
    []
  );

  const gutterMaterial = useMemo(
    () => (
      <meshStandardMaterial color="#333333" roughness={0.5} metalness={0.1} />
    ),
    []
  );

  const backWallGeometry = useMemo(
    () => (
      <boxGeometry
        args={[LANE_SETTINGS.WIDTH + 2 * LANE_SETTINGS.GUTTER_WIDTH, 1.0, 0.5]}
      />
    ),
    []
  );

  const backWallMaterial = useMemo(
    () => (
      <meshStandardMaterial color="#8b4513" roughness={0.7} metalness={0.1} />
    ),
    []
  );

  return (
    <group>
      {/* Piste principale */}
      <mesh ref={laneRef} receiveShadow>
        {laneGeometry}
        {laneMaterial}
      </mesh>

      {/* Gouttières */}
      <mesh ref={gutterLeftRef} receiveShadow>
        {gutterGeometry}
        {gutterMaterial}
      </mesh>

      <mesh ref={gutterRightRef} receiveShadow>
        {gutterGeometry}
        {gutterMaterial}
      </mesh>

      {/* Mur arrière pour empêcher les quilles de tomber */}
      <mesh ref={backWallRef} receiveShadow>
        {backWallGeometry}
        {backWallMaterial}
      </mesh>
    </group>
  );
});

export default BowlingLane;
