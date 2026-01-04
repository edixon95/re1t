import { getDoorsForSave, applyDoorsFromSave } from "../data/doorTable"
import { useEnemyStore } from "../stores/useEnemyStores"
import { useInventoryStore } from "../stores/useInventoryStore"
import { useItemStore } from "../stores/useItemStore"


export const loadPlayerGame = (slot, setGameState) => {
    const raw = localStorage.getItem(`save_${slot}`);
    if (!raw) return false;

    const saveData = JSON.parse(raw);

    applyDoorsFromSave(saveData.doors);
    useItemStore.getState().loadItemsFromSave(saveData.items);
    useEnemyStore.getState().loadEnemiesFromSave(saveData.enemies);
    useInventoryStore.getState().loadInventoryFromSave(saveData.inventory);


    if (saveData?.player?.level) {
        setGameState((prev) => ({
            ...prev,
            level: saveData.player.level,
            mode: "game"
        }))
        return saveData.player
    }
    return false;
};


export const savePlayerGame = (slot, playerRef) => {
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
    localStorage.setItem(`save_${slot}`, JSON.stringify(saveData));
};
