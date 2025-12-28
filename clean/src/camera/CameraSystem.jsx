import { useThree } from "@react-three/fiber"
import { useEffect } from "react"
import { CAMERA_TABLE } from "../data/cameraTable"

export const CameraSystem = ({ region, gameState }) => {
  const { camera } = useThree()

  useEffect(() => {
    if (!region || !gameState?.level) return

    const level = gameState.level
    const levelCameras = CAMERA_TABLE[level]
    if (!levelCameras) return

    const cam = levelCameras[region]
    if (!cam) return

    camera.position.set(...cam.position)
    camera.lookAt(...cam.lookAt)
    camera.updateMatrixWorld()
  }, [region, gameState.level, camera])

  return null
}
