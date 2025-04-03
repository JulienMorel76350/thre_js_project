import React from "react";
import { Sparkles as DreiSparkles } from "@react-three/drei";

export const BallSparkles = () => {
  return (
    <DreiSparkles count={20} scale={1} size={1} speed={0.2} color="#ffffff" />
  );
};
