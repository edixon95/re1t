import { inventory } from "../Player/Inventory"

export const InventoryWindow = () => {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)", // 4 columns
                gridTemplateRows: "repeat(3, 1fr)",    // 3 rows
                gap: "10px",                           // spacing between slots
                width: "100%",
                height: "100%",
                boxSizing: "border-box",
            }}
        >
            {inventory.map((slot, i) => (
                <div
                    key={i}
                    style={{
                        border: "2px solid white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                        fontWeight: "bold",
                        boxSizing: "border-box"
                    }}
                >
                    {slot ? slot.item : "—"}
                </div>
            ))}
        </div>
    )
}