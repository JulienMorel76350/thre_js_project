import React from "react";
import PropTypes from "prop-types";

// Composant pour afficher un cadre de score
const ScoreFrame = ({ frameNumber, rolls, frameScore, isActive }) => {
  return (
    <div
      className={`score-frame ${isActive ? "active" : ""}`}
      style={{
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "5px",
        width: frameNumber === 10 ? "100px" : "80px",
        background: isActive
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(0, 0, 0, 0.3)",
        margin: "0 3px",
      }}
    >
      <div
        className="frame-header"
        style={{
          borderBottom: "1px solid #aaa",
          textAlign: "center",
          fontWeight: "bold",
          padding: "2px 0",
        }}
      >
        {frameNumber}
      </div>
      <div
        className="frame-rolls"
        style={{
          display: "flex",
          justifyContent: "space-between",
          height: "30px",
        }}
      >
        {/* Premier lancer */}
        <div
          className="roll"
          style={{
            width: "40%",
            textAlign: "center",
            padding: "5px 0",
            borderRight: "1px solid #aaa",
          }}
        >
          {formatRoll(rolls[0])}
        </div>

        {/* Deuxième lancer */}
        <div
          className="roll"
          style={{
            width: frameNumber === 10 ? "30%" : "40%",
            textAlign: "center",
            padding: "5px 0",
            borderRight: frameNumber === 10 ? "1px solid #aaa" : "none",
          }}
        >
          {formatRoll(rolls[1], rolls[0] === 10 ? null : rolls[0])}
        </div>

        {/* Troisième lancer (uniquement pour le frame 10) */}
        {frameNumber === 10 && (
          <div
            className="roll"
            style={{
              width: "30%",
              textAlign: "center",
              padding: "5px 0",
            }}
          >
            {formatRoll(
              rolls[2],
              rolls[1] === 10 || (rolls[0] !== 10 && rolls[0] + rolls[1] === 10)
                ? null
                : rolls[1]
            )}
          </div>
        )}
      </div>
      <div
        className="frame-score"
        style={{
          textAlign: "center",
          fontWeight: "bold",
          padding: "5px 0",
          borderTop: "1px solid #aaa",
          color: frameScore !== null ? "#fff" : "#888",
        }}
      >
        {frameScore !== null ? frameScore : "-"}
      </div>
    </div>
  );
};

// Helper pour formater l'affichage des lancers
const formatRoll = (pins, previousPins) => {
  if (pins === null || pins === undefined) return "";
  if (pins === 10) return "X"; // Strike
  if (
    previousPins !== null &&
    previousPins !== undefined &&
    pins + previousPins === 10
  )
    return "/"; // Spare
  if (pins === 0) return "-"; // Miss
  return pins;
};

const ScoreBoard = ({ rollScores, frameScores, currentFrame, currentRoll }) => {
  // Calculer les rolls pour chaque frame
  const frameRolls = Array(10)
    .fill()
    .map((_, frameIndex) => {
      if (frameIndex < 9) {
        // Frames 1-9 ont 2 lancers
        return [rollScores[frameIndex * 2], rollScores[frameIndex * 2 + 1]];
      } else {
        // Frame 10 a 3 lancers possibles
        return [
          rollScores[frameIndex * 2],
          rollScores[frameIndex * 2 + 1],
          rollScores[frameIndex * 2 + 2],
        ];
      }
    });

  return (
    <div
      className="score-board"
      style={{
        position: "absolute",
        top: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "15px",
        borderRadius: "10px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        width: "90%",
        maxWidth: "900px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          margin: "0 0 15px 0",
          color: "#FFD700",
          textShadow: "1px 1px 2px black",
        }}
      >
        Bowling Score
      </h2>
      <div
        className="frames-container"
        style={{
          display: "flex",
          justifyContent: "center",
          overflowX: "auto",
          padding: "5px 0",
        }}
      >
        {frameRolls.map((rolls, index) => (
          <ScoreFrame
            key={index}
            frameNumber={index + 1}
            rolls={rolls}
            frameScore={frameScores[index]}
            isActive={index + 1 === currentFrame}
          />
        ))}
      </div>
      <div
        className="instructions"
        style={{
          textAlign: "center",
          fontSize: "14px",
          color: "#ccc",
          marginTop: "15px",
        }}
      >
        X = Strike | / = Spare | - = Miss
      </div>
    </div>
  );
};

ScoreBoard.propTypes = {
  rollScores: PropTypes.array.isRequired,
  frameScores: PropTypes.array.isRequired,
  currentFrame: PropTypes.number.isRequired,
  currentRoll: PropTypes.number.isRequired,
};

export default ScoreBoard;
