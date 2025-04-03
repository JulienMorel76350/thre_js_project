import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { PHYSICS } from "../../constants/gameSettings";
import "./PowerBar.css";

const PowerBar = ({ controlsEnabled, onThrow }) => {
  const [isCharging, setIsCharging] = useState(false);
  const [chargeStartTime, setChargeStartTime] = useState(0);
  const [throwPower, setThrowPower] = useState(0);

  const handlePointerDown = (e) => {
    if (!controlsEnabled) return;

    setIsCharging(true);
    setChargeStartTime(Date.now());
    setThrowPower(0);
  };

  const handlePointerMove = (e) => {
    if (!isCharging || !controlsEnabled) return;

    const currentTime = Date.now();
    const chargeTime = Math.min(
      currentTime - chargeStartTime,
      PHYSICS.MAX_CHARGE_TIME
    );
    const power = Math.min(
      PHYSICS.MAX_THROW_SPEED,
      Math.max(
        PHYSICS.MIN_THROW_SPEED,
        (chargeTime / PHYSICS.MAX_CHARGE_TIME) * PHYSICS.MAX_THROW_SPEED
      )
    );

    setThrowPower(power);
  };

  const handlePointerUp = (e) => {
    if (!isCharging || !controlsEnabled) return;

    setIsCharging(false);
    if (throwPower > 0) {
      onThrow(throwPower);
    }
    setThrowPower(0);
  };

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isCharging) {
        handlePointerUp();
      }
    };

    window.addEventListener("pointerup", handleGlobalPointerUp);
    return () => window.removeEventListener("pointerup", handleGlobalPointerUp);
  }, [isCharging, throwPower]);

  return (
    <div
      className="power-bar-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="power-bar"
        style={{
          width: `${(throwPower / PHYSICS.MAX_THROW_SPEED) * 100}%`,
          backgroundColor: `hsl(${
            (throwPower / PHYSICS.MAX_THROW_SPEED) * 120
          }, 100%, 50%)`,
        }}
      />
    </div>
  );
};

PowerBar.propTypes = {
  controlsEnabled: PropTypes.bool.isRequired,
  onThrow: PropTypes.func.isRequired,
};

export default PowerBar;
