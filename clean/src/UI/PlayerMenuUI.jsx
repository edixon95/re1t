import { useEffect, useState, useMemo } from "react";
import { useInventoryStore } from "../stores/useInventoryStore";
import { useItemStore } from "../stores/useItemStore";
import { equippedItem, menuOpenRef } from "../Player/Player";
import { InventoryWindow } from "./InventoryUI";
import { ITEM_INTERACT_TABLE } from "../data/itemInteractTable";
import { AMMO_TABLE } from "../data/ammoTable";

const INVENTORY_COLUMNS = 4;
const INVENTORY_ROWS = 3;
const TOTAL_SLOTS = INVENTORY_COLUMNS * INVENTORY_ROWS;

export const PlayerMenuUI = () => {
    const [, forceUpdate] = useState(0);
    const [open, setOpen] = useState(menuOpenRef.current);
    const [focus, setFocus] = useState("menu");
    const [menuIndex, setMenuIndex] = useState(0);
    const [inventoryIndex, setInventoryIndex] = useState(0);
    const [contextOpen, setContextOpen] = useState(false);
    const [contextIndex, setContextIndex] = useState(0);
    const [examineText, setExamineText] = useState(null);

    const menuOptions = ["Inventory", "Map", "Options"];
    const activeMenu = menuOptions[menuIndex];

    // Zustand stores
    const inventory = useInventoryStore((state) => state.inventory);
    const tryReloadWeapon = useInventoryStore((state) => state.tryReloadWeapon);
    const tryUseInventoryItem = useInventoryStore((state) => state.tryUseInventoryItem);
    const itemTable = useItemStore((state) => state.itemTable);

    const allItems = useMemo(() => Object.values(itemTable).flat(), [itemTable]);

    const fullInventory = useMemo(
        () => Array(TOTAL_SLOTS).fill(null).map((_, i) => inventory[i] ?? null),
        [inventory]
    );

    // Reload gun and update ammo in item store
    const tryFindAmmoAndWeapon = (weaponName) => {
        const ammoType = AMMO_TABLE[weaponName];
        if (!ammoType) return false;

        const ammoSlot = inventory.find((x) => x?.item === ammoType.item);
        if (!ammoSlot) return false;

        const success = tryReloadWeapon(weaponName);
        if (success) return false;

        return success;
    };


    // Equip/unequip logic
    const handleTryEquip = () => {
        const slot = fullInventory[inventoryIndex];
        if (!slot) return;

        if (slot.item === equippedItem.equipped) {
            equippedItem.equipped = null;
            equippedItem.cAmmo = 0;
            equippedItem.mAmmo = 0;
        } else {
            const itemData = allItems.find(i => i.item === slot.item);
            if (itemData) {
                equippedItem.equipped = itemData.item;
                equippedItem.cAmmo = itemData.cAmmo;
                equippedItem.mAmmo = itemData.mAmmo;
            }
        }
        forceUpdate(v => v + 1);
    };

    // Sync menu open state
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
        }
    }, [open]);

    // Keyboard navigation
    useEffect(() => {
        const onKeyDown = (e) => {
            if (!open) return;
            const key = e.key.toLowerCase();

            if (examineText && (key === " " || key === "a")) return setExamineText(null);

            // Menu
            if (focus === "menu") {
                if (key === "w") setMenuIndex(i => Math.max(0, i - 1));
                if (key === "s") setMenuIndex(i => Math.min(menuOptions.length - 1, i + 1));
                if (key === "d") setFocus("content");
                return;
            }

            // Inventory content
            if (focus === "content" && activeMenu === "Inventory") {
                const slot = fullInventory[inventoryIndex];
                const col = inventoryIndex % INVENTORY_COLUMNS;

                if (contextOpen) {
                    if (!slot) return setContextOpen(false);

                    const options = ITEM_INTERACT_TABLE[slot.item]?.Options ?? [];
                    if (key === "w") setContextIndex(i => Math.max(0, i - 1));
                    if (key === "s") setContextIndex(i => Math.min(options.length - 1, i + 1));
                    if (key === " ") {
                        const option = options[contextIndex];
                        option?.action({
                            openExamine: setExamineText,
                            closeContext: () => setContextOpen(false),
                            consumeItem: () => useInventoryStore.getState().consumeItem(slot.item),

                            equipUnequip: handleTryEquip,
                            tryReloadGun: () => {
                                if (tryFindAmmoAndWeapon(slot.item)) setContextOpen(false);
                                else console.log("No ammo type");
                            },
                        });
                    }
                    if (key === "a") setContextOpen(false);
                    return;
                }

                // Navigation
                if (key === "a") col === 0 ? setFocus("menu") : setInventoryIndex(i => i - 1);
                if (key === "d") setInventoryIndex(i => Math.min(TOTAL_SLOTS - 1, i + 1));
                if (key === "w") setInventoryIndex(i => Math.max(0, i - INVENTORY_COLUMNS));
                if (key === "s") setInventoryIndex(i => Math.min(TOTAL_SLOTS - 1, i + INVENTORY_COLUMNS));

                if (key === " " && slot && ITEM_INTERACT_TABLE[slot.item]) {
                    setContextOpen(true);
                    setContextIndex(0);
                }
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, focus, menuIndex, inventoryIndex, contextOpen, contextIndex, examineText, fullInventory, allItems]);

    if (!open) return null;

    return (
        <div style={{ position: "absolute", inset: 0, background: "black", color: "white", display: "flex", justifyContent: "center", alignItems: "center" }}>
            {/* LEFT MENU */}
            <div style={{ width: "20%", height: "80%", background: "red", display: "flex", flexDirection: "column", justifyContent: "space-around", padding: 20 }}>
                {menuOptions.map((op, i) => (
                    <h1 key={op} style={{ color: focus === "menu" && i === menuIndex ? "yellow" : "white" }}>{op.toUpperCase()}</h1>
                ))}
            </div>

            {/* RIGHT PANEL */}
            <div style={{ position: "relative", width: "80%", height: "80%", background: "red" }}>
                {activeMenu === "Inventory" && (
                    <>
                        <InventoryWindow
                            selectedIndex={inventoryIndex}
                            focused={focus === "content" && !contextOpen}
                            inventory={fullInventory}
                            equipped={equippedItem}
                            style={{ display: activeMenu === "Inventory" ? "grid" : "none" }}
                        />

                        {contextOpen && fullInventory[inventoryIndex] && ITEM_INTERACT_TABLE[fullInventory[inventoryIndex].item] && (
                            <div style={{ position: "absolute", right: "10%", top: "20%", background: "black", border: "2px solid white", padding: 10 }}>
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
                        <div style={{ marginTop: 20, color: "gray" }}>Press A or Space to close</div>
                    </div>
                )}

                {activeMenu === "Map" && <div>Map</div>}
                {activeMenu === "Options" && <div>Options</div>}
            </div>
        </div>
    );
};
