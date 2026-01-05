import * as THREE from "three";
import { itemMeshes } from "../managers/ItemManager";
import { triggerUIText } from "../UI/InformationalUI";
import { useItemStore } from "../stores/useItemStore";
import { useInventoryStore } from "../stores/useInventoryStore";
import { menuOpenRef } from "./Player";
import { otherMeshes } from "../managers/OtherInteractManager";
import { handleUnlockDoor } from "../data/doorTable";
import { getButton, handlMarkButtonUsed } from "../data/levelTabel";

const interactionRaycaster = new THREE.Raycaster();
const interactionDirection = new THREE.Vector3();

export const tryInteract = (player, level, canOpenMenu) => {
    if (!player) return;

    const origin = player.position.clone();
    const CONE_ANGLE = (2 * Math.PI) / 3;
    const INTERACT_DISTANCE = 1;
    const DOOR_INTERACT_DISTANCE = 0.75
    const PICKUP_RADIUS = 0.5;

    const doorDirection = new THREE.Vector3(0, 0, -1)
        .applyEuler(player.rotation)
        .normalize();

    const rayStart = origin.clone().add(doorDirection.clone().multiplyScalar(-0.1)); // <- behind by 0.1
    const rayDistance = DOOR_INTERACT_DISTANCE + 0.1; // extend a little to cover the extra start distance

    interactionRaycaster.set(rayStart, doorDirection);
    interactionRaycaster.far = rayDistance;

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
                return;
            }
        }
    }

    const meshes = [...itemMeshes, ...otherMeshes]
        .map(ref => ref.current)
        .filter(Boolean);
    let hitItem = null;
    let nearestDistance = Infinity;

    const steps = 11;
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

    // Fallback: check proximity sphere for pickup
    if (!hitItem) {
        const playerFeet = origin.clone();
        playerFeet.y -= 0.5;
        const sphere = new THREE.Sphere(playerFeet, PICKUP_RADIUS);

        for (const mesh of meshes) {
            const box = new THREE.Box3().setFromObject(mesh);
            if (box.intersectsSphere(sphere)) {
                hitItem = mesh;
                break;
            }
        }
    }

    if (!hitItem) return;
    // Handle item pickup
    if (hitItem.userData.type === "item") {
        const itemStore = useItemStore.getState();
        const inventoryStore = useInventoryStore.getState();

        const item = itemStore.itemTable[level]?.find(x => x.id === hitItem.userData.id);
        if (!item) return;

        if (inventoryStore.tryAddInventory(hitItem.userData)) {
            itemStore.pickUpItem(hitItem.userData.id);
            triggerUIText(`You picked up ${hitItem.userData.item}`);

            hitItem.parent.remove(hitItem);

            const refIndex = itemMeshes.findIndex(ref => ref.current === hitItem);
            if (refIndex !== -1) itemMeshes[refIndex].current = null;
        }
    }

    // Custom items go here
    if (hitItem.userData.type === "saveStation") {
        if (canOpenMenu) {
            menuOpenRef.current = "mainMenuSave";
        } else {
            console.log("too soon")
        }
    } else if (hitItem.userData.type === "puzzleStation") {
        const puzzle = {
            isPuzzle: true,
            id: hitItem.userData.puzzle.puzzleId,
            part: hitItem.userData.puzzle.part
        }
        window.dispatchEvent(
            new CustomEvent("door:enter", {
                detail: puzzle,
            })
        );
    } else if (hitItem.userData.type === "buttonStation") {
        const current = getButton(hitItem.userData.button.level, hitItem.userData.button.target);
        if (current.isUsed) {
            triggerUIText("You don't need to use this again")
            return
        }
        handlMarkButtonUsed(current.level, current.target);
        handleUnlockDoor(current.target)
        triggerUIText("You hear a click")
    };

};
