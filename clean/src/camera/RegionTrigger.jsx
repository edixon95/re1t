import { Box3 } from "three";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

export const RegionTrigger =({
  playerRef,
  regionId,
  position,
  size,
  setRegion,
}) => {
  const boxRef = useRef();
  const box = useMemo(() => new Box3(), []);

  useFrame(() => {
    if (!playerRef?.current || !boxRef.current) return;

    box.setFromObject(boxRef.current);

    if (box.containsPoint(playerRef.current.position)) {
      setRegion(regionId);
    }
  });

  return (
    <mesh ref={boxRef} position={position} visible={true}>
      <boxGeometry args={size} />
      <meshBasicMaterial wireframe />
    </mesh>
  );
}
