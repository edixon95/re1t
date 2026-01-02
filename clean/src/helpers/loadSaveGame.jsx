import { getDoorsForSave, applyDoorsFromSave } from "../data/doorTable"
import { useEnemyStore } from "../stores/useEnemyStores"
import { useInventoryStore } from "../stores/useInventoryStore"
import { useItemStore } from "../stores/useItemStore"

export const loadPlayerTransform = (playerRef, playerSave) => {
    if (!playerRef?.current || !playerSave) return;

    const [px, py, pz] = playerSave.position;
    const [rx, ry, rz] = playerSave.rotation;

    playerRef.current.position.set(px, py, pz);
    playerRef.current.rotation.set(rx, ry, rz);
    playerRef.current.level = playerSave.level;
};


export const loadPlayerGame = (slot, playerRef) => {
    const raw = localStorage.getItem(`save_${slot}`);
    if (!raw) return false;

    const saveData = JSON.parse(raw);

    applyDoorsFromSave(saveData.doors);

    useItemStore.getState().loadItemsFromSave(saveData.items);
    useEnemyStore.getState().loadEnemiesFromSave(saveData.enemies);
    useInventoryStore.getState().loadInventoryFromSave(saveData.inventory);

    loadPlayerTransform(playerRef, saveData.player);

    return true;
};


export const savePlayerGame = (playerRef, slot) => {
    const { getItemsForSave } = useItemStore.getState();
    const { getEnemiesForSave } = useEnemyStore.getState();

    const doors = getDoorsForSave();
    const items = getItemsForSave();
    const enemies = getEnemiesForSave();

    const playerPosition = playerRef
        ? [playerRef.position.x, playerRef.position.y, playerRef.position.z]
        : null;
    const playerRotation = playerRef ? [playerRef.rotation.x, playerRef.rotation.y, playerRef.rotation.z]
        : null;

    const saveData = {
        player: {
            position: playerPosition,
            rotation: playerRotation,
            level: playerRef.level
        },
        inventory: useInventoryStore.getState().getInventoryForSave(),
        doors,
        items,
        enemies
    };

    console.log("SAVE DATA:", saveData);
};
