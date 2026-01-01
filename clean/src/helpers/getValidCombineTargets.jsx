import { COMBINE_TABLE } from "../data/combineTable";
import { useInventoryStore } from "../stores/useInventoryStore";

export const getValidCombineTargets = (item) => {
    return Object.keys(COMBINE_TABLE[item] || {});
};

export const resolveCombine = (itemA, itemB, indexA, indexB) => {
    const entry = COMBINE_TABLE[itemA]?.[itemB];
    if (!entry) return false;

    const inventoryState = useInventoryStore.getState();

    switch (entry.type) {
        case "RELOAD": {
            const weaponName = entry.weapon ?? itemA;
            return inventoryState.tryReloadWeapon(weaponName);
        }

        case "CRAFT": {
            return inventoryState.craftItemsByIndex(indexA, indexB, entry.result);
        }

        default:
            return false;
    }
};

