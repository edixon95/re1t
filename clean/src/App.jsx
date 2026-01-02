import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";
import "./index.css"
import { PlayerMenuUI } from "./UI/PlayerMenuUI";
import { InformationalUI } from "./UI/InformationalUI";
import { TransitionScreen } from "./managers/TransitionManager";
import { useRef } from "react";

export const App = () => {
  const playerRef = useRef()
  return (
    <>
      <Canvas
        camera={{ fov: 75 }}
        shadows
      >
        <Experience playerRef={playerRef} />
      </Canvas>

      <TransitionScreen />
      <PlayerMenuUI playerRef={playerRef} />
      <InformationalUI />
    </>
  );
}
