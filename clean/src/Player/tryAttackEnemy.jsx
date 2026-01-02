import * as THREE from "three";
import { liveEnemyRefs } from "../managers/EnemyManger";

const raycaster = new THREE.Raycaster();
const directionVector = new THREE.Vector3();

export const tryAttackEnemy = (player, weaponInfo) => {
    if (!player || !weaponInfo) return false;
    const validEnemies = liveEnemyRefs.filter(ref => ref);
    if (validEnemies.length === 0) return false;

    const origin = player.position.clone();

    // TODO: FOR TESTING
    const radiusAngles = {
        75: (5 * Math.PI) / 12,
        90: Math.PI / 2,
        120: (2 * Math.PI) / 3
    }
    const CONE_ANGLE = radiusAngles[120]
    const INTERACT_DISTANCE = weaponInfo.range;

    let nearestEnemy = null;
    let nearestDistance = Infinity;

    const steps = 5;

    for (let i = -Math.floor(steps / 2); i <= Math.floor(steps / 2); i++) {
        const angleOffset = (i / steps) * CONE_ANGLE;

        directionVector.set(0, 0, -1)
            .applyEuler(player.rotation)
            .normalize();

        directionVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), angleOffset);

        raycaster.set(origin, directionVector.clone().normalize());
        raycaster.far = INTERACT_DISTANCE;

        const hits = raycaster.intersectObjects(validEnemies, false);
        if (hits.length > 0 && hits[0].distance < nearestDistance) {
            nearestDistance = hits[0].distance;
            nearestEnemy = hits[0].object;
        }
    }

    return nearestEnemy || false;
};
