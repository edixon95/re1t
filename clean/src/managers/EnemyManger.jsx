import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { shallow } from "zustand/shallow";
import * as THREE from "three";
import { useEnemyStore } from "../stores/useEnemyStores";
import { LEVEL_TABLE } from "../data/levelTabel";
import { wallMeshes } from "./WallManager";
import { propMeshes } from "./PropManager";
import { createGrid, findPath } from "../helpers/pathfinding";
import { updateSounds, soundEvents } from "../sounds/SoundSystem";

const EMPTY_ARRAY = [];
export const liveEnemyRefs = [];

const PLAYER_CHECK_INTERVAL = 1;
const MAX_LOST_PLAYER_CHECKS = 3;
const PATROL_BUFFER = 0.15;

export const EnemyManager = ({ gameState, player }) => {
    const enemies = useEnemyStore(
        (state) => state.enemiesByLevel[gameState.level],
        shallow
    ) ?? EMPTY_ARRAY;

    const level = LEVEL_TABLE[gameState.level];

    const enemyPathsRef = useRef([]);
    const enemyTargetIndexRef = useRef([]);
    const lastPathUpdateRef = useRef([]);
    const lostPlayerChecksRef = useRef([]);

    const [grid, setGrid] = useState(null);

    const pickPatrolPosition = () => {
        if (!level || !level.world.length) return new THREE.Vector3(0, 0.5, 0);
        const floor = level.world[Math.floor(Math.random() * level.world.length)];
        const [fx, fy, fz] = floor.position;
        const [fw, fd] = floor.size;
        return new THREE.Vector3(
            fx - fw / 2 + Math.random() * fw,
            fy + 0.5,
            fz - fd / 2 + Math.random() * fd
        );
    };

    // Build grid for pathfinding
    useEffect(() => {
        if (!level) return;
        const obstacles = [...wallMeshes, ...propMeshes].map(r => r.current).filter(Boolean);
        if (!level.world.length) return;

        let minX = Infinity, minZ = Infinity, maxX = -Infinity, maxZ = -Infinity, y = 0;
        level.world.forEach(f => {
            const [fx, fy, fz] = f.position;
            const [fw, fd] = f.size;
            y = fy;
            minX = Math.min(minX, fx - fw / 2);
            maxX = Math.max(maxX, fx + fw / 2);
            minZ = Math.min(minZ, fz - fd / 2);
            maxZ = Math.max(maxZ, fz + fd / 2);
        });

        const combinedFloor = {
            position: [(minX + maxX) / 2, y, (minZ + maxZ) / 2],
            size: [maxX - minX, maxZ - minZ],
            tiles: level.world // needed for patrol checks
        };

        const g = createGrid(combinedFloor, obstacles, 0.2, PATROL_BUFFER);
        if (g) setGrid(g);
    }, [level]);

    useFrame((_, delta) => {
        updateSounds(delta);
        if (!level || enemies.length === 0 || !player?.current || !grid?.grid) return;

        const playerPos = new THREE.Vector3();
        player.current.getWorldPosition(playerPos);

        enemies.forEach((enemy, i) => {
            const ref = liveEnemyRefs[i];
            if (!ref || !enemy.isAlive) return;

            // Path recalculation timing
            const lastUpdate = lastPathUpdateRef.current[i] || 0;
            lastPathUpdateRef.current[i] = lastUpdate + delta;
            const recalcPath = lastPathUpdateRef.current[i] >= PLAYER_CHECK_INTERVAL;
            if (recalcPath) lastPathUpdateRef.current[i] = 0;

            const obstacles = [...wallMeshes, ...propMeshes].map(r => r.current).filter(Boolean);

            // -------------------------
            // PRIORITY 1: PLAYER CHASE
            // -------------------------
            const dirToPlayer = playerPos.clone().sub(ref.position).normalize();
            const distToPlayer = playerPos.clone().sub(ref.position).length();
            const ray = new THREE.Raycaster(ref.position.clone(), dirToPlayer, 0, distToPlayer);
            const hits = ray.intersectObjects(obstacles.concat(player.current), false);
            const canSeePlayer = hits.length > 0 && hits[0].object === player.current;

            if (canSeePlayer) {
                lostPlayerChecksRef.current[i] = 0;
                if (!enemyPathsRef.current[i]?.isPlayerTarget || recalcPath) {
                    const path = findPath(grid, ref.position, playerPos);
                    if (path.length > 0) {
                        enemyPathsRef.current[i] = { path, isPlayerTarget: true };
                        enemyTargetIndexRef.current[i] = 0;
                    }
                }
            } else if (enemyPathsRef.current[i]?.isPlayerTarget) {
                // Increment lost player checks
                lostPlayerChecksRef.current[i] = (lostPlayerChecksRef.current[i] || 0) + 1;
                if (lostPlayerChecksRef.current[i] >= MAX_LOST_PLAYER_CHECKS) {
                    enemyPathsRef.current[i] = null; // lost player
                    lostPlayerChecksRef.current[i] = 0;
                }
            }

            // -------------------------
            // PRIORITY 2: SOUND INVESTIGATION
            // -------------------------
            if (!enemyPathsRef.current[i] || !enemyPathsRef.current[i]?.isPlayerTarget) {
                for (const sound of soundEvents) {
                    if (ref.position.distanceTo(sound.position) <= sound.radius) {
                        const path = findPath(grid, ref.position, sound.position);
                        if (path.length > 0) {
                            enemyPathsRef.current[i] = { path, isSoundTarget: true };
                            enemyTargetIndexRef.current[i] = 0;
                            break;
                        }
                    }
                }
            }

            // -------------------------
            // PRIORITY 3: PATROL
            // -------------------------
            if (!enemyPathsRef.current[i]) {
                const patrolPos = pickPatrolPosition();
                const path = findPath(grid, ref.position, patrolPos);
                if (path.length > 0) {
                    enemyPathsRef.current[i] = { path, isPlayerTarget: false };
                    enemyTargetIndexRef.current[i] = 0;
                }
            }

            // -------------------------
            // MOVE ALONG PATH
            // -------------------------
            const path = enemyPathsRef.current[i]?.path;
            const idx = enemyTargetIndexRef.current[i] ?? 0;
            if (!path || idx >= path.length) return;

            const node = path[idx];
            if (!node || isNaN(node.x) || isNaN(node.z)) return;

            const target = new THREE.Vector3(node.x, ref.position.y, node.z);
            const dir = target.clone().sub(ref.position);
            const distance = dir.length();

            if (distance < 0.1) enemyTargetIndexRef.current[i]++;
            else {
                dir.normalize();
                ref.position.add(dir.multiplyScalar(Math.min(enemy.speed * delta, distance)));

                const targetY = Math.atan2(dir.x, dir.z);
                const deltaY = ((targetY - ref.rotation.y + Math.PI) % (2 * Math.PI)) - Math.PI;
                ref.rotation.y += deltaY * 0.1;
            }
        });
    });

    if (!level || enemies.length === 0) return null;

    liveEnemyRefs.length = enemies.length;
    enemyPathsRef.current.length = enemies.length;
    enemyTargetIndexRef.current.length = enemies.length;
    lastPathUpdateRef.current.length = enemies.length;
    lostPlayerChecksRef.current.length = enemies.length;

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
