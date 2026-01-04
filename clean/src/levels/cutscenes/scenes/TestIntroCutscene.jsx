import { useThree, useFrame } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { TestIntroCutsceneWorld } from "../worlds/TestIntroCutsceneWorld"

export const TestIntroCutscene = ({ onEnd }) => {
  const { camera } = useThree()
  const [stage, setStage] = useState(0)

  // Refs for the players
  const p1 = useRef()
  const p2 = useRef()

  // SAFETY GUARD: ensure onEnd only runs once
  const endOnce = useRef(false)
  const safeEnd = () => {
    if (endOnce.current) return
    endOnce.current = true
    onEnd?.()
  }

  // Set camera initially
  useEffect(() => {
    camera.position.set(0, 3, 8)
    camera.lookAt(0, 1, 0)
  }, [camera])

  // Handle Space key to advance stages
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === "Space") setStage((s) => s + 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Animate players & camera based on stages
  useFrame((_, delta) => {
    if (!p1.current || !p2.current) return
    // STAGE 0 -> walk in
    if (stage === 1) {
      p1.current.position.z -= delta * 1.2
      p2.current.position.z -= delta * 1.2

      camera.position.lerp(new THREE.Vector3(0, 3, 8), 0.05)
      camera.lookAt(0, 1, 0)

      if (p1.current.position.z <= 0 && stage === 1) {
        setStage(2)
      }
    }

    // STAGE 2 -> player close-up
    if (stage === 2) {
      camera.position.lerp(new THREE.Vector3(0, 1.8, 2.5), 0.05)
      camera.lookAt(0, 1.2, 0)
    }

    // STAGE 4 -> zoom out to show both players
    if (stage === 3) {
      camera.position.lerp(new THREE.Vector3(0, 1, 0.9), 0.05)
      camera.lookAt(-0.5, 1, 0)
    }

    if (stage === 4) {
      camera.position.lerp(new THREE.Vector3(0, 1, 0.9), 0.05)
      camera.lookAt(0.5, 1, 0)
    }

    // STAGE 5 -> end cutscene
    if (stage >= 5) {
      safeEnd()
    }
  })

  // Create the meshes here in parent to avoid cloning / blue block
  const p1Mesh = (
    <mesh ref={p1} position={[-0.6, 0.5, 3]}>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial color="red" />
    </mesh>
  )

  const p2Mesh = (
    <mesh ref={p2} position={[0.6, 0.5, 3]}>
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  )

  return <TestIntroCutsceneWorld p1Mesh={p1Mesh} p2Mesh={p2Mesh} />
}
