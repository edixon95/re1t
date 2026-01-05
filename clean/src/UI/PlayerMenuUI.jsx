import { useEffect, useState, useMemo, useRef } from "react";
import { useInventoryStore } from "../stores/useInventoryStore";
import { useItemStore } from "../stores/useItemStore";
import { menuOpenRef } from "../Player/Player";
import { InventoryWindow } from "./InventoryUI";
import { ITEM_INTERACT_TABLE } from "../data/itemInteractTable";
import { resolveCombine, getValidCombineTargets } from "../helpers/getValidCombineTargets";
import { getDoor, hasInteractedWithDoor } from "../data/doorTable";
import { getPuzzleById, withdrawPieceFromPuzzle } from "../data/puzzleTable";

const INVENTORY_COLUMNS = 4;
const INVENTORY_ROWS = 3;
const TOTAL_SLOTS = INVENTORY_COLUMNS * INVENTORY_ROWS;

export const pendingDoorUseRef = {
    current: null,
};

export const PlayerMenuUI = () => {
    const inventoryRef = useRef(null);

    const [contextStyle, setContextStyle] = useState({});
    const [open, setOpen] = useState(menuOpenRef.current); // false | "ingameMenu"
    const [focus, setFocus] = useState("menu");
    const [menuIndex, setMenuIndex] = useState(0);
    const [inventoryIndex, setInventoryIndex] = useState(0);

    const [contextOpen, setContextOpen] = useState(false);
    const [contextIndex, setContextIndex] = useState(0);
    const [examineText, setExamineText] = useState(null);

    const [combineSourceIndex, setCombineSourceIndex] = useState(null);

    // Mini interact prompt
    const [interactPromptOpen, setInteractPromptOpen] = useState(false);
    const [interactPromptIndex, setInteractPromptIndex] = useState(0); // 0 = Yes, 1 = Cancel

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

    const MENU_OPTIONS = {
        ingameMenu: ["Inventory", "Map", "Options"],
        ingameMenuUseItem: ["Inventory"],
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

    // Force into inventory on interact
    useEffect(() => {
        if (open === "ingameMenuUseItem") {
            setFocus("content");
        }
    }, [open]);

    const [promptText, setPromptText] = useState("")

    const handleInteractTextDoor = (id) => {
        const door = getDoor(id)
        if (!door) return false;
        const isInteractedWith = door.interact.isInteractedWith
        const interactText = isInteractedWith ? [door.interact.after] : [door.interact.initial, door.interact.after]
        if (!isInteractedWith) {
            hasInteractedWithDoor(id)
        }
        setPromptText(interactText)

        return true
    }

    const handleInteractPuzzleText = () => {
        const puzzle = getPuzzleById(pendingDoorUseRef.current.id);
        const text = puzzle.interact[pendingDoorUseRef.current.part]
        pendingDoorUseRef.current.showTakeOption = puzzle.parts[[pendingDoorUseRef.current.part]] !== null
        setPromptText(text)
    }

    useEffect(() => {
        const handler = (event) => {
            if (event.detail === "door") {
                handleInteractTextDoor(pendingDoorUseRef.current)
            } else if (event.detail === "puzzle") {
                handleInteractPuzzleText()
            }
            setInteractPromptOpen(true)
            menuOpenRef.current = "prompt"
        };
        window.addEventListener("trigger:interactPrompt", handler);
        return () => window.removeEventListener("trigger:interactPrompt", handler);
    }, []);


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

    const getContextOptions = (slot) => {
        if (!slot) return [];

        const baseOptions = ITEM_INTERACT_TABLE[slot.item]?.Options ?? [];
        // TODO: Puzzle intergration/Button intergration will have to go here
        if (open === "ingameMenuUseItem") {
            return [
                {
                    label: "Use",
                    action: () => {
                        if (!pendingDoorUseRef.current?.isPuzzle) {
                            useInventoryStore
                                .getState()
                                .tryUseInventoryItemDoor(
                                    slot.item,
                                    inventoryIndex,
                                    pendingDoorUseRef.current
                                );
                        } else if (pendingDoorUseRef.current?.isPuzzle) {
                            useInventoryStore
                                .getState()
                                .tryUseInventoryItemPuzzle(
                                    inventoryIndex,
                                    pendingDoorUseRef.current
                                );
                        }

                        pendingDoorUseRef.current = null;
                        menuOpenRef.current = false;

                    },
                },
                ...baseOptions.filter(o => o.label === "Examine"),
            ];
        }

        return baseOptions;
    };

    // Keyboard input
    useEffect(() => {
        const onKeyDown = (e) => {
            const key = e.key.toLowerCase();

            let shouldShowTake = false
            if (pendingDoorUseRef.current?.id) {
                const puzzle = getPuzzleById(pendingDoorUseRef.current?.id)
                shouldShowTake = puzzle.parts[pendingDoorUseRef.current?.part] !== null
            }

            // ===== Mini interact prompt handling - MUST BE FIRST =====
            if (interactPromptOpen) {
                const options = ["Yes", ...(shouldShowTake ? ["Take"] : []), "Cancel"];

                // Navigate options
                if (key === "w" || key === "a") {
                    setInteractPromptIndex(i => (i === 0 ? options.length - 1 : i - 1));
                }
                if (key === "s" || key === "d") {
                    setInteractPromptIndex(i => (i === options.length - 1 ? 0 : i + 1));
                }

                // Select option
                if (key === " ") {
                    const selected = options[interactPromptIndex];
                    if (selected === "Yes") {
                        menuOpenRef.current = "ingameMenuUseItem"
                        setOpen("ingameMenuUseItem");
                        setFocus("content");
                    } else if (selected === "Take") {
                        useInventoryStore
                            .getState()
                            .tryRecoverFromPuzzle(
                                pendingDoorUseRef.current
                            );

                        pendingDoorUseRef.current = null;
                        menuOpenRef.current = false;
                    } else {
                        menuOpenRef.current = false
                    }
                    setInteractPromptOpen(false);
                    setPromptText("")
                    setInteractPromptIndex(0);
                }

                // Cancel
                if (key === "f") {
                    setInteractPromptOpen(false);
                    setInteractPromptIndex(0);
                    pendingDoorUseRef.current = null;
                    menuOpenRef.current = false;
                }

                return; // stop all other input while prompt is open
            }

            // ===== Existing escape / F handling =====
            if (!open) return;

            if (key === "f") {
                if (examineText) {
                    setExamineText(null);
                    return;
                }

                if (contextOpen) {
                    setContextOpen(false);
                    return;
                }

                if (open === "ingameMenuUseItem") {
                    pendingDoorUseRef.current = null;
                    menuOpenRef.current = false;
                    setOpen(false);
                    return;
                }

                if (focus === "content") {
                    setFocus("menu");
                    return;
                }

                menuOpenRef.current = false;
                setOpen(false);
            }

            // ===== Menu navigation =====
            if (focus === "menu") {
                if (key === "w") setMenuIndex(i => Math.max(0, i - 1));
                if (key === "s") setMenuIndex(i => Math.min(menuOptions.length - 1, i + 1));

                if (key === " " && menuOptions[menuIndex]) {
                    const selected = menuOptions[menuIndex];
                    if (selected === "Inventory") setFocus("content");
                    else if (selected === "Map") console.log("Open Map");
                    else if (selected === "Options") console.log("Open Options");
                }

                if (key === "d" && menuOptions[menuIndex] === "Inventory") {
                    setFocus("content");
                }
            }

            // ===== Inventory content navigation =====
            if (
                focus === "content" &&
                (open === "ingameMenu" && activeMenu === "Inventory" || open === "ingameMenuUseItem")
            ) {
                const slot = fullInventory[inventoryIndex];
                const col = inventoryIndex % INVENTORY_COLUMNS;

                if (combineSourceIndex !== null) {
                    if (key === " ") {
                        if (slot && validCombineTargets.includes(slot.item)) {
                            attemptCombine();
                        }
                    }

                    if (key === "f") {
                        setCombineSourceIndex(null);
                        setFocus("content");
                        return;
                    }
                }

                if (contextOpen) {
                    if (examineText) return;
                    if (!slot) {
                        setContextOpen(false);
                        return;
                    }

                    const options = getContextOptions(slot);
                    if (key === "w") setContextIndex(i => Math.max(0, i - 1));
                    if (key === "s") setContextIndex(i => Math.min(options.length - 1, i + 1));

                    if (key === " ") {
                        const option = options[contextIndex];
                        option?.action({
                            openExamine: setExamineText,
                            equipUnequip: handleTryEquip,
                            consumeItem: () => useItemByIndex(inventoryIndex),
                            beginCombine,
                        });
                    }

                    return;
                }

                if (key === "a") col === 0 ? setFocus("menu") : setInventoryIndex(i => i - 1);
                if (key === "d") setInventoryIndex(i => Math.min(TOTAL_SLOTS - 1, i + 1));
                if (key === "w") setInventoryIndex(i => Math.max(0, i - INVENTORY_COLUMNS));
                if (key === "s") setInventoryIndex(i => Math.min(TOTAL_SLOTS - 1, i + INVENTORY_COLUMNS));

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
        fullInventory,
        interactPromptOpen,
        interactPromptIndex
    ]);

    if (open !== "ingameMenu" && open !== "ingameMenuUseItem" && !interactPromptOpen) return null;

    return (
        <div style={{ position: "absolute", inset: 0, background: !interactPromptOpen && "black", color: "white", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {/* Left menu */}
            {open === "ingameMenu" &&
                <div style={{ width: "20%", height: "80%", background: "red", display: "flex", flexDirection: "column", justifyContent: "space-around", padding: 20 }}>
                    {menuOptions.map((op, i) => (
                        <h1 key={op} style={{ color: focus === "menu" && i === menuIndex ? "yellow" : "white" }}>
                            {op.toUpperCase()}
                        </h1>
                    ))}
                </div>
            }

            {/* Right content */}
            <div style={{
                position: "relative",
                width: open === "ingameMenuUseItem" ? "100%" : "80%",
                height: "80%", background: !interactPromptOpen && "red"
            }}>
                {(
                    (open === "ingameMenu" && activeMenu === "Inventory") ||
                    open === "ingameMenuUseItem"
                ) && (
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
                                    {getContextOptions(fullInventory[inventoryIndex]).map((op, i) => (
                                        <div
                                            key={op.label}
                                            style={{
                                                color: i === contextIndex ? "yellow" : "white",
                                                padding: "4px 8px",
                                            }}
                                        >
                                            {equippedItem.equipped === fullInventory[inventoryIndex].item &&
                                                op.label === "Equip"
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

                {interactPromptOpen && (
                    <div
                        style={{
                            position: "absolute",
                            top: "40%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "black",
                            border: "2px solid white",
                            padding: "20px 40px",
                            zIndex: 2000,
                            textAlign: "center",
                        }}
                    >
                        <div style={{ marginBottom: 20, fontSize: 24, whiteSpace: 'pre-wrap' }}>

                            {promptText && promptText.length > 0 &&
                                promptText.map((t) => (
                                    <p>{t}</p>
                                ))
                            }
                        </div>
                        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
                            {["Yes", ...(pendingDoorUseRef.current.showTakeOption ? ["Take"] : []), "Cancel"].map((opt, i) => (
                                <div
                                    key={opt}
                                    style={{
                                        color: i === interactPromptIndex ? "yellow" : "white",
                                        fontSize: 20,
                                        padding: "4px 12px",
                                        border: i === interactPromptIndex ? "1px solid yellow" : "1px solid white",
                                    }}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {open === "ingameMenu" && activeMenu === "Map" && <div>Map</div>}
                {open === "ingameMenu" && activeMenu === "Options" && <div>Options</div>}
            </div>
        </div>
    );
};