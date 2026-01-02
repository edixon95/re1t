import { useRef, useState, useEffect } from "react";
import { isTransition, Player } from "./Player/Player";
import { CameraManager } from "./managers/CameraManager";
import { WorldManager } from "./managers/WorldManager";
import { TransitionManager, TriggerLoadScreen } from "./managers/TransitionManager";
import { EnemyManager } from "./managers/EnemyManger";
import { DebugSoundSpheres } from "./Player/SoundSphere";
import { loadPlayerGame, savePlayerGame } from "./helpers/loadSaveGame";

export const Experience = () => {
    const playerRef = useRef(null)
    const [region, setRegion] = useState(null);
    const [gameState, setGameState] = useState({
        level: "intro",
    });

    const handleUpdatePlayerRef = (level) => {
        playerRef.level = level
    }

    useEffect(() => {
        const cleanup = TransitionManager(playerRef, setGameState, isTransition, handleUpdatePlayerRef);
        return cleanup;
    }, []);

    const triggerStartSaveGame = (slot) => {
        if (!playerRef.current) return;

        playerRef.current.level = gameState.level;
        savePlayerGame(playerRef.current, slot);
    };

    const triggerStartLoadGame = (slot) => {
        TriggerLoadScreen(isTransition, slot);
        loadPlayerGame(slot, playerRef)
    };

    useEffect(() => {
        const handleSaveGame = (event) => {
            triggerStartSaveGame(event.detail.slot);
        };

        const handleLoadGame = (event) => {
            triggerStartLoadGame(event.detail.slot);
        };

        window.addEventListener("saveGame", handleSaveGame);
        window.addEventListener("loadGame", handleLoadGame);

        return () => {
            window.removeEventListener("saveGame", handleSaveGame);
            window.removeEventListener("loadGame", handleLoadGame);
        };
    }, [gameState.level]);


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
