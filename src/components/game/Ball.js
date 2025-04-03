import React, { useRef, useState, useEffect, useMemo } from "react";
import { useSphere } from "@react-three/cannon";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { BALL_SETTINGS } from "../../constants/gameSettings";

// Composant pour afficher l'indicateur de puissance et la direction
const PowerIndicator = React.memo(({ power, maxPower, direction }) => {
  const percentage = (power / maxPower) * 100;
  const color = `hsl(${120 - percentage * 1.2}, 100%, 50%)`;

  // Calculer la position de la flèche de direction
  const arrowLength = 0.8 * (power / maxPower); // Longueur réduite proportionnelle à la puissance

  return (
    <>
      {/* Barre de puissance */}
      <Html center position={[0, 1.2, 0]} zIndexRange={[100, 0]}>
        <div
          style={{
            width: "120px",
            height: "15px",
            background: "rgba(0,0,0,0.7)",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 0 8px rgba(0,0,0,0.7)",
            border: "2px solid white",
          }}
        >
          <div
            style={{
              width: `${percentage}%`,
              height: "100%",
              background: color,
              transition: "width 0.05s ease-out",
            }}
          />
        </div>
        <div
          style={{
            color: "white",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
            textShadow: "1px 1px 2px black",
            marginTop: "5px",
          }}
        >
          {Math.round(percentage)}%
        </div>
      </Html>

      {/* Flèche de direction positionnée directement sur la balle */}
      <group>
        {/* Utiliser un cylindre pour la ligne principale */}
        <mesh
          position={[
            ((direction.x * arrowLength) / 2) * 0.6,
            0.1,
            ((direction.z * arrowLength) / 2) * 0.6,
          ]}
          rotation={[Math.PI / 2, 0, -Math.atan2(direction.z, direction.x)]}
          scale={[1, (arrowLength / 2) * 0.6, 1]}
        >
          <cylinderGeometry args={[0.03, 0.03, 1]} />
          <meshBasicMaterial color="red" />
        </mesh>

        {/* Pointe de la flèche */}
        <mesh
          position={[
            direction.x * arrowLength * 0.6,
            0.1,
            direction.z * arrowLength * 0.6,
          ]}
          rotation={[Math.PI / 2, 0, -Math.atan2(direction.z, direction.x)]}
        >
          <coneGeometry args={[0.08, 0.25, 8]} />
          <meshBasicMaterial color="red" />
        </mesh>
      </group>
    </>
  );
});

