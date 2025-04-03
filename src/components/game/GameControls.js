import React from "react";
import PropTypes from "prop-types";

const GameControls = ({
  score,
  frame,
  roll,
  pinsDown,
  onResetBall,
  ballThrown,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "110px",
        right: "20px",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "15px",
        borderRadius: "10px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
        width: "200px",
      }}
    >
      <h3
        style={{
          margin: "0 0 15px 0",
          textAlign: "center",
          color: "#FFD700",
          textShadow: "1px 1px 2px black",
        }}
      >
        Game Controls
      </h3>

      <div style={{ marginBottom: "10px" }}>
        <strong>Current Score:</strong> {score}
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>Frame:</strong> {frame} / 10
      </div>

      <div style={{ marginBottom: "10px" }}>
        <strong>Roll:</strong> {roll}
      </div>

      <div style={{ marginBottom: "15px" }}>
        <strong>Pins Down:</strong> {pinsDown} / 10
      </div>

      <div style={{ marginBottom: "10px", fontSize: "14px", color: "#ccc" }}>
        {!ballThrown
          ? "👉 Drag to aim and set power"
          : "👍 Ball thrown! Reset for next throw"}
      </div>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button
          onClick={onResetBall}
          disabled={!ballThrown}
          style={{
            padding: "8px 16px",
            backgroundColor: ballThrown ? "#4CAF50" : "#666",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: ballThrown ? "pointer" : "default",
            fontSize: "14px",
            width: "100%",
            opacity: ballThrown ? 1 : 0.6,
          }}
        >
          Reset Ball
        </button>
      </div>
    </div>
  );
};

GameControls.propTypes = {
  score: PropTypes.number.isRequired,
  frame: PropTypes.number.isRequired,
  roll: PropTypes.number.isRequired,
  pinsDown: PropTypes.number.isRequired,
  onResetBall: PropTypes.func.isRequired,
  ballThrown: PropTypes.bool.isRequired,
};

export default GameControls;
