import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";
import "./index.css"
import { PlayerMenuUI } from "./UI/PlayerMenuUI";
import { InformationalUI } from "./UI/InformationalUI";
import { TransitionScreen } from "./managers/TransitionManager";
import { useRef, useState } from "react";
import { MainMenu } from "./UI/MainMenu";

export const isDevCam = true

export const App = () => {
  const playerRef = useRef()
  const [gameState, setGameState] = useState({
    level: "intro",
  });

  return (
    <>
      <Canvas
        camera={{ fov: 75 }}
        shadows
      >
        <Experience playerRef={playerRef} gameState={gameState} setGameState={setGameState} />
      </Canvas>

      <TransitionScreen />
      {!isDevCam && (
        <>
          <MainMenu playerRef={playerRef} gameState={gameState} setGameState={setGameState} />
          <PlayerMenuUI playerRef={playerRef} />
          <InformationalUI />
        </>
      )}
    </>
  );
}