const Ball = ({
  position = [0, 0.5, 5],
  velocity = [0, 0, 0],
  angularVelocity = [0, 0, 0],
  thrown = false,
  controlsEnabled = true,
  onThrowComplete,
  onPositionChange,
  onVelocityChange,
  onAngularVelocityChange,
  onPointerDown,
  onPointerUp,
  onBallLost,
  onHitBackWall,
  onBallStopped,
}) => {
  // Paramètres de sphere mémorisés pour éviter les recréations inutiles
  const sphereParams = useMemo(
    () => ({
      mass: BALL_SETTINGS.MASS,
      position,
      args: [BALL_SETTINGS.RADIUS],
      material: {
        friction: BALL_SETTINGS.FRICTION,
        restitution: BALL_SETTINGS.RESTITUTION,
      },
      linearDamping: 0.2, // Réduit pour moins de résistance
      angularDamping: 0.2, // Réduit pour moins de résistance
      allowSleep: false, // Empêcher la balle de s'endormir
      fixedRotation: false, // Permettre la rotation
      type: "Dynamic",
      userData: { isBall: true },
    }),
    [position]
  );

  const [ballRef, api] = useSphere(() => sphereParams);

  const [isBallThrown, setIsBallThrown] = useState(thrown);
  const [currentPower, setCurrentPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const chargeStartTimeRef = useRef(null);
  const hitBackWall = useRef(false);
  const isBallStopped = useRef(false);

  // Références pour le lance-pierre
  const dragStartPosRef = useRef(null);
  const currentDragPosRef = useRef(null);
  const throwDirectionRef = useRef({ x: 0, z: -1 });

  // Surveiller la position et les vitesses pour détecter les changements
  useEffect(() => {
    if (api) {
      // Souscrire aux changements de position
      const unsubPosition = api.position.subscribe((position) => {
        if (onPositionChange) {
          onPositionChange(position);
        }
        // Vérifier si la balle est tombée sous la piste
        if (position[1] < -2 && !isBallStopped.current) {
          if (onBallLost) onBallLost();
        }
        // Vérifier si la balle a atteint le mur du fond
        if (position[2] < -14 && !hitBackWall.current) {
          hitBackWall.current = true;
          if (onHitBackWall) onHitBackWall();
        }
      });

      // Souscrire aux changements de vitesse
      const unsubVelocity = api.velocity.subscribe((velocity) => {
        if (onVelocityChange) {
          onVelocityChange(velocity);
        }
        // Vérifier si la balle s'est arrêtée
        const speed = Math.sqrt(
          velocity[0] * velocity[0] +
            velocity[1] * velocity[1] +
            velocity[2] * velocity[2]
        );
        if (isBallThrown && speed < 0.1 && !isBallStopped.current) {
          isBallStopped.current = true;
          if (onBallStopped) onBallStopped();
        }
      });

      // Nettoyer les souscriptions
      return () => {
        unsubPosition();
        unsubVelocity();
      };
    }
  }, [
    api,
    onPositionChange,
    onVelocityChange,
    onBallLost,
    onHitBackWall,
    onBallStopped,
    isBallThrown,
  ]);

  // Calculer la puissance pendant le chargement
  useFrame(() => {
    if (isCharging && chargeStartTimeRef.current) {
      const chargeTime = Date.now() - chargeStartTimeRef.current;
      const maxChargeTime = 2000; // 2 secondes pour atteindre la puissance maximale
      const power = Math.min(chargeTime / maxChargeTime, 1) * 100;
      setCurrentPower(power);
    }
  });

  // Mettre à jour la position initiale
  useEffect(() => {
    if (api && position) {
      api.position.set(position[0], position[1], position[2]);
    }
  }, [api, position]);

  // Wrapper pour onThrowComplete
  const handleThrowComplete = () => {
    setIsBallThrown(true);
    if (onThrowComplete) {
      onThrowComplete();
    }
  };

  // Gestionnaire de début de drag (commence à charger le lance-pierre)
  const handlePointerDown = (e) => {
    if (!isBallThrown && controlsEnabled && e.point) {
      setIsCharging(true);
      chargeStartTimeRef.current = Date.now();
      dragStartPosRef.current = { x: e.point.x, z: e.point.z };
      currentDragPosRef.current = { x: e.point.x, z: e.point.z };
      setCurrentPower(0);

      // Notifier le parent que l'utilisateur a commencé à interagir
      if (onPointerDown) onPointerDown();
    }
  };

  // Gestion de la direction de lancement
  const handlePointerMove = (e) => {
    if (!controlsEnabled || !isCharging || !e.point || !dragStartPosRef.current)
      return;

    // Calculer le vecteur de direction à partir du point de départ
    const dx = e.point.x - dragStartPosRef.current.x;
    const dz = e.point.z - dragStartPosRef.current.z;

    // Calculer la distance pour la puissance
    const distance = Math.sqrt(dx * dx + dz * dz);
    const maxDistance = 0.5; // Réduit de 1 à 0.5 pour une distance maximale plus courte
    const power = Math.min(distance / maxDistance, 1) * 100;
    setCurrentPower(power);

    // Calculer la direction normalisée
    if (distance > 0.05) {
      // Réduit le seuil minimum de 0.1 à 0.05
      const direction = {
        x: -dx / distance,
        y: 0,
        z: -dz / distance,
      };
      throwDirectionRef.current = direction;
    }
  };

  // Gestion du lancement
  const handlePointerUp = (e) => {
    if (!controlsEnabled || !isCharging) return;

    try {
      if (api) {
        api.wakeUp();
        const throwPower = currentPower * 1.2; // Réduit de 3 à 1.2 pour beaucoup moins de puissance
        const throwVelocity = {
          x: throwDirectionRef.current.x * throwPower,
          y: 0, // Pas de hauteur initiale
          z: throwDirectionRef.current.z * throwPower,
        };
        const throwAngularVelocity = {
          x: (Math.random() - 0.5) * 0.1, // Réduit de 0.2 à 0.1 pour moins de rotation
          y: (Math.random() - 0.5) * 0.1,
          z: (Math.random() - 0.5) * 0.1,
        };

        api.velocity.set(throwVelocity.x, throwVelocity.y, throwVelocity.z);
        api.angularVelocity.set(
          throwAngularVelocity.x,
          throwAngularVelocity.y,
          throwAngularVelocity.z
        );

        // Augmenter l'amortissement pour ralentir la balle plus rapidement
        api.linearDamping.set(0.5);
        api.angularDamping.set(0.5);

        console.log("Ball thrown with velocity:", throwVelocity);
      }
    } catch (error) {
      console.error("Error throwing ball:", error);
    }

    setIsCharging(false);
    chargeStartTimeRef.current = null;
    setCurrentPower(0);
    throwDirectionRef.current = { x: 0, z: -1 };

    // Notifier le parent que l'utilisateur a terminé l'interaction
    if (onPointerUp) onPointerUp();
  };

  // Mémoriser les géométries/matériaux pour éviter les recreations
  const ballGeometry = useMemo(
    () => <sphereGeometry args={[BALL_SETTINGS.RADIUS, 24, 24]} />,
    []
  );

  const ballMaterial = useMemo(
    () => (
      <meshStandardMaterial
        color={BALL_SETTINGS.COLOR}
        roughness={0.2}
        metalness={0.8}
      />
    ),
    []
  );

  useEffect(() => {
    setIsBallThrown(thrown);
    if (!thrown) {
      // Réinitialiser les références quand on recommence
      hitBackWall.current = false;
      isBallStopped.current = false;
    }
  }, [thrown]);

  return (
    <group>
      <mesh
        ref={ballRef}
        castShadow
        receiveShadow
        onPointerDown={controlsEnabled ? handlePointerDown : undefined}
        onPointerMove={controlsEnabled ? handlePointerMove : undefined}
        onPointerUp={controlsEnabled ? handlePointerUp : undefined}
      >
        {ballGeometry}
        {ballMaterial}
      </mesh>

      {/* Afficher l'indicateur de puissance et la direction pendant le chargement */}
      {isCharging && (
        <PowerIndicator
          power={currentPower}
          maxPower={100}
          direction={throwDirectionRef.current}
        />
      )}
    </group>
  );
};

export default React.memo(Ball);
