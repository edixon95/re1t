import { create } from "zustand";
import { DOOR_TABLE } from "../data/doorTable";
import { interactionAttempt, interactionSuccess } from "../UI/InformationalUI";
import { AMMO_TABLE } from "../data/ammoTable";

export const useInventoryStore = create((set, get) => ({
    inventory: Array(12).fill(null),

    // Add item
    tryAddInventory: (item) => {
        const { inventory } = get();

        if (item.stackable) {
            const idx = inventory.findIndex((x) => x && x.item === item.item);
            if (idx !== -1) {
                const newInventory = [...inventory];
                newInventory[idx] = { ...newInventory[idx], amount: newInventory[idx].amount + item.amount };
                set({ inventory: newInventory });
                return item.item;
            }
        }

        for (let i = 0; i < inventory.length; i++) {
            if (inventory[i] === null) {
                const newInventory = [...inventory];
                newInventory[i] = item;
                set({ inventory: newInventory });
                return item.item;
            }
        }

        return false;
    },

    // Remove ammo/weapon from inventory
    tryReloadWeapon: (weaponName) => {
        const { inventory } = get();
        const weaponIdx = inventory.findIndex(x => x?.item === weaponName);
        if (weaponIdx === -1) return false;
        const ammoType = AMMO_TABLE[weaponName];
        if (!ammoType) return false;
        const ammoIdx = inventory.findIndex(x => x?.item === ammoType.item);
        if (ammoIdx === -1) return false;
        const newInventory = [...inventory];
        // Update weapon ammo
        const weaponSlot = { ...newInventory[weaponIdx] };
        weaponSlot.cAmmo = ammoType.maxAmmo;
        weaponSlot.mAmmo = ammoType.maxAmmo;
        newInventory[weaponIdx] = weaponSlot;
        // Consume ammo
        const ammoSlot = { ...newInventory[ammoIdx] };
        if (ammoSlot.stackable && ammoSlot.amount > 1) {
            ammoSlot.amount -= 1;
            newInventory[ammoIdx] = ammoSlot;
        } else {
            newInventory[ammoIdx] = null;
        }
        set({ inventory: newInventory });

        return true;
    },

    tryUseInventoryItemDoor: (requestedItem, isAnonymous, isSingleUse, usedOnDoorId) => {
        const { inventory } = get();
        const idx = inventory.findIndex((x) => x && x.item === requestedItem);
        if (idx === -1) {
            interactionAttempt(isAnonymous, requestedItem);
            return false;
        }

        let result = null;
        for (const levelKey in DOOR_TABLE) {
            const doors = DOOR_TABLE[levelKey];
            for (let i = 0; i < doors.length; i++) {
                if (doors[i].id === usedOnDoorId) {
                    result = { levelKey, index: i, door: doors[i] };
                    break;
                }
            }
            if (result) break;
        }

        if (result) {
            const newInventory = [...inventory];
            if (isSingleUse) newInventory[idx] = null;
            set({ inventory: newInventory });

            DOOR_TABLE[result.levelKey][result.index].isUnlocked = true;
            interactionSuccess(requestedItem);
            return true;
        }

        return false;
    },

    consumeItem: (itemName) => {
        const { inventory } = get();
        const idx = inventory.findIndex(x => x?.item === itemName);
        if (idx === -1) return false; // item not found

        const newInventory = [...inventory];
        newInventory[idx] = null; // remove the item
        set({ inventory: newInventory });

        return true;
    }


}));
