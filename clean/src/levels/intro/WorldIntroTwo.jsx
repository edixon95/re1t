import { useRef } from "react"
import { WallManager } from "../../managers/WallManager"
import { PropManager } from "../../managers/PropManager"
import { ItemManager } from "../../managers/ItemManager"
import { DoorManager } from "../../managers/DoorManager"
import { DOOR_TABLE } from "../../data/doorTable"
import { useItemStore } from "../../stores/useItemStore"

export const WorldIntroTwo = () => {
    // Different corridor layout + color
    const floors = [
        { position: [0, 0, 0], size: [12, 4], color: "#666" },
        { position: [5, 0, -4], size: [4, 8], color: "#666" },
    ]

    // Props rearranged
    const props = [
        { position: [1, 0.5, -0.8], size: [1, 1.2, 1] },
        { position: [4, 0.5, -3], size: [0.5, 1, 2] },
        { position: [6, 0.5, -6], size: [1, 1, 1] },
    ]

    const floorRefs = floors.map(() => useRef())

    // 👉 read introTwo items from Zustand
    const introTwoItems = useItemStore((state) => state.itemTable.introTwo)

    return (
        <>
            {/* Lighting feels moodier */}
            {floors.map((floor, i) => {
                const [x, , z] = floor.position
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
                )
            })}

            <ambientLight intensity={1.2} />

            {/* Floors */}
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
            <ItemManager items={introTwoItems} />
            <DoorManager doors={DOOR_TABLE["introTwo"]} />
        </>
    )
}
