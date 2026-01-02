import { useEffect, useState } from "react";
import { menuOpenRef } from "../Player/Player";
import { loadPlayerGame, savePlayerGame } from "../helpers/loadSaveGame";
import { useItemStore } from "../stores/useItemStore";

export const MainMenu = ({ playerRef, gameState, setGameState }) => {
    const MAIN_OPTIONS = ["New Game", "Load Game"];
    const LOAD_SLOTS = 5;

    const [open, setOpen] = useState(false);
    const [menuIndex, setMenuIndex] = useState(0);
    const [slotIndex, setSlotIndex] = useState(0);
    const [selectingSlot, setSelectingSlot] = useState(false);

    // Sync open state with menuOpenRef
    useEffect(() => {
        const syncMenu = () => {
            const current = menuOpenRef.current;
            if (current === "mainMenu" || current === "mainMenuSave") {
                setOpen(current);
                if (current === "mainMenuSave") setSelectingSlot(true);
            } else {
                setOpen(false);
            }
        };

        // Run once immediately
        syncMenu();

        // Sync continuously
        const interval = setInterval(syncMenu, 16); // ~60fps
        return () => clearInterval(interval);
    }, []);


    useEffect(() => {
        const onKeyDown = (e) => {
            if (!open) return;
            const key = e.key.toLowerCase();
            const isSaveMenu = menuOpenRef.current === "mainMenuSave";

            // Main menu navigation
            if (!selectingSlot && !isSaveMenu) {
                if (key === "w") setMenuIndex((i) => Math.max(0, i - 1));
                if (key === "s") setMenuIndex((i) => Math.min(MAIN_OPTIONS.length - 1, i + 1));
                if (key === " ") {
                    const selected = MAIN_OPTIONS[menuIndex];
                    if (selected === "New Game") {
                        setOpen(false);
                        menuOpenRef.current = false;
                        useItemStore.getState().loadItemsFromSave(); // trigger new game
                    }
                    if (selected === "Load Game") {
                        setSelectingSlot(true);
                        setSlotIndex(0);
                    }
                }
            } else {
                // Slot selection (load or save)
                if (key === "w") setSlotIndex((i) => Math.max(0, i - 1));
                if (key === "s") setSlotIndex((i) => Math.min(LOAD_SLOTS - 1, i + 1));
                if (key === " ") {
                    if (isSaveMenu) {
                        playerRef.current.level = gameState.level;
                        savePlayerGame(slotIndex + 1, playerRef.current); // Save to slot 1-5
                    } else {
                        loadPlayerGame(slotIndex + 1, playerRef, setGameState); // Load slot 1-5
                    }
                    setOpen(false);
                    menuOpenRef.current = false;
                    setSelectingSlot(false);
                }
                if (key === "escape" || key === "control") {
                    if (isSaveMenu) {
                        setOpen(false);
                        menuOpenRef.current = false;
                        setSelectingSlot(false);
                    } else {
                        setSelectingSlot(false);
                    }
                }
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [menuIndex, open, selectingSlot, slotIndex, playerRef, gameState, setGameState]);
    if (open !== "mainMenu" && open !== "mainMenuSave") return null;

    const isSaveMenu = menuOpenRef.current === "mainMenuSave";

    return (
        <div style={{
            position: "absolute",
            inset: 0,
            background: "black",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column"
        }}>
            {!selectingSlot && !isSaveMenu ? (
                MAIN_OPTIONS.map((op, i) => (
                    <h1 key={op} style={{ color: i === menuIndex ? "yellow" : "white", margin: "10px 0" }}>
                        {op.toUpperCase()}
                    </h1>
                ))
            ) : (
                <>
                    <h1>{isSaveMenu ? "Save Game" : "Load Game"}</h1>
                    {Array.from({ length: LOAD_SLOTS }, (_, i) => (
                        <div key={i} style={{ color: i === slotIndex ? "yellow" : "white", margin: "5px 0" }}>
                            Save Slot {i + 1}
                        </div>
                    ))}
                    <div style={{ marginTop: 20, color: "gray" }}>
                        Press ESC or CTRL to {isSaveMenu ? "close" : "go back"}
                    </div>
                </>
            )}
        </div>
    );
};
