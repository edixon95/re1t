import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";
import "./index.css"
import { PlayerMenuUI } from "./UI/PlayerMenuUI";
import { InformationalUI } from "./UI/InformationalUI";
import { TransitionScreen } from "./managers/TransitionManager";
import { useEffect, useRef, useState } from "react";
import { MainMenu } from "./UI/MainMenu";
import { menuOpenRef } from "./Player/Player";

export const isDevCam = false
export const isVisible = false

export const App = () => {
  const playerRef = useRef()
  const [gameState, setGameState] = useState({
    level: "intro",
  });
  const [pauseGame, setPauseGame] = useState(false)
  useEffect(() => {
    const interval = setInterval(() => {
      setPauseGame(!!menuOpenRef.current);
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Canvas
        camera={{ fov: 75 }}
        shadows
        frameloop={pauseGame ? "demand" : "always"}
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
