import { useRef } from "react";
import { WallManager } from "../../managers/WallManager";
import { PropManager } from "../../managers/PropManager";
import { ItemManager } from "../../managers/ItemManager";
import { DoorManager } from "../../managers/DoorManager";
import { DOOR_TABLE } from "../../data/doorTable";

export const WorldIntro = () => {
    // Define floors
    const floors = [
        { position: [4, 0, 0], size: [10, 4], color: "#999" }, // horizontal arm
        { position: [-3, 0, 3], size: [4, 10], color: "#999" }, // vertical arm
    ];

    const props = [
        { position: [2, 0.5, 0], size: [1, 1, 1] },
        { position: [-2, 0.5, 3], size: [2, 1, 0.5] },
    ];

    const items = [
        { position: [2, 0.25, 0.8], size: [0.3, 0.3, 0.3], item: "Gun" },
        { position: [-3, 0.25, 3], size: [0.3, 0.3, 0.3], item: "KeyCard" },
    ];


    // Store floor meshes in an array for debugging or raycasting
    const floorRefs = floors.map(() => useRef());

    return (
        <>

            {floors.map((floor, i) => {
                const [x, , z] = floor.position;

                return (
                    <spotLight
                        key={`light-${i}`}
                        position={[x, 4, z]}      // height above corridor
                        target-position={[x, 0, z]}
                        intensity={1.2}
                        angle={Math.PI / 6}       // narrow beam
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
            <ItemManager items={items} />
            <DoorManager doors={DOOR_TABLE["intro"]} />

        </>
    );
};
