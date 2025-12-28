import { useRef, useState, useEffect } from "react";
import { isTransition, Player } from "./Player/Player";
import { CameraManager } from "./managers/CameraManager";
import { WorldManager } from "./managers/WorldManager";
import { TransitionManager, TransitionScreen } from "./managers/TransitionManager";

export const Experience = () => {
    const playerRef = useRef();
    const [region, setRegion] = useState(null);
    const [gameState, setGameState] = useState({
        level: "intro",
    });

    useEffect(() => {
        const cleanup = TransitionManager(playerRef, setGameState, isTransition);
        return cleanup;
    }, []);



    return (
        <>
            {/*World */}
            <WorldManager gameState={gameState} />

            {/* Player */}
            <Player playerRef={playerRef} />

            {/* Camera system */}
            <CameraManager
                region={region}
                setRegion={setRegion}
                gameState={gameState}
                playerRef={playerRef}
            />
        </>
    );
}
