import { AMMO_TABLE } from "../data/ammoTable";
import { COMBINE_TABLE } from "../data/combineTable";
import { useInventoryStore } from "../stores/useInventoryStore";

export const getValidCombineTargets = (item) => {
    return Object.keys(COMBINE_TABLE[item] || {});
};

export const resolveCombine = (itemA, itemB, indexA, indexB) => {
    const entry = COMBINE_TABLE[itemA]?.[itemB];
    if (!entry) return false;

    const inventoryState = useInventoryStore.getState();
    const { inventory } = inventoryState

    switch (entry.type) {
        case "RELOAD": {
            const weaponName = entry.weapon ?? itemA;

            const ammoType = AMMO_TABLE[weaponName];
            if (!ammoType) return false;

            let ammoIndex;
            if (inventory[indexA]?.item === ammoType.item) ammoIndex = indexA;
            else if (inventory[indexB]?.item === ammoType.item) ammoIndex = indexB;
            else return false;

            return inventoryState.tryReloadWeapon(weaponName, ammoIndex);
        }


        case "CRAFT": {
            return inventoryState.craftItemsByIndex(indexA, indexB, entry.result);
        }

        default:
            return false;
    }
};

