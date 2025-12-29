import { inventory } from "../Player/Inventory"

export const InventoryWindow = ({ selectedIndex, focused, equipped }) => {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gridTemplateRows: "repeat(3, 1fr)",
                gap: "10px",
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
            }}
        >
            {inventory.map((slot, i) => (
                <div
                    key={i}
                    style={{
                        border:
                            focused && i === selectedIndex
                                ? "2px solid yellow"
                                : "2px solid white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                        fontWeight: "bold",
                        boxSizing: "border-box",
                        position: "relative"
                    }}
                >
                    {equipped?.equipped === slot?.item && <div style={{ position: "absolute", top: 10, left: 10 }}>Equipped</div>}
                    {slot ? slot.item : "—"}
                </div>
            ))}
        </div>
    )
}
