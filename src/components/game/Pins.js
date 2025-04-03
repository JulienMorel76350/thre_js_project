import React, { useRef, useMemo, useEffect, useState } from "react";
import { useBox } from "@react-three/cannon";
import PropTypes from "prop-types";
import { PIN_SETTINGS } from "../../constants/gameSettings";
import { useFrame } from "@react-three/fiber";

// Définition des positions des quilles
const PIN_POSITIONS = [
  [0, 0.5, -10], // Premier rang (1 quille)
  [-0.4, 0.5, -10.6], // Deuxième rang (2 quilles)
  [0.4, 0.5, -10.6],
  [-0.8, 0.5, -11.2], // Troisième rang (3 quilles)
  [0, 0.5, -11.2],
  [0.8, 0.5, -11.2],
  [-1.2, 0.5, -11.8], // Quatrième rang (4 quilles)
  [-0.4, 0.5, -11.8],
  [0.4, 0.5, -11.8],
  [1.2, 0.5, -11.8],
];

// Composant Pin optimisé
const Pin = React.memo(
  ({ position, onCollide, pinIndex, isPhysicsEnabled }) => {
    const [pinRef, api] = useBox(() => ({
      mass: 2.0,
      position,
      args: [0.15, 0.6, 0.15],
      material: {
        friction: 0.3,
        restitution: 0.4,
        linearDamping: 0.2,
        angularDamping: 0.2,
      },
      allowSleep: true,
      sleepSpeedLimit: 0.1,
      fixedRotation: false,
      type: "Dynamic",
      userData: { isPin: true, pinIndex },
      onCollide: (e) => {
        if (e.body?.userData?.isBall && isPhysicsEnabled) {
          onCollide(pinIndex);
        }
      },
    }));

    // État pour suivre si la quille est tombée
    const [isFallen, setIsFallen] = useState(false);
    const rotationRef = useRef([0, 0, 0]);

    // Souscrire aux changements de rotation
    useEffect(() => {
      if (api) {
        const unsubscribe = api.rotation.subscribe((rotation) => {
          rotationRef.current = rotation;
        });
        return unsubscribe;
      }
    }, [api]);

    // Vérifier l'inclinaison de la quille pour détecter si elle est tombée
    useFrame(() => {
      if (isPhysicsEnabled && !isFallen && pinRef.current) {
        const rotation = rotationRef.current;
        const tiltAngle = Math.sqrt(
          rotation[0] * rotation[0] + rotation[2] * rotation[2]
        );

        // Si la quille est suffisamment inclinée, la considérer comme tombée
        if (tiltAngle > 0.5) {
          // Environ 30 degrés
          setIsFallen(true);
          onCollide(pinIndex);
        }
      }
    });

    // Géométrie et matériau mémorisés
    const pinGeometry = useMemo(
      () => (
        <group>
          {/* Corps principal de la quille */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
          </mesh>
          {/* Tête de la quille */}
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
          </mesh>
          {/* Base de la quille */}
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.15, 16]} />
          </mesh>
        </group>
      ),
      []
    );

    const pinMaterial = useMemo(
      () => (
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.5}
          metalness={0.1}
          envMapIntensity={0.5}
          transparent={false}
          opacity={1}
          side={2}
        />
      ),
      []
    );

    // Gérer l'activation/désactivation de la physique
    useEffect(() => {
      if (api) {
        if (!isPhysicsEnabled) {
          api.sleep();
          api.fixedRotation.set(true);
        } else {
          api.wakeUp();
          api.fixedRotation.set(false);
        }
      }
    }, [api, isPhysicsEnabled]);

    return (
      <mesh ref={pinRef} castShadow receiveShadow>
        {pinGeometry}
        {pinMaterial}
      </mesh>
    );
  }
);

// Composant Pins principal
const Pins = ({ onPinFall }) => {
  const [isPhysicsEnabled, setIsPhysicsEnabled] = useState(false);
  // Garder une trace des quilles qui sont tombées
  const fallenPins = useRef(new Set());

  // Délai avant d'activer la physique
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPhysicsEnabled(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Gestionnaire pour une quille tombée
  const handlePinFall = (pinIndex) => {
    if (!fallenPins.current.has(pinIndex)) {
      fallenPins.current.add(pinIndex);
      onPinFall(pinIndex);
    }
  };

  return (
    <group>
      {PIN_POSITIONS.map((position, index) => (
        <Pin
          key={`pin-${index}`}
          position={position}
          pinIndex={index}
          onCollide={handlePinFall}
          isPhysicsEnabled={isPhysicsEnabled}
        />
      ))}
    </group>
  );
};

Pins.propTypes = {
  onPinFall: PropTypes.func.isRequired,
};

export default React.memo(Pins);
