import { useEffect, useState, useMemo, useRef } from "react";
import { useInventoryStore } from "../stores/useInventoryStore";
import { useItemStore } from "../stores/useItemStore";
import { menuOpenRef } from "../Player/Player";
import { InventoryWindow } from "./InventoryUI";
import { ITEM_INTERACT_TABLE } from "../data/itemInteractTable";
import { resolveCombine, getValidCombineTargets } from "../helpers/getValidCombineTargets";
import { savePlayerGame, loadPlayerGame } from "../helpers/loadSaveGame";

const INVENTORY_COLUMNS = 4;
const INVENTORY_ROWS = 3;
const TOTAL_SLOTS = INVENTORY_COLUMNS * INVENTORY_ROWS;

export const PlayerMenuUI = ({ playerRef }) => {
    console.log(playerRef)
    const inventoryRef = useRef(null);
    const [contextStyle, setContextStyle] = useState({});
    const [open, setOpen] = useState(menuOpenRef.current); // false | "ingameMenu" | "saveMenu" | "loadMenu"
    const [focus, setFocus] = useState("menu");
    const [menuIndex, setMenuIndex] = useState(0);
    const [inventoryIndex, setInventoryIndex] = useState(0);

    const [contextOpen, setContextOpen] = useState(false);
    const [contextIndex, setContextIndex] = useState(0);
    const [examineText, setExamineText] = useState(null);

    const [combineSourceIndex, setCombineSourceIndex] = useState(null);

    const inventory = useInventoryStore((state) => state.inventory);
    const equippedItem = useInventoryStore((state) => state.equippedItem);
    const equipItem = useInventoryStore((state) => state.equipItem);
    const useItemByIndex = useInventoryStore((state) => state.useItemByIndex);

    const itemTable = useItemStore((state) => state.itemTable);
    const allItems = useMemo(() => Object.values(itemTable).flat(), [itemTable]);
    const fullInventory = useMemo(() => Array(TOTAL_SLOTS).fill(null).map((_, i) => inventory[i] ?? null), [inventory]);
    const combineSourceItem = combineSourceIndex !== null ? fullInventory[combineSourceIndex]?.item : null;
    const validCombineTargets = useMemo(() => {
        if (!combineSourceItem) return [];
        return getValidCombineTargets(combineSourceItem);
    }, [combineSourceItem]);

    // Menu definitions
    const MENU_OPTIONS = {
        ingameMenu: ["Inventory", "Map", "Options", "Save Game", "Load Game"],
        saveMenu: Array(5).fill(null).map((_, i) => `Save Slot ${i + 1}`),
        loadMenu: Array(5).fill(null).map((_, i) => `Load Slot ${i + 1}`),
    };

    const menuOptions = useMemo(() => {
        if (!open) return [];
        return MENU_OPTIONS[open] || [];
    }, [open]);

    const activeMenu = open === "ingameMenu" ? menuOptions[menuIndex] : null;

    const handleTryEquip = () => {
        const slot = fullInventory[inventoryIndex];
        if (!slot) return;

        if (slot.item === equippedItem.equipped) {
            equipItem(null);
        } else {
            const itemData = allItems.find((i) => i.item === slot.item);
            if (itemData) equipItem(itemData);
        }
    };

    const beginCombine = () => {
        setCombineSourceIndex(inventoryIndex);
        setContextOpen(false);
    };

    const attemptCombine = () => {
        if (combineSourceIndex === null) return;
        if (combineSourceIndex === inventoryIndex) return;

        const sourceSlot = fullInventory[combineSourceIndex];
        const targetSlot = fullInventory[inventoryIndex];
        if (!sourceSlot || !targetSlot) return;

        const success = resolveCombine(
            sourceSlot.item,
            targetSlot.item,
            combineSourceIndex,
            inventoryIndex
        );

        if (success !== false) setCombineSourceIndex(null);
    };

    // Sync menuOpenRef
    useEffect(() => {
        const interval = setInterval(() => {
            if (menuOpenRef.current !== open) setOpen(menuOpenRef.current);
        }, 16);
        return () => clearInterval(interval);
    }, [open]);

    // Reset context on menu close
    useEffect(() => {
        if (!open) {
            setContextOpen(false);
            setExamineText(null);
            setCombineSourceIndex(null);
            setMenuIndex(0);
            setInventoryIndex(0);
        }
    }, [open]);

    // Context menu positioning
    useEffect(() => {
        if (!contextOpen) {
            setContextStyle({});
            return;
        }

        if (!inventoryRef.current) return;

        const container = inventoryRef.current;
        const slot = container.children[inventoryIndex];
        if (!slot) return;

        const rect = slot.getBoundingClientRect();
        const parentRect = container.getBoundingClientRect();

        setContextStyle({
            position: "absolute",
            top: rect.top - parentRect.top + 5,
            left: rect.left - parentRect.left + 5,
            background: "black",
            border: "2px solid white",
            padding: "10px",
            zIndex: 1000,
        });
    }, [contextOpen, inventoryIndex]);

    // Keyboard input
    useEffect(() => {
        const onKeyDown = (e) => {
            if (!open) return;
            const key = e.key.toLowerCase();

            if (key === "control" || key === "ctrl") {
                // Close any menu
                menuOpenRef.current = false;
                setOpen(false);
                return;
            }

            // Handle menu navigation
            if (focus === "menu") {
                if (key === "w") setMenuIndex(i => Math.max(0, i - 1));
                if (key === "s") setMenuIndex(i => Math.min(menuOptions.length - 1, i + 1));

                if (key === " " && menuOptions[menuIndex]) {
                    const selected = menuOptions[menuIndex];

                    if (open === "ingameMenu") {
                        // Inventory/Map/Options
                        if (selected === "Inventory") setFocus("content");
                        else if (selected === "Map") console.log("Open Map");
                        else if (selected === "Options") console.log("Open Options");
                        else if (selected === "Save Game") menuOpenRef.current = "saveMenu";
                        else if (selected === "Load Game") menuOpenRef.current = "loadMenu";
                    }

                    if (open === "saveMenu") {
                        const slot = menuIndex + 1;
                        savePlayerGame(playerRef.current, slot);
                        menuOpenRef.current = false;
                    }

                    if (open === "loadMenu") {
                        const slot = menuIndex + 1;
                        // Trigger load screen + loading
                        // This function must exist in your system
                        loadPlayerGame(slot, playerRef);
                        menuOpenRef.current = false;
                    }
                }
                return;
            }

            // Inventory content handling
            if (focus === "content" && open === "ingameMenu" && activeMenu === "Inventory") {
                const slot = fullInventory[inventoryIndex];
                const col = inventoryIndex % INVENTORY_COLUMNS;

                if (combineSourceIndex !== null) {
                    if (key === " ") {
                        if (slot && validCombineTargets.includes(slot.item)) {
                            attemptCombine();
                        }
                    }
                    if (key === "control" || key === "ctrl") setCombineSourceIndex(null);
                }

                // Context menu
                if (contextOpen) {
                    if (examineText) return;
                    if (!slot) {
                        setContextOpen(false);
                        return;
                    }

                    const options = ITEM_INTERACT_TABLE[slot.item]?.Options ?? [];
                    if (key === "w") setContextIndex(i => Math.max(0, i - 1));
                    if (key === "s") setContextIndex(i => Math.min(options.length - 1, i + 1));

                    if (key === " ") {
                        const option = options[contextIndex];
                        option?.action({
                            openExamine: setExamineText,
                            equipUnequip: handleTryEquip,
                            consumeItem: () => useItemByIndex(inventoryIndex),
                            beginCombine
                        });
                    }

                    if (key === "control" || key === "ctrl") setContextOpen(false);
                    return;
                }

                // Inventory movement
                if (key === "a") col === 0 ? setFocus("menu") : setInventoryIndex(i => i - 1);
                if (key === "d") setInventoryIndex(i => Math.min(TOTAL_SLOTS - 1, i + 1));
                if (key === "w") setInventoryIndex(i => Math.max(0, i - INVENTORY_COLUMNS));
                if (key === "s") setInventoryIndex(i => Math.min(TOTAL_SLOTS - 1, i + INVENTORY_COLUMNS));

                // Open context menu
                if (key === " " && slot && ITEM_INTERACT_TABLE[slot.item] && combineSourceIndex === null) {
                    setContextOpen(true);
                    setContextIndex(0);
                }
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [
        open,
        focus,
        menuIndex,
        inventoryIndex,
        contextOpen,
        contextIndex,
        examineText,
        combineSourceIndex,
        validCombineTargets,
        fullInventory
    ]);

    if (!open) return null;

    return (
        <div style={{ position: "absolute", inset: 0, background: "black", color: "white", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {/* Left menu */}
            <div style={{ width: "20%", height: "80%", background: "red", display: "flex", flexDirection: "column", justifyContent: "space-around", padding: 20 }}>
                {menuOptions.map((op, i) => (
                    <h1 key={op} style={{ color: focus === "menu" && i === menuIndex ? "yellow" : "white" }}>
                        {op.toUpperCase()}
                    </h1>
                ))}
            </div>

            {/* Right content */}
            <div style={{ position: "relative", width: "80%", height: "80%", background: "red" }}>
                {open === "ingameMenu" && activeMenu === "Inventory" && (
                    <>
                        <InventoryWindow
                            selectedIndex={inventoryIndex}
                            focused={focus === "content"}
                            inventory={fullInventory}
                            equipped={equippedItem}
                            combineSourceIndex={combineSourceIndex}
                            validCombineTargets={validCombineTargets}
                            containerRef={inventoryRef}
                        />

                        {contextOpen && fullInventory[inventoryIndex] && (
                            <div style={contextStyle}>
                                {ITEM_INTERACT_TABLE[fullInventory[inventoryIndex].item].Options.map((op, i) => (
                                    <div key={op.label} style={{ color: i === contextIndex ? "yellow" : "white", padding: "4px 8px" }}>
                                        {equippedItem.equipped === fullInventory[inventoryIndex].item && op.label === "Equip" ? "Unequip" : op.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {examineText && (
                    <div style={{ position: "absolute", inset: "20%", background: "black", border: "2px solid white", padding: 20, fontSize: "20px" }}>
                        {examineText}
                        <div style={{ marginTop: 20, color: "gray" }}>Press CTRL to close</div>
                    </div>
                )}

                {open === "ingameMenu" && activeMenu === "Map" && <div>Map</div>}
                {open === "ingameMenu" && activeMenu === "Options" && <div>Options</div>}
            </div>
        </div>
    );
};
