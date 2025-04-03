import React from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

export const CameraFollow = () => {
  const { camera } = useThree();

  useFrame(() => {
    // Position de la caméra
    const cameraOffset = new Vector3(0, 2, 15);
    const targetOffset = new Vector3(0, 0, -15);

    camera.position.copy(cameraOffset);
    camera.lookAt(targetOffset);
    camera.updateProjectionMatrix();
  });

  return null;
};
