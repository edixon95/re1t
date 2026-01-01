export const InventoryWindow = ({
    selectedIndex,
    focused,
    equipped,
    inventory,
    style,
    combineSourceIndex = null,
    validCombineTargets = []
}) => {
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
            {inventory.map((slot, i) => {
                const isSelected = focused && i === selectedIndex;
                const isCombineSource = i === combineSourceIndex;

                const isValidTarget =
                    combineSourceIndex !== null &&
                    slot &&
                    validCombineTargets.includes(slot.item) &&
                    i !== combineSourceIndex;

                // Dim everything except:
                // - selected slot
                // - combine source
                // - valid targets
                const isDimmed =
                    combineSourceIndex !== null &&
                    !isSelected &&
                    !isCombineSource &&
                    !isValidTarget;

                let borderColor = "white";
                if (isCombineSource) borderColor = "cyan";
                if (isSelected) borderColor = "yellow";

                return (
                    <div
                        key={i}
                        style={{
                            border: `2px solid ${borderColor}`,
                            opacity: isDimmed ? 0.35 : 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "22px",
                            fontWeight: "bold",
                            boxSizing: "border-box",
                            position: "relative",
                            transition: "opacity 0.15s ease"
                        }}
                    >
                        {slot?.mAmmo != null && (
                            <div style={{ position: "absolute", top: 10, left: 10, fontSize: 14 }}>
                                {slot.cAmmo} / {slot.mAmmo}
                            </div>
                        )}

                        {equipped?.equipped === slot?.item && (
                            <div style={{ position: "absolute", top: 30, left: 10, fontSize: 12 }}>
                                Equipped
                            </div>
                        )}

                        {slot?.item ?? "—"}
                    </div>
                );
            })}


        </div>
    );
};
