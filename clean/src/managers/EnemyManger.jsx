import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { shallow } from "zustand/shallow";
import * as THREE from "three";
import { useEnemyStore } from "../stores/useEnemyStores";
import { LEVEL_TABLE } from "../data/levelTabel";
import { canMove } from "../helpers/canMove";
import { wallMeshes } from "./WallManager";
import { propMeshes } from "./PropManager";

const EMPTY_ARRAY = [];
export const liveEnemyRefs = [];

// 🔧 CONFIG
const ROTATION_PAUSE = 0.5; // seconds pause after picking a new patrol target
const PLAYER_CHECK_INTERVAL = 2; // seconds to move toward last seen player

export const EnemyManager = ({ gameState, player }) => {
    const enemies =
        useEnemyStore(
            (state) => state.enemiesByLevel[gameState.level],
            shallow
        ) ?? EMPTY_ARRAY;

    const level = LEVEL_TABLE[gameState.level];
    const enemyTargetsRef = useRef([]);
    const pauseTimersRef = useRef([]);
    const playerTargetTimersRef = useRef([]);

    // --- Helper: pick a valid patrol position inside floor
    const pickPatrolPosition = (floor) => {
        const [fx, fy, fz] = floor.position;
        const [fw, fd] = floor.size;

        return [
            fx - fw / 2 + Math.random() * fw,
            fy + 0.5,
            fz - fd / 2 + Math.random() * fd,
        ];
    };

    useFrame((_, delta) => {
        if (!level || enemies.length === 0) return;
        if (!player?.current) return;

        const floor = level.world[0];
        if (!floor) return;

        const playerPos = new THREE.Vector3();
        player.current.getWorldPosition(playerPos);

        enemies.forEach((enemy, i) => {
            const ref = liveEnemyRefs[i];
            if (!ref || !enemy.isAlive) return;

            let chasingPlayer = false;

            // --- PLAYER DETECTION ---
            if (!enemyTargetsRef.current[i]?.isPlayerTarget) {
                const forwardToPlayer = playerPos.clone().sub(ref.position).normalize();
                const distanceToPlayer = playerPos.clone().sub(ref.position).length();

                // Combine walls and props for line-of-sight
                const obstacles = [...wallMeshes, ...propMeshes]
                    .map((ref) => ref.current)
                    .filter(Boolean);

                const raycaster = new THREE.Raycaster(ref.position.clone(), forwardToPlayer, 0, distanceToPlayer);
                const hits = raycaster.intersectObjects(obstacles.concat(player.current), false);

                // If the first hit is the player, enemy can see
                if (hits.length > 0 && hits[0].object === player.current) {
                    enemyTargetsRef.current[i] = {
                        pos: [playerPos.x, ref.position.y, playerPos.z],
                        isPlayerTarget: true,
                    };
                    playerTargetTimersRef.current[i] = PLAYER_CHECK_INTERVAL;
                    chasingPlayer = true;
                    console.log(`Enemy ${enemy.id} sees player!`);
                }
            }

            // --- UPDATE PLAYER TARGET ---
            if (enemyTargetsRef.current[i]?.isPlayerTarget) {
                chasingPlayer = true;

                // Continuously update target toward player
                enemyTargetsRef.current[i].pos = [playerPos.x, ref.position.y, playerPos.z];

                if (playerTargetTimersRef.current[i] > 0) {
                    playerTargetTimersRef.current[i] -= delta;
                } else {
                    // Lost player → resume patrol
                    enemyTargetsRef.current[i] = null;
                    playerTargetTimersRef.current[i] = 0;
                    console.log(`Enemy ${enemy.id} lost player, resuming patrol`);
                }
            }

            // --- PATROLLING ---
            if (!enemyTargetsRef.current[i]) {
                const patrolPos = pickPatrolPosition(floor);
                enemyTargetsRef.current[i] = {
                    pos: patrolPos,
                    isPlayerTarget: false,
                };
                pauseTimersRef.current[i] = ROTATION_PAUSE;
                console.log(`Enemy ${enemy.id} picks new patrol target`);
            }

            const target = enemyTargetsRef.current[i].pos;
            const dx = target[0] - ref.position.x;
            const dz = target[2] - ref.position.z;
            const distance = Math.hypot(dx, dz);

            if (distance < 0.2) {
                enemyTargetsRef.current[i] = null;
                pauseTimersRef.current[i] = undefined;
                console.log(`Enemy ${enemy.id} reached target`);
                return;
            }

            // 🔥 SNAP ROTATION (visual only)
            ref.rotation.y = Math.atan2(dx, dz);

            // Countdown pause timer (only for patrol)
            if (!enemyTargetsRef.current[i]?.isPlayerTarget && pauseTimersRef.current[i] > 0) {
                pauseTimersRef.current[i] -= delta;
                return;
            }

            // --- MOVE TOWARD TARGET (world-space direction) ---
            const moveDistance = Math.min(enemy.speed * delta, distance);
            const direction = new THREE.Vector3(target[0], ref.position.y, target[2])
                .sub(ref.position)
                .normalize();

            if (canMove(ref.position, ref.rotation, direction, moveDistance)) {
                ref.position.add(direction.multiplyScalar(moveDistance));
            } else if (!enemyTargetsRef.current[i]?.isPlayerTarget) {
                enemyTargetsRef.current[i] = null;
                pauseTimersRef.current[i] = ROTATION_PAUSE;
                console.log(`Enemy ${enemy.id} blocked, picking new patrol target`);
            }

            if (chasingPlayer) {
                console.log(`Enemy ${enemy.id} moving toward player`);
            } else {
                console.log(`Enemy ${enemy.id} patrolling`);
            }
        });
    });

    if (!level || enemies.length === 0) return null;

    liveEnemyRefs.length = enemies.length;
    enemyTargetsRef.current.length = enemies.length;
    pauseTimersRef.current.length = enemies.length;
    playerTargetTimersRef.current.length = enemies.length;

    return (
        <>
            {enemies.map((enemy, index) =>
                enemy.isAlive ? (
                    <mesh
                        key={enemy.id}
                        ref={(ref) => (liveEnemyRefs[index] = ref)}
                        position={enemy.position}
                        userData={{ enemyId: enemy.id }}
                        castShadow
                    >
                        <boxGeometry args={[0.5, 1, 0.5]} />
                        <meshStandardMaterial color="cyan" />
                    </mesh>
                ) : null
            )}
        </>
    );
};
