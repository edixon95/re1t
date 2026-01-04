import { useState, useEffect } from "react";
import { DOOR_TABLE } from "../data/doorTable";
import { useInventoryStore } from "../stores/useInventoryStore";
import { isTransition, menuOpenRef } from "../Player/Player";
import { useEnemyStore } from "../stores/useEnemyStores";
import { liveEnemyRefs } from "./EnemyManger";
import { pendingDoorUseRef } from "../UI/PlayerMenuUI";

export const TransitionManager = (playerRef, setGameState, isTransitionRef, handleUpdatePlayerRef) => {
    if (!playerRef || !setGameState) return;


    const handleDoorEnter = (e) => {
        const fromDoor = e.detail;
        const targetLevel = fromDoor.leadsTo?.level;
        const targetDoorId = fromDoor.leadsTo?.doorId;

        if (!targetLevel || !targetDoorId) return;

        // if (fromDoor.requiredItem && !fromDoor.isUnlocked) {
        //     const used = useInventoryStore.getState().tryUseInventoryItemDoor(
        //         fromDoor.requiredItem,
        //         fromDoor.isKeySingle,
        //         fromDoor.id
        //     );


        //     if (!used)
        //         return;
        // }

        if (fromDoor.requiredItem && !fromDoor.isUnlocked) {
            pendingDoorUseRef.current = fromDoor.id;
            window.dispatchEvent(new CustomEvent("trigger:interactPrompt"));
            return;
        }


        if (isTransitionRef) isTransitionRef.current = true;

        // Lazy add, not changing it
        useEnemyStore.getState().saveEnemyPosition(fromDoor.self, liveEnemyRefs)

        setGameState((prev) => ({ ...prev, fade: true }));

        setTimeout(() => {
            setGameState((prev) => ({ ...prev, level: targetLevel }));
            handleUpdatePlayerRef(targetLevel)

            requestAnimationFrame(() => {
                const targetDoor = DOOR_TABLE[targetLevel]?.find(
                    (d) => d.id === targetDoorId
                );

                if (!targetDoor) {
                    console.error("Target door not found:", targetDoorId);
                    if (isTransitionRef) isTransitionRef.current = false;
                    setGameState((prev) => ({ ...prev, fade: false }));
                    return;
                }

                playerRef.current.position.set(
                    targetDoor.spawn.position[0],
                    targetDoor.spawn.position[1],
                    targetDoor.spawn.position[2]
                );

                const directionToRotationY = {
                    1: 0,               // facing +Z
                    2: Math.PI,         // facing -Z
                    3: Math.PI / 2,     // facing +X
                    4: -Math.PI / 2,    // facing -X
                };

                const dir = targetDoor.spawn.rotationY; // now this is 1–4
                playerRef.current.rotation.set(0, directionToRotationY[dir], 0);


                if (isTransitionRef) isTransitionRef.current = false;
                setGameState((prev) => ({ ...prev, fade: false }));
            });
        }, 700);
    };

    window.addEventListener("door:enter", handleDoorEnter);

    return () => window.removeEventListener("door:enter", handleDoorEnter);
};

export const TransitionScreen = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible(isTransition.current);
        }, 16);

        return () => clearInterval(interval);
    }, []);

    if (!visible) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "black",
                opacity: 1,
                pointerEvents: "none",
                zIndex: 9999,
            }}
        />
    );
};