import { useRef } from "react";

export const itemMeshes = [];

export const ItemManager = ({ items }) => {
    itemMeshes.length = 0;
    return (
        <>
            {items.map((item, i) => {
                const ref = useRef();
                itemMeshes.push(ref);

                return (
                    <mesh
                        key={i}
                        ref={ref}
                        position={item.position}
                        castShadow
                        userData={{
                            type: "item",
                            item: item.item,
                        }}
                    >
                        <boxGeometry args={item.size} />
                        <meshStandardMaterial color="orange" />
                    </mesh>
                );
            })}
        </>
    );
};
