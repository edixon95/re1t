import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

import { canMove } from "../helpers/canMove";
import { tryInteract } from "./tryInteract";
import { useInventoryStore } from "../stores/useInventoryStore";
import { tryAttackEnemy } from "./tryAttackEnemy";
import { useEnemyStore } from "../stores/useEnemyStores";
import { emitSound } from "../sounds/SoundSystem";

export const menuOpenRef = { current: "mainMenu", lastClosed: 0, coolDown: 0.5 };
export const isTransition = { current: false };

export const Player = ({ playerRef, level, isVisible }) => {
  const aimingRef = useRef(false);
  const prevAimKeyRef = useRef(false);
  const prevSpaceKeyRef = useRef(false);
  const prevTabKeyRef = useRef(false);

  const nextShootTimeRef = useRef(0);

  const muzzleLightRef = useRef(null);
  const muzzleTimeoutRef = useRef(null);

  const moveSoundTimerRef = useRef(0);

  const WALK_SOUND_DELAY = 0.5;
  const WALK_SOUND_LEVEL = 2;
  const RUN_SOUND_LEVEL = 4;


  const [aiming, setAiming] = useState(false);

  const tryGetWeaponInformation = useInventoryStore(
    (state) => state.tryGetWeaponInformation
  );
  const equippedItem = useInventoryStore((state) => state.equippedItem);
  const consumeAmmo = useInventoryStore((state) => state.consumeAmmo);

  const damageEnemy = useEnemyStore((state) => state.damageEnemy);

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

  const triggerMuzzleFlash = () => {
    if (!muzzleLightRef.current) return;

    muzzleLightRef.current.intensity = 5;

    if (muzzleTimeoutRef.current) {
      clearTimeout(muzzleTimeoutRef.current);
    }

    muzzleTimeoutRef.current = setTimeout(() => {
      if (muzzleLightRef.current) {
        muzzleLightRef.current.intensity = 0;
      }
    }, 50);
  };

  useFrame((state, delta) => {
    if (!playerRef?.current) return;
    if (isTransition.current) return;

    const currentTime = performance.now() / 1000;

    if (
      menuOpenRef.previous !== false &&
      menuOpenRef.current === false
    ) {
      menuOpenRef.lastClosed = currentTime;
    }

    menuOpenRef.previous = menuOpenRef.current;

    const interactionAllowed =
      menuOpenRef.current === false &&
      currentTime - menuOpenRef.lastClosed >= menuOpenRef.coolDown;

    const tabPressed = !!window.keys["KeyE"];

    if (tabPressed && !prevTabKeyRef.current) {
      if (menuOpenRef.current === false) {
        if (interactionAllowed) {
          menuOpenRef.current = "ingameMenu";
        } else {
          console.log("Menu cooldown active");
        }
      } else {
        menuOpenRef.current = false;
      }
    }

    prevTabKeyRef.current = tabPressed;

    if (menuOpenRef.current !== false) return;

    // SPACE ACTION
    const spacePressed = !!window.keys["Space"];

    if (aimingRef.current) {
      if (spacePressed) {
        const weaponInfo = tryGetWeaponInformation(equippedItem.equipped);

        if (currentTime >= nextShootTimeRef.current) {
          const isKnife = weaponInfo.name === "Knife";
          const canShoot = isKnife || equippedItem.cAmmo > 0;

          if (canShoot) {
            nextShootTimeRef.current = currentTime + weaponInfo.delay;

            if (!isKnife) {
              consumeAmmo();
              triggerMuzzleFlash();
              emitSound(playerRef.current.position, weaponInfo.soundLevel);
            }

            const tEnemy = tryAttackEnemy(playerRef.current, weaponInfo);
            if (tEnemy) {
              damageEnemy(level, tEnemy.userData.enemyId, weaponInfo.damage);
            }
          }
        }
      }
    } else {
      if (spacePressed && !prevSpaceKeyRef.current) {
        tryInteract(playerRef.current, level, interactionAllowed);
      }
    }

    prevSpaceKeyRef.current = spacePressed;

    // MOVEMENT
    const rotationSpeed = 2;
    let speed = 2;

    if (window.keys["ShiftLeft"] && !window.keys["KeyS"]) {
      speed = 3;
    }

    const moveDistance = speed * delta;

    let rotationMultiplier = 1;
    if (window.keys["KeyS"] && !aimingRef.current) {
      rotationMultiplier = -1;
    }

    if (window.keys["KeyA"]) {
      playerRef.current.rotation.y +=
        rotationSpeed * delta * rotationMultiplier;
    }

    if (window.keys["KeyD"]) {
      playerRef.current.rotation.y -=
        rotationSpeed * delta * rotationMultiplier;
    }

    // AIM TOGGLE
    const aimKeyPressed = !!window.keys["KeyQ"];

    if (aimKeyPressed && !prevAimKeyRef.current) {
      aimingRef.current = !aimingRef.current;
      setAiming(aimingRef.current);
    }

    prevAimKeyRef.current = aimKeyPressed;

    // MOVEMENT (NO MOVE WHILE AIMING)
    let isMoving = false;

    if (!aimingRef.current) {
      if (window.keys["KeyW"] || window.keys["KeyS"]) {
        isMoving = true;
      }
    }

    if (isMoving) {
      moveSoundTimerRef.current += delta;

      if (moveSoundTimerRef.current >= WALK_SOUND_DELAY) {
        const isRunning = window.keys["ShiftLeft"];
        emitSound(
          playerRef.current.position,
          isRunning ? RUN_SOUND_LEVEL : WALK_SOUND_LEVEL,
          0.15
        );
        moveSoundTimerRef.current = 0;
      }
    } else {
      moveSoundTimerRef.current = 0;
    }




    if (!aimingRef.current) {
      direction.current.set(0, 0, -1);
      if (window.keys["KeyW"]) {
        if (
          canMove(
            playerRef.current.position,
            playerRef.current.rotation,
            direction.current,
            moveDistance
          )
        ) {
          playerRef.current.translateZ(-moveDistance);
        }
      }

      direction.current.set(0, 0, 1);
      if (window.keys["KeyS"]) {
        if (
          canMove(
            playerRef.current.position,
            playerRef.current.rotation,
            direction.current,
            moveDistance
          )
        ) {
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
      visible={isVisible}
    >
      <boxGeometry args={[0.5, 1, 0.5]} />
      <meshStandardMaterial color="red" />

      {/* Aim Indicator */}
      <mesh position={[0, 0, -0.6]}>
        <boxGeometry args={[0.15, 0.15, 0.15]} />
        <meshStandardMaterial
          color={aiming ? "red" : "yellow"}
        />
      </mesh>

      {/* Muzzle Flash Light */}
      <pointLight
        ref={muzzleLightRef}
        position={[0, 0, -0.8]}
        intensity={0}
        distance={3}
        color="orange"
      />
    </mesh>
  );
};
