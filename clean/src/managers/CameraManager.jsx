import { CameraSystem } from "../camera/CameraSystem"
import { CAMERA_TABLE } from "../data/cameraTable"
import { RegionTrigger } from "../camera/RegionTrigger"

export const CameraManager = ({ region, setRegion, gameState, playerRef }) => {
    const level = gameState.level
    const camerasForLevel = CAMERA_TABLE[level]

    if (!camerasForLevel) return null

    return (
        <>
            <CameraSystem
                region={region}
                gameState={gameState}
            />

            {/* Region triggers for current level only */}
            {Object.entries(camerasForLevel).map(([regionId, cam]) => (
                <RegionTrigger
                    key={regionId}
                    playerRef={playerRef}
                    regionId={regionId}
                    position={cam.boundingBox}
                    size={cam.size}
                    setRegion={setRegion}
                />
            ))}
        </>
    )
}
