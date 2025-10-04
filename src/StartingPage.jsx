import React, { useState } from "react";

import titleLogo from "./assets/titlelogo.png";
import mikren from "./assets/mikren.png";
import levai from "./assets/levai.png";

function StartingPage({ onStart, show }) {
  const [visible, setVisible] = useState(true);

  // if parent provides `show`, prefer that. Otherwise use local visible state.
  const effectiveVisible = typeof show === "boolean" ? show : visible;

  function handleStart() {
    // hide the starting page locally and inform parent to start the game
    setVisible(false);
    if (typeof onStart === "function") onStart();
  }

  if (!effectiveVisible) return null;

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white absolute top-0 left-0 w-full z-50">
      <div className="starting-page h-72 w-72 m-4">
        <img src={titleLogo} alt="Starting Page" />
      </div>
      <div className="start-button-container mb-4 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded h-12 w-40 flex items-center justify-center mb-9">
        <button className="start-button" onClick={handleStart}>
          Start Game
        </button>
      </div>
      <div className="instructions">
        <p>Instructions: Flip the cards to find matching AOT characters!</p>
      </div>
      <div className="character-images absolute bottom-10 right-10 flex space-x-4">
        <img src={mikren} alt="Mikren" className="h-40 w-40 m-2" />
      </div>
      <div className="character-images absolute bottom-10 left-10 flex space-x-4">
        <img src={levai} alt="Levai" className="h-40 w-40 m-2" />
      </div>
    </div>
  );
}

export default StartingPage;
