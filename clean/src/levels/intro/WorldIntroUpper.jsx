import * as THREE from "three";
import { useRef } from "react";
import { WallManager } from "../../managers/WallManager";
import { PropManager } from "../../managers/PropManager";
import { ItemManager } from "../../managers/ItemManager";
import { DoorManager, doorMeshes } from "../../managers/DoorManager";
import { DOOR_TABLE } from "../../data/doorTable";
import { useItemStore } from "../../stores/useItemStore";
import { LEVEL_TABLE } from "../../data/levelTabel";
import { OtherInteractManager } from "../../managers/OtherInteractManager";

export const WorldIntroUpper = () => {
    const floors = LEVEL_TABLE["introOneUpper"].world
    const props = LEVEL_TABLE["introOneUpper"].props
    const others = LEVEL_TABLE["introOneUpper"].others

    const floorRefs = floors.map(() => useRef());

    const safeToRender = useItemStore((state) => state.safeToRender);
    const introItems = useItemStore((state) => state.itemTable.introOneUpper);

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

            {/* Render normal floors */}
            {floors.filter(floor => !floor?.skip).map((floor, i) => (
                <mesh
                    key={`floor-${i}`}
                    ref={floorRefs[i]}
                    position={floor.position}
                    rotation={[-Math.PI / 2, 0, 0]}
                    receiveShadow
                >
                    <planeGeometry args={floor.size} />
                    <meshStandardMaterial color={floor.color} side={THREE.DoubleSide} />
                </mesh>
            ))}

            {/* Render 3 walls around skipped floors */}
            {floors.filter(floor => floor?.skip).map((floor, i) => {
                const [x, y, z] = floor.position;
                const [width, depth] = floor.size;
                const wallHeight = 3;

                const directionToWallNum = {
                    1: 4,
                    2: 2,
                    3: 3,
                    4: 1,
                };
                const walls = [
                    { pos: [x, -wallHeight / 2, z - depth / 2], size: [width, wallHeight], rot: [0, 0, 0], num: 1 },
                    { pos: [x, -wallHeight / 2, z + depth / 2], size: [width, wallHeight], rot: [0, 0, 0], num: 2 },
                    { pos: [x - width / 2, -wallHeight / 2, z], size: [depth, wallHeight], rot: [0, Math.PI / 2, 0], num: 3 },
                    { pos: [x + width / 2, -wallHeight / 2, z], size: [depth, wallHeight], rot: [0, Math.PI / 2, 0], num: 4 },
                ];

                return walls
                    .filter(w => w.num !== directionToWallNum[floor.direction])
                    .map((w, j) => (
                        <mesh key={`wall-${i}-${j}`} position={w.pos} rotation={w.rot}>
                            <planeGeometry args={w.size} />
                            <meshStandardMaterial color="black" side={THREE.DoubleSide} />
                        </mesh>
                    ));

            })}


            <WallManager floors={floors} doors={doorMeshes} />
            <PropManager props={props} />
            {safeToRender &&
                <ItemManager items={introItems} />
            }
            <DoorManager doors={DOOR_TABLE["introOneUpper"]} />

            {/* Manual per level */}
            <OtherInteractManager otherItems={others} />
        </>
    );
};
