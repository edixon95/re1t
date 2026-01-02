import { useState, useEffect } from "react";
import { isTransition, Player } from "./Player/Player";
import { CameraManager } from "./managers/CameraManager";
import { WorldManager } from "./managers/WorldManager";
import { TransitionManager } from "./managers/TransitionManager";
import { EnemyManager } from "./managers/EnemyManger";
import { DebugSoundSpheres } from "./Player/SoundSphere";

export const Experience = ({ playerRef, gameState, setGameState }) => {
    const [region, setRegion] = useState(null);

    const handleUpdatePlayerRef = (level) => {
        playerRef.level = level
    }

    useEffect(() => {
        const cleanup = TransitionManager(playerRef, setGameState, isTransition, handleUpdatePlayerRef);
        return cleanup;
    }, []);


    return (
        <>
            {/*World */}
            <WorldManager gameState={gameState} />

            {/* Player */}
            <Player playerRef={playerRef} level={gameState.level} />
            <DebugSoundSpheres />
            <EnemyManager gameState={gameState} player={playerRef} />

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
