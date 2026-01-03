import { useRef, useEffect } from "react";
import { otherMeshes } from "./otherMeshes";

export const SaveStation = ({ position, rotation = 1 }) => {
    const ref = useRef();
    const yRotation = rotation === 2 ? Math.PI / 2 : 0;
    useEffect(() => {
        otherMeshes.push(ref);

        return () => {
            const index = otherMeshes.indexOf(ref);
            if (index !== -1) otherMeshes.splice(index, 1);
        };
    }, []);

    return (
        <mesh
            ref={ref}
            position={position}
            rotation={[0, yRotation, 0]}
            userData={{ type: "saveStation" }}
            castShadow
            receiveShadow
        >
            <boxGeometry args={[0.5, 0.3, 0.9]} />
            <meshStandardMaterial color="purple" />
        </mesh>
    );
};
