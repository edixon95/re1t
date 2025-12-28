import { useEffect, useState } from "react"
import { onInventoryChange } from "../Player/Inventory"
import { menuOpenRef } from "../Player/Player"
import { InventoryWindow } from "./InventoryUI"

export const PlayerMenuUI = () => {
    const [, forceUpdate] = useState(0)
    const [open, setOpen] = useState(menuOpenRef.current)
    const [screen, setScreen] = useState("Inventory")
    const menuOptions = [
        "Inventory",
        "Map",
        "Options"
    ]

    useEffect(() => {
        return onInventoryChange(() => forceUpdate(v => v + 1))
    }, [])

    // Watch the ref for changes (polling or effect in Player could call setOpen)
    useEffect(() => {
        const interval = setInterval(() => {
            if (menuOpenRef.current !== open) {
                setOpen(menuOpenRef.current)
            }
        }, 16) // ~60fps
        return () => clearInterval(interval)
    }, [open])

    if (!open) return null

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                background: "rgba(0, 0, 0, 1)",
                color: "white",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
            }}


        >
            <div style={{
                backgroundColor: "red",
                width: "20%",
                height: "80%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                padding: 20,
                border: "2px solid black",
                boxSizing: "border-box",
            }}>
                {menuOptions.map((op) => (
                    <div><h1>{op.toUpperCase()}</h1></div>
                ))}

            </div>
            <div style={{
                backgroundColor: "red",
                width: "80%",
                height: "80%",
                boxSizing: "border-box"
            }}>
                {screen === "Inventory" && <InventoryWindow />}

            </div>
        </div>
    )
}
