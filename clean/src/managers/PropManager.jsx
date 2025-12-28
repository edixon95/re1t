import { useRef } from "react";

export const propMeshes = [];

export const PropManager = ({ props }) => {
    return (
        <>
            {props.map((prop, i) => {
                const ref = useRef();
                propMeshes.push(ref);

                return (
                    <mesh
                        key={i}
                        ref={ref}
                        position={prop.position}
                        castShadow
                        receiveShadow
                    >
                        <boxGeometry args={prop.size} />
                        <meshStandardMaterial color="green" />
                    </mesh>
                );
            })}
        </>
    );
};
