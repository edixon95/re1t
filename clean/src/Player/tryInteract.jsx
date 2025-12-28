import * as THREE from "three";
import { itemMeshes } from "../managers/ItemManager";
import { tryAddInventory } from "./Inventory";
import { triggerPickupText } from "../UI/InformationalUI";

const interactionRaycaster = new THREE.Raycaster();
const interactionDirection = new THREE.Vector3();

export const tryInteract = (player) => {
    if (!player) return;

    const origin = player.position.clone();
    const CONE_ANGLE = Math.PI / 4;
    const INTERACT_DISTANCE = 0.75;
    const PICKUP_RADIUS = 0.25; // radius for items under

    // ---- 1️⃣ DOOR CHECK FIRST ----
    const doorDirection = new THREE.Vector3(0, 0, -1)
        .applyEuler(player.rotation)
        .normalize();

    interactionRaycaster.set(origin, doorDirection);
    interactionRaycaster.far = 1.2; // slightly longer than player reach

    // Raycast against all children in scene
    const scene = player.parent;
    if (scene) {
        const doorHits = interactionRaycaster.intersectObjects(scene.children, true);
        for (const hit of doorHits) {
            if (hit.object.userData?.type === "door") {
                window.dispatchEvent(
                    new CustomEvent("door:enter", {
                        detail: hit.object.userData.door,
                    })
                );
                return; // stop here, door interaction wins
            }
        }
    }

    // ---- 2️⃣ ITEM CHECK ----
    const meshes = itemMeshes.map(ref => ref.current).filter(Boolean);
    // remove early return so doors aren't blocked
    let hitItem = null;
    let nearestDistance = Infinity;

    const steps = 5;
    for (let i = -Math.floor(steps / 2); i <= Math.floor(steps / 2); i++) {
        const angleOffset = (i / steps) * CONE_ANGLE;

        interactionDirection.set(0, 0, -1)
            .applyEuler(player.rotation)
            .normalize();

        interactionDirection.y = Math.tan(angleOffset);

        interactionRaycaster.set(origin, interactionDirection.clone().normalize());
        interactionRaycaster.far = INTERACT_DISTANCE;

        const hits = interactionRaycaster.intersectObjects(meshes, false);
        if (hits.length > 0 && hits[0].distance < nearestDistance) {
            nearestDistance = hits[0].distance;
            hitItem = hits[0].object;
        }
    }

    if (!hitItem) {
        const playerFeet = origin.clone();
        playerFeet.y -= 0.5;
        const sphere = new THREE.Sphere(playerFeet, PICKUP_RADIUS);

        for (const itemRef of meshes) {
            const box = new THREE.Box3().setFromObject(itemRef);
            if (box.intersectsSphere(sphere)) {
                hitItem = itemRef;
                break;
            }
        }
    }

    if (!hitItem) {
        console.log("Nothing to interact with");
        return;
    }

    if (hitItem.userData.type === "item") {
        if (!!tryAddInventory(hitItem.userData)) {
            triggerPickupText(hitItem.userData);
            hitItem.parent.remove(hitItem);

            const refIndex = itemMeshes.findIndex(ref => ref.current === hitItem);
            if (refIndex !== -1) itemMeshes[refIndex].current = null;
        }
    }
};
