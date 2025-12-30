import { useRef } from "react";
import { WallManager } from "../../managers/WallManager";
import { PropManager } from "../../managers/PropManager";
import { ItemManager } from "../../managers/ItemManager";
import { DoorManager } from "../../managers/DoorManager";
import { DOOR_TABLE } from "../../data/doorTable";
import { useItemStore } from "../../stores/useItemStore";

export const WorldIntro = () => {
    // Define floors
    const floors = [
        { position: [4, 0, 0], size: [10, 4], color: "#999" },
        { position: [-3, 0, 3], size: [4, 10], color: "#999" },
    ];

    const props = [
        { position: [2, 0.5, 0], size: [1, 1, 1] },
        { position: [-2, 0.5, 3], size: [2, 1, 0.5] },
    ];

    // Store floor meshes in an array for debugging or raycasting
    const floorRefs = floors.map(() => useRef());

    // 👉 read intro items from Zustand
    const introItems = useItemStore((state) => state.itemTable.intro);

    return (
        <>
            {floors.map((floor, i) => {
                const [x, , z] = floor.position;

                return (
                    <spotLight
                        key={`light-${i}`}
                        position={[x, 4, z]}
                        target-position={[x, 0, z]}
                        intensity={1.2}
                        angle={Math.PI / 6}
                        penumbra={0.2}
                        distance={6}
                        decay={2}
                        castShadow
                    />
                );
            })}

            <ambientLight intensity={1.2} />

            {/* Render floors */}
            {floors.map((floor, i) => (
                <mesh
                    key={i}
                    ref={floorRefs[i]}
                    position={floor.position}
                    rotation={[-Math.PI / 2, 0, 0]}
                    receiveShadow
                >
                    <planeGeometry args={floor.size} />
                    <meshStandardMaterial color={floor.color} />
                </mesh>
            ))}

            <WallManager floors={floors} />
            <PropManager props={props} />
            <ItemManager items={introItems} />
            <DoorManager doors={DOOR_TABLE["intro"]} />
        </>
    );
};
