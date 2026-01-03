import { useRef } from "react";
import { WallManager } from "../../managers/WallManager";
import { PropManager } from "../../managers/PropManager";
import { ItemManager } from "../../managers/ItemManager";
import { DoorManager, doorMeshes } from "../../managers/DoorManager";
import { DOOR_TABLE } from "../../data/doorTable";
import { useItemStore } from "../../stores/useItemStore";
import { LEVEL_TABLE } from "../../data/levelTabel";
import { OtherInteractManager } from "../../managers/OtherInteractManager";

export const WorldIntro = () => {
    const floors = LEVEL_TABLE["intro"].world
    const props = LEVEL_TABLE["intro"].props
    const others = LEVEL_TABLE["intro"].others

    const floorRefs = floors.map(() => useRef());

    const safeToRender = useItemStore((state) => state.safeToRender);
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

            <WallManager floors={floors} doors={doorMeshes} />
            <PropManager props={props} />
            {safeToRender &&
                <ItemManager items={introItems} />
            }
            <DoorManager doors={DOOR_TABLE["intro"]} />

            {/* Manual per level */}
            <OtherInteractManager otherItems={others} />
        </>
    );
};
