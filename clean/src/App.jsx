import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";
import "./index.css"
import { PlayerMenuUI } from "./UI/PlayerMenuUI";
import { InformationalUI } from "./UI/InformationalUI";
import { TransitionScreen } from "./managers/TransitionManager";

export const App = () => {
  return (
    <>
      <Canvas
        camera={{ fov: 75 }}
        shadows
      >
        <Experience />
      </Canvas>

      <TransitionScreen />
      <PlayerMenuUI />
      <InformationalUI />
    </>
  );
}
