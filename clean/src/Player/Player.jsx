import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

import { canMove } from "../helpers/canMove";
import { tryInteract } from "./tryInteract";
import { inventory } from "./Inventory";

export const menuOpenRef = { current: false }; // lock inputs
export const isTransition = { current: false }; // Lock but no menu

export const Player = ({ playerRef, level }) => {
  const aimingRef = useRef(false); // is aiming
  const prevAimKeyRef = useRef(false); // toggle aim
  const prevSpaceKeyRef = useRef(false); // track space
  const prevTabKeyRef = useRef(false); // local menu track


  const [aiming, setAiming] = useState(false);
  console.log(inventory)

  useEffect(() => {
    window.keys = {};
    const handleKeyDown = (e) => (window.keys[e.code] = true);
    const handleKeyUp = (e) => (window.keys[e.code] = false);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const direction = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!playerRef?.current) return;

    if (isTransition.current) return; // Shouldn't be able to do anything if in transition

    const tabPressed = !!window.keys["KeyQ"];

    if (tabPressed && !prevTabKeyRef.current) {
      menuOpenRef.current = !menuOpenRef.current;

      if (menuOpenRef.current) {
        console.log("Menu opened");
      } else {
        console.log("Menu closed");
      }
    }

    prevTabKeyRef.current = tabPressed;

    if (menuOpenRef.current) return; // Can't do inputs if menu is open

    const spacePressed = !!window.keys["Space"];

    if (spacePressed && !prevSpaceKeyRef.current) {
      if (aimingRef.current) {
        // SHOOT
        console.log("Player shoots");
      } else {
        // INTERACT
        console.log("Player interacts");
        tryInteract(playerRef.current, level)
      }
    }
    prevSpaceKeyRef.current = spacePressed;

    // Movement start
    const rotationSpeed = 2;

    let speed = 2;
    // You can't sprint backwards
    if (window.keys["ShiftLeft"] && !window.keys["KeyS"]) {
      speed = 3;
    }

    const moveDistance = speed * delta;

    // Determine rotation direction multiplier
    let rotationMultiplier = 1;
    if (window.keys["KeyS"] && !aimingRef.current) {
      rotationMultiplier = -1; // Reverse rotation when moving backward
    }

    // Rotation
    if (window.keys["KeyA"]) playerRef.current.rotation.y += rotationSpeed * delta * rotationMultiplier;
    if (window.keys["KeyD"]) playerRef.current.rotation.y -= rotationSpeed * delta * rotationMultiplier;

    // Aiming
    const aimKeyPressed = !!window.keys["ControlLeft"];

    // Toggle aiming
    if (aimKeyPressed && !prevAimKeyRef.current) {
      aimingRef.current = !aimingRef.current;
      setAiming(aimingRef.current);
    }
    prevAimKeyRef.current = aimKeyPressed;

    // Can't move forward or backward while aiming
    if (!aimingRef.current) {
      direction.current.set(0, 0, -1);
      if (window.keys["KeyW"]) {
        if (canMove(playerRef.current.position, playerRef.current.rotation, direction.current, moveDistance)) {
          playerRef.current.translateZ(-moveDistance);
        }
      }

      direction.current.set(0, 0, 1);
      if (window.keys["KeyS"]) {
        if (canMove(playerRef.current.position, playerRef.current.rotation, direction.current, moveDistance)) {
          playerRef.current.translateZ(moveDistance);
        }
      }
    }
  });


  return (
    <mesh
      ref={playerRef}
      position={[8, 0.5, 0]}
      rotation={[0, Math.PI / 2, 0]}
      castShadow
    >
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial color="red" />

      <mesh position={[0, 0, -0.6]}>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial color={aiming ? "red" : "yellow"} />
      </mesh>
    </mesh>
  );
};
