import * as THREE from "three";
import { wallMeshes } from "../managers/WallManager";
import { propMeshes } from "../managers/PropManager";
import { liveEnemyRefs } from "../managers/EnemyManger";
import { doorMeshes } from "../managers/DoorManager";


export const canMove = (playerPos, playerRot, forwardVec, distance = 0.5, buffer = 0.5) => {
    const origin = playerPos.clone();
    const direction = forwardVec.clone().applyEuler(playerRot).normalize();

    const raycaster = new THREE.Raycaster(origin, direction, 0, distance + buffer);
    const meshes = [
        ...wallMeshes.map(r => r.current).filter(Boolean),
        ...propMeshes.map(r => r.current).filter(Boolean),
        ...doorMeshes.map(r => r.current).filter(Boolean),
        ...liveEnemyRefs.filter(Boolean),
    ];
    const hits = raycaster.intersectObjects(meshes, false);

    if (hits.length === 0) return true;

    const nearestDistance = hits[0].distance;

    return nearestDistance > buffer;
};
