import React from "react";
import "./App.css";
import "./styles/game.css";
import BowlingGame from "./components/game/BowlingGame";
import { GameProvider } from "./context/GameContext";
import { LogLevel, configureLogger } from "./utils/logger";

// Désactiver les logs en production
if (process.env.NODE_ENV === "production") {
  configureLogger({
    level: LogLevel.ERROR,
    enableConsole: false,
  });
} else {
  configureLogger({
    level: LogLevel.INFO,
    enableConsole: true,
  });
}

function App() {
  return (
    <div className="App">
      <GameProvider>
        <BowlingGame />
      </GameProvider>
    </div>
  );
}

export default App;
