// managers/TransitionManager.js
import { DOOR_TABLE } from "../data/doorTable";
import { useState, useEffect } from "react";
import { isTransition } from "../Player/Player"; // use the existing ref
import { tryUseInventoryItem } from "../Player/Inventory";

export const TransitionManager = (playerRef, setGameState, isTransitionRef) => {
    if (!playerRef || !setGameState) return;

    const handleDoorEnter = (e) => {
        const fromDoor = e.detail;
        const targetLevel = fromDoor.leadsTo.level;
        const targetDoorId = fromDoor.leadsTo.doorId;

        if (!targetLevel || !targetDoorId) return;

        if (fromDoor.requiredItem && !fromDoor?.isUnlocked) {
            if (!tryUseInventoryItem(fromDoor.requiredItem, fromDoor.isAnonymous, fromDoor.isKeySingle, fromDoor.id)) {
                return;
            }
        }

        // 1️⃣ Lock input & show fade
        if (isTransitionRef) isTransitionRef.current = true;
        setGameState(prev => ({ ...prev, fade: true }));

        // 2️⃣ Delay for door animation / fade
        setTimeout(() => {
            // 3️⃣ Swap world
            setGameState(prev => ({ ...prev, level: targetLevel }));

            // 4️⃣ Wait one frame so the new world mounts
            requestAnimationFrame(() => {
                const targetDoor = DOOR_TABLE[targetLevel]?.find(
                    (d) => d.id === targetDoorId
                );

                if (!targetDoor) {
                    console.error("Target door not found:", targetDoorId);
                    if (isTransitionRef) isTransitionRef.current = false;
                    setGameState(prev => ({ ...prev, fade: false }));
                    return;
                }

                // 5️⃣ Move player to exact spawn position
                playerRef.current.position.set(
                    targetDoor.spawn.position[0],
                    targetDoor.spawn.position[1],
                    targetDoor.spawn.position[2]
                );

                // 6️⃣ Rotate player to exact spawn rotation
                playerRef.current.rotation.set(
                    0,
                    targetDoor.spawn.rotationY,
                    0
                );

                // 7️⃣ Unlock input & hide fade
                if (isTransitionRef) isTransitionRef.current = false;
                setGameState(prev => ({ ...prev, fade: false }));
            });
        }, 700);
    };

    window.addEventListener("door:enter", handleDoorEnter);

    return () => {
        window.removeEventListener("door:enter", handleDoorEnter);
    };
};

// TransitionScreen stays the same
// managers/TransitionScreen.js

export const TransitionScreen = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible(isTransition.current);
        }, 16); // ~60fps

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

