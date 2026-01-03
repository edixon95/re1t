import * as THREE from "three";
import { useMemo } from "react";
import { isVisible } from "../App";

export const Stair = ({ stair, ref }) => {
    const [width, height, depth] = stair.size;

    const slopeGeometry = useMemo(() => {
        const shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(depth, 0);
        shape.lineTo(depth, height);
        shape.lineTo(0, 0);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: width,
            bevelEnabled: false,
        });
        geom.computeBoundingBox();
        return geom;
    }, [width, height, depth]);

    const rotationY =
        stair.direction === 2
            ? Math.PI / 2
            : stair.direction === 3
                ? Math.PI
                : stair.direction === 4
                    ? (3 * Math.PI) / 2
                    : 0;

    const interactionOffsetX = stair.travel === "down" ? depth : 0.15;
    const interactHeight = stair.travel === "down" ? height + 0.3 : height / 2;

    // Compute slope center from geometry bounding box
    const slopeCenter = useMemo(() => {
        const box = slopeGeometry.boundingBox;
        const center = new THREE.Vector3();
        box.getCenter(center);
        return center;
    }, [slopeGeometry]);

    // Collision box slightly bigger
    const buffer = 0.1;
    const collisionWidth = width;
    const collisionHeight = height + buffer;
    const collisionDepth = depth;

    const collisionMesh = [
        stair.travel === "up" ? slopeCenter.x : slopeCenter.x + 0.2,
        stair.travel === "up" ? (slopeCenter.y + buffer / 2) : (slopeCenter.y + buffer + 0.5),
        stair.travel === "up" ? slopeCenter.z : slopeCenter.z
    ]

    return (
        <group position={stair.position} rotation={[0, rotationY, 0]}>
            {/* Visible slope */}
            <mesh geometry={slopeGeometry}>
                <meshStandardMaterial color="gray" />
            </mesh>

            {/* Interaction box */}
            <mesh
                position={[interactionOffsetX, interactHeight, width / 2]}
                userData={{ type: "door", door: stair }}
            >
                <boxGeometry args={[depth * 0.3, height, width]} />
                <meshBasicMaterial wireframe color="cyan" visible={isVisible} />
            </mesh>

            {/* Collision box */}
            <mesh
                ref={ref}
                position={collisionMesh}
                userData={{ type: "door", door: stair, isStair: true, travel: stair.travel }}
            >
                <boxGeometry args={[collisionDepth, collisionHeight, collisionWidth]} />
                <meshBasicMaterial wireframe visible={isVisible} />
            </mesh>
        </group>
    );
};
