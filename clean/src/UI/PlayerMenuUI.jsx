import { useEffect, useState, useMemo, useRef } from "react";
import { useInventoryStore } from "../stores/useInventoryStore";
import { useItemStore } from "../stores/useItemStore";
import { menuOpenRef } from "../Player/Player";
import { InventoryWindow } from "./InventoryUI";
import { ITEM_INTERACT_TABLE } from "../data/itemInteractTable";
import { resolveCombine, getValidCombineTargets } from "../helpers/getValidCombineTargets";

const INVENTORY_COLUMNS = 4;
const INVENTORY_ROWS = 3;
const TOTAL_SLOTS = INVENTORY_COLUMNS * INVENTORY_ROWS;

export const PlayerMenuUI = () => {

    const inventoryRef = useRef(null);
    const [contextStyle, setContextStyle] = useState({});
    const [open, setOpen] = useState(menuOpenRef.current);
    const [focus, setFocus] = useState("menu");
    const [menuIndex, setMenuIndex] = useState(0);
    const [inventoryIndex, setInventoryIndex] = useState(0);

    const [contextOpen, setContextOpen] = useState(false);
    const [contextIndex, setContextIndex] = useState(0);
    const [examineText, setExamineText] = useState(null);

    const [combineSourceIndex, setCombineSourceIndex] = useState(null);

    const menuOptions = ["Inventory", "Map", "Options"];
    const activeMenu = menuOptions[menuIndex];

    const inventory = useInventoryStore(state => state.inventory);
    const equippedItem = useInventoryStore(state => state.equippedItem);
    const equipItem = useInventoryStore(state => state.equipItem);
    const useItemByIndex = useInventoryStore(state => state.useItemByIndex);

    const itemTable = useItemStore(state => state.itemTable);

    const allItems = useMemo(
        () => Object.values(itemTable).flat(),
        [itemTable]
    );

    const fullInventory = useMemo(
        () => Array(TOTAL_SLOTS).fill(null).map((_, i) => inventory[i] ?? null),
        [inventory]
    );

    const combineSourceItem =
        combineSourceIndex !== null ? fullInventory[combineSourceIndex]?.item : null;

    const validCombineTargets = useMemo(() => {
        if (!combineSourceItem) return [];
        return getValidCombineTargets(combineSourceItem);
    }, [combineSourceItem]);

    const handleTryEquip = () => {
        const slot = fullInventory[inventoryIndex];
        if (!slot) return;

        if (slot.item === equippedItem.equipped) {
            equipItem(null);
        } else {
            const itemData = allItems.find(i => i.item === slot.item);
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

        if (success !== false) {
            setCombineSourceIndex(null);
        }
    };


    useEffect(() => {
        const interval = setInterval(() => {
            if (menuOpenRef.current !== open) setOpen(menuOpenRef.current);
        }, 16);
        return () => clearInterval(interval);
    }, [open]);

    useEffect(() => {
        if (!open) {
            setContextOpen(false);
            setExamineText(null);
            setCombineSourceIndex(null);
        }
    }, [open]);

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



    useEffect(() => {
        const onKeyDown = (e) => {
            if (!open) return;
            const key = e.key.toLowerCase();

            if (examineText && (key === "control" || key === "ctrl")) {
                setExamineText(null);
                return;
            }


            if (focus === "menu") {
                if (key === "w") setMenuIndex(i => Math.max(0, i - 1));
                if (key === "s") setMenuIndex(i => Math.min(menuOptions.length - 1, i + 1));
                if (key === "d") setFocus("content");
                return;
            }

            if (focus === "content" && activeMenu === "Inventory") {
                const slot = fullInventory[inventoryIndex];
                const col = inventoryIndex % INVENTORY_COLUMNS;

                if (combineSourceIndex !== null) {
                    if (key === " ") {
                        if (slot && validCombineTargets.includes(slot.item)) {
                            attemptCombine();
                        }
                    }

                    if (key === "control" || key === "ctrl") {
                        setCombineSourceIndex(null);
                    }
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

                    if (key === "control" || key === "ctrl") {
                        setContextOpen(false);
                    }

                    return;
                }


                // Movement
                if (key === "a") col === 0 ? setFocus("menu") : setInventoryIndex(i => i - 1);
                if (key === "d") setInventoryIndex(i => Math.min(TOTAL_SLOTS - 1, i + 1));
                if (key === "w") setInventoryIndex(i => Math.max(0, i - INVENTORY_COLUMNS));
                if (key === "s") setInventoryIndex(i => Math.min(TOTAL_SLOTS - 1, i + INVENTORY_COLUMNS));

                // Open context
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
            <div style={{ width: "20%", height: "80%", background: "red", display: "flex", flexDirection: "column", justifyContent: "space-around", padding: 20 }}>
                {menuOptions.map((op, i) => (
                    <h1 key={op} style={{ color: focus === "menu" && i === menuIndex ? "yellow" : "white" }}>
                        {op.toUpperCase()}
                    </h1>
                ))}
            </div>

            <div style={{ position: "relative", width: "80%", height: "80%", background: "red" }}>
                {activeMenu === "Inventory" && (
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
                                        {equippedItem.equipped === fullInventory[inventoryIndex].item && op.label === "Equip"
                                            ? "Unequip"
                                            : op.label}
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

                {activeMenu === "Map" && <div>Map</div>}
                {activeMenu === "Options" && <div>Options</div>}
            </div>
        </div>
    );
};
