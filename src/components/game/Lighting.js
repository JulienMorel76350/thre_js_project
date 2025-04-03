import React from "react";

/**
 * Composant pour les lumières de la piste de bowling
 */
const BowlingLights = () => {
  return (
    <>
      {/* Lumière ambiante */}
      <ambientLight intensity={0.2} />

      {/* Éclairage principal de la piste */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Lumière au-dessus des quilles */}
      <pointLight
        position={[0, 5, -15]}
        intensity={0.5}
        color="#ffffff"
        castShadow
      />

      {/* Lumière colorée pour ambiance */}
      <pointLight
        position={[-5, 2, 0]}
        intensity={0.2}
        color="#3677ff"
        distance={15}
      />
      <pointLight
        position={[5, 2, 0]}
        intensity={0.2}
        color="#ff3658"
        distance={15}
      />
    </>
  );
};

export { BowlingLights };
