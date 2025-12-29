import { useEffect, useState } from "react"
import { onInventoryChange, inventory, tryReloadWeapon } from "../Player/Inventory"
import { equippedItem, menuOpenRef } from "../Player/Player"
import { InventoryWindow } from "./InventoryUI"
import { ITEM_INTERACT_TABLE } from "../data/itemInteractTable"
import { fullItemRef } from "../data/itemTable"
import { AMMO_TABLE } from "../data/ammoTable"

const INVENTORY_COLUMNS = 4
const INVENTORY_ROWS = 3
const TOTAL_SLOTS = INVENTORY_COLUMNS * INVENTORY_ROWS

export const PlayerMenuUI = () => {
    const [, forceUpdate] = useState(0)
    const [open, setOpen] = useState(menuOpenRef.current)

    const [focus, setFocus] = useState("menu") // "menu" | "content"
    const [menuIndex, setMenuIndex] = useState(0)
    const [inventoryIndex, setInventoryIndex] = useState(0)
    const [contextOpen, setContextOpen] = useState(false)
    const [contextIndex, setContextIndex] = useState(0)
    const [examineText, setExamineText] = useState(null)

    const menuOptions = ["Inventory", "Map", "Options"]
    const activeMenu = menuOptions[menuIndex]

    // Always ensure inventory has 12 slots
    const fullInventory = Array(TOTAL_SLOTS)
        .fill(null)
        .map((_, i) => inventory[i] ?? null)

    const tryFindAmmoAndWeapon = (weaponType) => {
        const ammoType = AMMO_TABLE[weaponType];
        if (!ammoType) return false;
        const hasAmmoType = inventory.find((x) => x?.item === ammoType?.item)
        if (!hasAmmoType) return false;

        fullItemRef.current.forEach((item) => {
            // todo wont always be max
            if (item.item === ammoType.item && tryReloadWeapon(ammoType.item, true)) {
                item.cAmmo = ammoType.maxAmmo
                item.mAmmo = ammoType.maxAmmo
            }
        })
        return true;
    }

    const handleTryEquip = () => {
        if (inventory[inventoryIndex]?.item === equippedItem.equipped) {
            equippedItem.equipped = null
        } else {
            fullItemRef.current.forEach((item) => {
                if (item.item === inventory[inventoryIndex].item) {
                    equippedItem.equipped = item.item
                    equippedItem.cAmmo = item.cAmmo
                    equippedItem.mAmmo = item.mAmmo
                    return;
                }
            })
        }
    }

    useEffect(() => {
        return onInventoryChange(() => forceUpdate(v => v + 1))
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            if (menuOpenRef.current !== open) {
                setOpen(menuOpenRef.current)
            }
        }, 16)
        return () => clearInterval(interval)
    }, [open])

    useEffect(() => {
        if (!open) {
            setContextOpen(false)
            setExamineText(null)
        }
    }, [open])

    useEffect(() => {
        const onKeyDown = (e) => {
            if (!open) return

            const key = e.key.toLowerCase()

            // ---------- EXAMINE PANEL ----------
            if (examineText) {
                if (key === " " || key === "a") {
                    setExamineText(null)
                }
                return
            }

            // ---------- MENU ----------
            if (focus === "menu") {
                if (key === "w") setMenuIndex(i => Math.max(0, i - 1))
                if (key === "s") setMenuIndex(i => Math.min(menuOptions.length - 1, i + 1))
                if (key === "d") setFocus("content")
                return
            }

            // ---------- CONTENT ----------
            if (focus === "content") {
                if (activeMenu !== "Inventory") return

                const slot = fullInventory[inventoryIndex]

                // ---------- CONTEXT MENU ----------
                if (contextOpen) {
                    if (!slot) {
                        setContextOpen(false)
                        return
                    }

                    const options = ITEM_INTERACT_TABLE[slot.item]?.Options ?? []

                    if (key === "w") {
                        setContextIndex(i => Math.max(0, i - 1))
                        return
                    }
                    if (key === "s") {
                        setContextIndex(i => Math.min(options.length - 1, i + 1))
                        return
                    }
                    if (key === " ") {
                        const option = options[contextIndex]
                        option?.action({
                            openExamine: setExamineText,
                            closeContext: () => setContextOpen(false),
                            consumeItem: () => {
                                inventory[inventoryIndex] = null
                                setContextOpen(false)
                                forceUpdate(v => v + 1)
                            },
                            equipUnequip: () => {
                                handleTryEquip()

                                setContextOpen(false)
                                forceUpdate(v => v + 1)
                            },
                            tryReloadGun: () => {
                                if (tryFindAmmoAndWeapon(inventory[inventoryIndex].item)) {
                                    setContextOpen(false)
                                    forceUpdate(v => v + 1)
                                } else {
                                    console.log("no ammo type")
                                }


                            }
                        })
                        return
                    }
                    if (key === "a") {
                        setContextOpen(false)
                        return
                    }
                    return
                }

                // ---------- INVENTORY NAVIGATION ----------
                const col = inventoryIndex % INVENTORY_COLUMNS

                if (key === "a") {
                    if (col === 0) setFocus("menu")
                    else setInventoryIndex(i => i - 1)
                }
                if (key === "d") setInventoryIndex(i => Math.min(TOTAL_SLOTS - 1, i + 1))
                if (key === "w") setInventoryIndex(i => Math.max(0, i - INVENTORY_COLUMNS))
                if (key === "s") setInventoryIndex(i => Math.min(TOTAL_SLOTS - 1, i + INVENTORY_COLUMNS))

                // ---------- OPEN CONTEXT MENU ----------
                if (key === " " && slot && ITEM_INTERACT_TABLE[slot.item]) {
                    setContextOpen(true)
                    setContextIndex(0)
                }
            }
        }

        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [
        open,
        focus,
        menuIndex,
        inventoryIndex,
        contextOpen,
        contextIndex,
        examineText,
        activeMenu
    ])

    if (!open) return null

    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                background: "black",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            {/* LEFT MENU */}
            <div
                style={{
                    width: "20%",
                    height: "80%",
                    background: "red",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-around",
                    padding: 20,
                }}
            >
                {menuOptions.map((op, i) => (
                    <h1
                        key={op}
                        style={{
                            color: focus === "menu" && i === menuIndex ? "yellow" : "white",
                        }}
                    >
                        {op.toUpperCase()}
                    </h1>
                ))}
            </div>

            {/* RIGHT PANEL */}
            <div
                style={{
                    position: "relative",
                    width: "80%",
                    height: "80%",
                    background: "red",
                }}
            >
                {activeMenu === "Inventory" && (
                    <>
                        <InventoryWindow
                            selectedIndex={inventoryIndex}
                            focused={focus === "content" && !contextOpen}
                            inventory={fullInventory}
                            equipped={equippedItem}
                        />

                        {contextOpen && fullInventory[inventoryIndex] && ITEM_INTERACT_TABLE[fullInventory[inventoryIndex].item] && (
                            <div
                                style={{
                                    position: "absolute",
                                    right: "10%",
                                    top: "20%",
                                    background: "black",
                                    border: "2px solid white",
                                    padding: 10,
                                }}
                            >
                                {ITEM_INTERACT_TABLE[fullInventory[inventoryIndex].item].Options.map((op, i) => (
                                    <div
                                        key={op.label}
                                        style={{
                                            color: i === contextIndex ? "yellow" : "white",
                                            padding: "4px 8px",
                                        }}
                                    >

                                        {
                                            equippedItem.equipped === fullInventory[inventoryIndex].item &&
                                                op.label === "Equip" ? "Unequip" : op.label}
                                        {/* {op.label} */}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {examineText && (
                    <div
                        style={{
                            position: "absolute",
                            inset: "20%",
                            background: "black",
                            border: "2px solid white",
                            padding: 20,
                            fontSize: "20px",
                        }}
                    >
                        {examineText}
                        <div style={{ marginTop: 20, color: "gray" }}>
                            Press A or Space to close
                        </div>
                    </div>
                )}

                {activeMenu === "Map" && (<div>Map</div>)}
                {activeMenu === "Options" && (<div>Options</div>)}
            </div>
        </div>
    )
}
