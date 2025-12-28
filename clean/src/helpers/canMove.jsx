import * as THREE from "three";
import { wallMeshes } from "../managers/WallManager";
import { propMeshes } from "../managers/PropManager";

export const canMove = (playerPos, playerRot, forwardVec, distance = 0.5, buffer = 0.5) => {
    const origin = playerPos.clone();
    const direction = forwardVec.clone().applyEuler(playerRot).normalize();

    const raycaster = new THREE.Raycaster(origin, direction, 0, distance + buffer);

    const meshes = [...wallMeshes, ...propMeshes].map(ref => ref.current).filter(Boolean);
    const hits = raycaster.intersectObjects(meshes, false);

    if (hits.length === 0) return true;

    // distance to nearest wall
    const nearestDistance = hits[0].distance;

    return nearestDistance > buffer;
};
