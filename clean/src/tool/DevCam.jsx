import { PointerLockControls } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export const DevCam = () => {
    const controls = useRef();
    const { camera } = useThree();

    const speed = 10;

    const keys = useRef({
        w: false,
        a: false,
        s: false,
        d: false,
        q: false,
        e: false,
    });

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.code === "KeyW") keys.current.w = true;
            if (e.code === "KeyA") keys.current.a = true;
            if (e.code === "KeyS") keys.current.s = true;
            if (e.code === "KeyD") keys.current.d = true;
            if (e.code === "KeyQ") keys.current.q = true;
            if (e.code === "KeyE") keys.current.e = true;

            if (e.code === "Space") {
                const dir = new THREE.Vector3();
                camera.getWorldDirection(dir);
                const cam = camera.position.clone()
                const pos = [cam.x, cam.y, cam.z]
                const direct = [dir.x, dir.y, dir.z]
                console.log("📷 Position:", pos);
                console.log("🎯 Look Dir:", direct);
            }
        };

        const onKeyUp = (e) => {
            if (e.code === "KeyW") keys.current.w = false;
            if (e.code === "KeyA") keys.current.a = false;
            if (e.code === "KeyS") keys.current.s = false;
            if (e.code === "KeyD") keys.current.d = false;
            if (e.code === "KeyQ") keys.current.q = false;
            if (e.code === "KeyE") keys.current.e = false;
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, [camera]);

    useFrame((_, delta) => {
        if (!controls.current?.isLocked) return;

        const velocity = speed * delta;

        if (keys.current.w) controls.current.moveForward(velocity);
        if (keys.current.s) controls.current.moveForward(-velocity);
        if (keys.current.a) controls.current.moveRight(-velocity);
        if (keys.current.d) controls.current.moveRight(velocity);

        if (keys.current.q) camera.position.y -= velocity;
        if (keys.current.e) camera.position.y += velocity;
    });

    return <PointerLockControls ref={controls} />;
};
