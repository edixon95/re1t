import { useRef } from "react";
import { SaveStation } from "../levelParts/SaveStation";
import { PuzzleStation } from "../levelParts/PuzzleStation";
import { ButtonStation } from "../levelParts/ButtonStation";

export const otherMeshes = [];
const typeComponents = {
    saveStation: SaveStation,
    puzzleStation: PuzzleStation,
    buttonStation: ButtonStation
};

export const OtherInteractManager = ({ otherItems }) => {
    // Reset the array each render
    otherMeshes.length = 0;

    return (
        <>
            {otherItems.map((item, i) => {
                const ref = useRef();
                otherMeshes.push(ref);

                const ItemComponent = typeComponents[item.type];

                if (ItemComponent) {
                    return (
                        <ItemComponent
                            key={item.id || i}
                            position={item.position}
                            rotation={item.rotation}
                            ref={ref}
                            item={item}
                        />
                    );
                }

                // fallback
                return (
                    <mesh
                        key={item.id || i}
                        ref={ref}
                        position={item.position}
                        rotation={[0, item.rotation || 0, 0]}
                        castShadow
                        receiveShadow
                        userData={{
                            type: item.type,
                            item: item.item,
                            id: item.id,
                        }}
                    >
                        <boxGeometry args={[0.5, 0.3, 0.9]} />
                        <meshStandardMaterial color="purple" />
                    </mesh>
                );
            })}
        </>
    );
};
