import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { soundEvents } from "../sounds/SoundSystem";
import * as THREE from "three";

export const DebugSoundSpheres = () => {
    const groupRef = useRef();

    useFrame(() => {
        if (!groupRef.current) return;

        while (groupRef.current.children.length) {
            groupRef.current.remove(groupRef.current.children[0]);
        }

        soundEvents.forEach((s) => {
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(s.radius, 16, 16),
                new THREE.MeshBasicMaterial({
                    color: "yellow",
                    wireframe: true,
                    transparent: true,
                    opacity: 0.2,
                })
            );
            mesh.position.copy(s.position);
            groupRef.current.add(mesh);
        });
    });

    return <group ref={groupRef} />;
};
