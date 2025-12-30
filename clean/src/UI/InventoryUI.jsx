export const InventoryWindow = ({ selectedIndex, focused, equipped, inventory, style }) => {
    return (
        <div
            style={{
                ...style,
                display: style?.display || "grid",
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
                        border: focused && i === selectedIndex ? "2px solid yellow" : "2px solid white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                        fontWeight: "bold",
                        boxSizing: "border-box",
                        position: "relative"
                    }}
                >
                    {slot?.mAmmo != null && (
                        <div style={{ position: "absolute", top: 10, left: 10 }}>
                            {slot.cAmmo} / {slot.mAmmo}
                        </div>
                    )}

                    {equipped?.equipped === slot?.item && (
                        <div style={{ position: "absolute", top: 30, left: 10 }}>
                            Equipped
                        </div>
                    )}

                    {slot?.item ?? "—"}
                </div>
            ))}
        </div>
    )
}
