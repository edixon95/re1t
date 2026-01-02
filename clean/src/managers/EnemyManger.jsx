import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { shallow } from "zustand/shallow";
import * as THREE from "three";
import { useEnemyStore } from "../stores/useEnemyStores";
import { useInventoryStore } from "../stores/useInventoryStore";
import { LEVEL_TABLE } from "../data/levelTabel";
import { wallMeshes } from "./WallManager";
import { propMeshes } from "./PropManager";
import { createGrid, findPath } from "../helpers/pathfinding";
import { updateSounds, soundEvents } from "../sounds/SoundSystem";

const EMPTY_ARRAY = [];
export const liveEnemyRefs = [];

const PLAYER_CHECK_INTERVAL = 1;
const MAX_LOST_PLAYER_CHECKS = 180;
const PATROL_BUFFER = 0.15;
const ENEMY_SEPARATION = 0.125;
const ENEMY_STOP_DISTANCE = 0.75;
const REPULSION_RADIUS = ENEMY_SEPARATION * 2;

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
    const attackTimersRef = useRef([]); // NEW: for attack delays

    const [grid, setGrid] = useState(null);
    const { takeDamage } = useInventoryStore.getState(); // get damage function

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
            tiles: level.world
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

            // Initialize attack timer if not exist
            if (!attackTimersRef.current[i]) {
                attackTimersRef.current[i] = { delay: 0, attackTimer: 0, attacking: false };
            }
            const timer = attackTimersRef.current[i];

            // -------------------------
            // PATHING & MOVEMENT
            // -------------------------
            const lastUpdate = lastPathUpdateRef.current[i] || 0;
            lastPathUpdateRef.current[i] = lastUpdate + delta;
            const recalcPath = lastPathUpdateRef.current[i] >= PLAYER_CHECK_INTERVAL;
            if (recalcPath) lastPathUpdateRef.current[i] = 0;

            const obstacles = [...wallMeshes, ...propMeshes].map(r => r.current).filter(Boolean);

            // --- Player chase ---
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
                lostPlayerChecksRef.current[i] = (lostPlayerChecksRef.current[i] || 0) + 1;
                if (lostPlayerChecksRef.current[i] >= MAX_LOST_PLAYER_CHECKS) {
                    enemyPathsRef.current[i] = null;
                    lostPlayerChecksRef.current[i] = 0;
                }
            }

            // --- Sound investigation ---
            if (!enemyPathsRef.current[i] || !enemyPathsRef.current[i]?.isPlayerTarget) {
                for (const sound of soundEvents) {
                    if (ref.position.distanceTo(sound.position) <= sound.radius) {
                        const offset = new THREE.Vector3(
                            (Math.random() - 0.5) * ENEMY_SEPARATION * 2,
                            0,
                            (Math.random() - 0.5) * ENEMY_SEPARATION * 2
                        );
                        const targetPos = sound.position.clone().add(offset);
                        const path = findPath(grid, ref.position, targetPos);
                        if (path.length > 0) {
                            enemyPathsRef.current[i] = { path, isSoundTarget: true };
                            enemyTargetIndexRef.current[i] = 0;
                            break;
                        }
                    }
                }
            }

            // --- Patrol ---
            if (!enemyPathsRef.current[i]) {
                const patrolPos = pickPatrolPosition();
                const path = findPath(grid, ref.position, patrolPos);
                if (path.length > 0) {
                    enemyPathsRef.current[i] = { path, isPlayerTarget: false };
                    enemyTargetIndexRef.current[i] = 0;
                }
            }

            // --- Move along path with separation ---
            const path = enemyPathsRef.current[i]?.path;
            const idx = enemyTargetIndexRef.current[i] ?? 0;
            if (path && idx < path.length) {
                const node = path[idx];
                if (node && !isNaN(node.x) && !isNaN(node.z)) {
                    const target = new THREE.Vector3(node.x, ref.position.y, node.z);
                    let dir = target.clone().sub(ref.position);
                    let distance = dir.length();

                    let separation = new THREE.Vector3(0, 0, 0);
                    for (let j = 0; j < liveEnemyRefs.length; j++) {
                        if (i === j) continue;
                        const other = liveEnemyRefs[j];
                        if (!other) continue;
                        const offset = ref.position.clone().sub(other.position);
                        const dist = offset.length();
                        if (dist > 0 && dist < REPULSION_RADIUS) {
                            separation.add(offset.normalize().multiplyScalar((REPULSION_RADIUS - dist) / REPULSION_RADIUS * enemy.speed * 0.5));
                        }
                    }

                    const stopDist = enemyPathsRef.current[i]?.isPlayerTarget ? ENEMY_STOP_DISTANCE : 0;
                    const moveDistance = Math.max(distance - stopDist, 0);

                    if (moveDistance < 0.001) {
                        enemyTargetIndexRef.current[i]++;
                    } else {
                        dir.add(separation);
                        dir.x += (Math.random() - 0.5) * 0.01;
                        dir.z += (Math.random() - 0.5) * 0.01;
                        dir.normalize();
                        ref.position.add(dir.multiplyScalar(Math.min(enemy.speed * delta, moveDistance)));

                        const targetY = Math.atan2(dir.x, dir.z);
                        const deltaY = ((targetY - ref.rotation.y + Math.PI) % (2 * Math.PI)) - Math.PI;
                        ref.rotation.y += deltaY * 0.1;
                    }
                }
            }

            const inAttackRange = distToPlayer - 0.2 <= ENEMY_STOP_DISTANCE;

            if (inAttackRange) {
                // counting attack delay first
                if (!timer.attacking) {
                    timer.delay += delta;

                    if (timer.delay >= enemy.attackDelay) {
                        timer.attacking = true;
                        timer.attackTimer = 0;
                    }
                } else {
                    timer.attackTimer += delta;;

                    if (timer.attackTimer >= enemy.attackWait) {
                        takeDamage(enemy.attackDamage);
                        timer.attackTimer = 0;
                    }
                }
            } else {
                timer.delay = Math.min(timer.delay, enemy.attackDelay);
                timer.attackTimer = 0;
                timer.attacking = false;
            }



        });
    });

    if (!level || enemies.length === 0) return null;

    liveEnemyRefs.length = enemies.length;
    enemyPathsRef.current.length = enemies.length;
    enemyTargetIndexRef.current.length = enemies.length;
    lastPathUpdateRef.current.length = enemies.length;
    lostPlayerChecksRef.current.length = enemies.length;
    attackTimersRef.current.length = enemies.length;

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
