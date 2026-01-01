import { create } from "zustand"
import { DOOR_TABLE } from "../data/doorTable"
import { interactionAttempt, interactionSuccess } from "../UI/InformationalUI"
import { AMMO_TABLE } from "../data/ammoTable"
import { WEAPON_TABLE } from "../data/weaponTable"
import { useItemStore } from "./useItemStore"
import { CONSUME_TABLE } from "../data/consumeTable"

export const useInventoryStore = create((set, get) => ({
    inventory: Array(12).fill(null),

    equippedItem: {
        equipped: null,
        cAmmo: 0,
        mAmmo: 0
    },

    tryAddInventory: (item) => {
        const { inventory } = get()

        if (item.stackable) {
            const idx = inventory.findIndex((x) => x && x.item === item.item)
            if (idx !== -1) {
                const newInventory = [...inventory]
                newInventory[idx] = {
                    ...newInventory[idx],
                    amount: newInventory[idx].amount + item.amount
                }
                set({ inventory: newInventory })
                return item.item
            }
        }

        for (let i = 0; i < inventory.length; i++) {
            if (inventory[i] === null) {
                const newInventory = [...inventory]
                newInventory[i] = item
                set({ inventory: newInventory })
                return item.item
            }
        }

        return false
    },

    consumeItemByIndex: (index) => {
        const { inventory } = get();

        if (!inventory[index]) return false;

        const newInventory = [...inventory];
        newInventory[index] = null;

        set({ inventory: newInventory });
        return true;
    },

    useItemByIndex: (index) => {
        const { inventory } = get();
        const slot = inventory[index];
        if (!slot) return false;

        const entry = CONSUME_TABLE[slot.item];
        if (!entry) return false;

        // Use stuff here
        // switch (entry.type) {
        //     case "HEAL":
        //         get().healPlayer(entry.amount);
        //         break;

        //     default:
        //         return false;
        // }

        const newInventory = [...inventory];
        newInventory[index] = null;
        set({ inventory: newInventory });

        return true;
    },

    equipItem: (itemData) => {
        if (!itemData) {
            set({ equippedItem: { equipped: null, cAmmo: 0, mAmmo: 0 } });
            return;
        }

        const { inventory } = get();
        const invSlot = inventory.find(x => x?.item === itemData.item);

        const currentAmmo = invSlot ? { cAmmo: invSlot.cAmmo ?? 0, mAmmo: invSlot.mAmmo ?? 0 } : { cAmmo: itemData.cAmmo ?? 0, mAmmo: itemData.mAmmo ?? 0 };

        const newEquipped = {
            equipped: itemData.item,
            cAmmo: currentAmmo.cAmmo,
            mAmmo: currentAmmo.mAmmo
        };

        set({ equippedItem: newEquipped });

        if (invSlot) {
            const idx = inventory.findIndex(x => x?.item === itemData.item);
            if (idx !== -1) {
                const newInventory = [...inventory];
                newInventory[idx] = { ...newInventory[idx], ...currentAmmo };
                set({ inventory: newInventory });
            }
        }

        const allItems = useItemStore.getState().getAllItems();
        const tableItem = allItems.find(i => i.item === itemData.item);
        if (tableItem) {
            useItemStore.getState().updateItemAmmo(
                tableItem.levelKey,
                tableItem.item,
                currentAmmo.cAmmo,
                currentAmmo.mAmmo
            );
        }
    },

    consumeAmmo: () => {
        const { equippedItem, inventory } = get();
        if (!equippedItem.equipped || equippedItem.cAmmo <= 0) return false;

        const newEquipped = { ...equippedItem, cAmmo: equippedItem.cAmmo - 1 };
        set({ equippedItem: newEquipped });

        const idx = inventory.findIndex(x => x?.item === equippedItem.equipped);
        if (idx !== -1) {
            const newInventory = [...inventory];
            newInventory[idx] = { ...newInventory[idx], cAmmo: newEquipped.cAmmo };
            set({ inventory: newInventory });
        }

        const allItems = useItemStore.getState().getAllItems();
        const tableItem = allItems.find(i => i.item === equippedItem.equipped);
        if (tableItem) {
            useItemStore.getState().updateItemAmmo(tableItem.levelKey, tableItem.item, newEquipped.cAmmo, tableItem.mAmmo ?? 0);
        }

        return true;
    },

    tryReloadWeapon: (weaponName) => {
        const { inventory } = get();
        const weaponIdx = inventory.findIndex(x => x?.item === weaponName);
        if (weaponIdx === -1) return false;

        const ammoType = AMMO_TABLE[weaponName];
        if (!ammoType) return false;

        const ammoIdx = inventory.findIndex(x => x?.item === ammoType.item);
        if (ammoIdx === -1) return false;

        const newInventory = [...inventory];

        // refill weapon slot
        newInventory[weaponIdx] = { ...newInventory[weaponIdx], cAmmo: ammoType.maxAmmo, mAmmo: ammoType.maxAmmo };

        // consume ammo slot
        const ammoSlot = { ...newInventory[ammoIdx] };
        if (ammoSlot.stackable && ammoSlot.amount > 1) {
            ammoSlot.amount -= 1;
            newInventory[ammoIdx] = ammoSlot;
        } else {
            newInventory[ammoIdx] = null;
        }

        set({ inventory: newInventory, equippedItem: { ...get().equippedItem, cAmmo: ammoType.maxAmmo, mAmmo: ammoType.maxAmmo } });

    },

    craftItemsByIndex: (idxA, idxB, resultItem) => {
        if (idxA === idxB) return false;

        const { inventory } = get();

        if (!inventory[idxA] || !inventory[idxB]) return false;

        const newInventory = [...inventory];

        newInventory[idxA] = null;
        newInventory[idxB] = { item: resultItem };

        set({ inventory: newInventory });
        return true;
    },

    tryUseInventoryItemDoor: (requestedItem, isAnonymous, isSingleUse, usedOnDoorId) => {
        const { inventory } = get()
        const idx = inventory.findIndex(x => x?.item === requestedItem)
        if (idx === -1) {
            interactionAttempt(isAnonymous, requestedItem)
            return false
        }

        for (const levelKey in DOOR_TABLE) {
            const doors = DOOR_TABLE[levelKey]
            const doorIdx = doors.findIndex(d => d.id === usedOnDoorId)
            if (doorIdx !== -1) {
                if (isSingleUse) {
                    const newInventory = [...inventory]
                    newInventory[idx] = null
                    set({ inventory: newInventory })
                }

                DOOR_TABLE[levelKey][doorIdx].isUnlocked = true
                interactionSuccess(requestedItem)
                return true
            }
        }

        return false
    },

    tryGetWeaponInformation: (equipped) => {
        if (!equipped) return WEAPON_TABLE.Knife
        return WEAPON_TABLE[equipped]
    }
}))
