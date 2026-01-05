import { create } from "zustand"
import { DOOR_TABLE, getDoor } from "../data/doorTable"
import { triggerUIText } from "../UI/InformationalUI"
import { AMMO_TABLE } from "../data/ammoTable"
import { WEAPON_TABLE } from "../data/weaponTable"
import { useItemStore } from "./useItemStore"
import { CONSUME_TABLE } from "../data/consumeTable"
import { stingometer } from "../helpers/stingometer"
import { menuOpenRef } from "../Player/Player"

export const useInventoryStore = create((set, get) => ({
    inventory: Array(12).fill(null),

    equippedItem: {
        equipped: null,
        cAmmo: 0,
        mAmmo: 0
    },

    playerHealth: 3,
    maxHealth: 3,

    takeDamage: (amount) => {
        set((state) => {
            const newHealth = Math.max(state.playerHealth - amount, 0);

            if (newHealth === 0) { // TODO: Death screen
                menuOpenRef.current = true;
            }
            return { playerHealth: newHealth };
        });
    },

    healPlayer: (amount) => {
        set((state) => {
            const newHealth = Math.min(state.playerHealth + amount, state.maxHealth);
            return { playerHealth: newHealth };
        });
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

                const allItems = useItemStore.getState().getAllItems();
                const thisItem = allItems.find((x) => x.id === item.id)
                if (thisItem?.mAmmo) {
                    item.mAmmo = thisItem.mAmmo
                    // TODO: Tweak
                    // Weapons have a chance to start with ammo
                    if (stingometer(1, 10) >= 0) {
                        item.cAmmo = stingometer(1, thisItem.mAmmo)
                    } else {
                        item.cAmmo = 0
                    }
                }

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

    tryReloadWeapon: (weaponName, ammoIndex) => {
        const { inventory } = get();
        const weaponIdx = inventory.findIndex(x => x?.item === weaponName);
        if (weaponIdx === -1) return false;

        const ammoType = AMMO_TABLE[weaponName];
        if (!ammoType) return false;

        // Use the provided ammoIndex if valid, otherwise fallback to first
        const ammoIdx = (ammoIndex !== undefined && inventory[ammoIndex]?.item === ammoType.item)
            ? ammoIndex
            : inventory.findIndex(x => x?.item === ammoType.item);

        if (ammoIdx === -1) return false;

        const newInventory = [...inventory];
        const ammoFromPack = stingometer(ammoType.minAmmo, ammoType.maxAmmo);
        const ammoTotal = Math.min(newInventory[weaponIdx].cAmmo + ammoFromPack, ammoType.maxAmmo);

        newInventory[weaponIdx] = { ...newInventory[weaponIdx], cAmmo: ammoTotal };

        const ammoSlot = { ...newInventory[ammoIdx] };
        if (ammoSlot.stackable && ammoSlot.amount > 1) {
            ammoSlot.amount -= 1;
            newInventory[ammoIdx] = ammoSlot;
        } else {
            newInventory[ammoIdx] = null;
        }

        set({ inventory: newInventory, equippedItem: { ...get().equippedItem, cAmmo: ammoTotal } });
        return true;
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

    tryUseInventoryItemDoor: (item, inventoryIndex, usedOnDoorId) => {
        const { inventory } = get();
        const door = getDoor(usedOnDoorId);
        if (!door) return false;

        const isKey = (requiredArr, check) => {
            return requiredArr.includes(check)
        }

        const replaceText = (text, replace) => {
            console.log(text, replace)
            return text.replace("{item}", replace)
        }
        // Wrong item
        if (!isKey(door.requiredItems, item)) {
            const specialText = door?.interact?.specialFail[item]
            const text = replaceText(specialText ? specialText : door.interact.fail, item);
            triggerUIText(text);
            return false;
        }

        const isAlreadyInserted = (inserted, check) => {
            return inserted.includes(check)
        }

        const isLockIncomplete = (requiredArr, inserted, check) => {
            inserted.push(check);

            const count = arr =>
                arr.reduce((acc, val) => {
                    acc[val] = (acc[val] || 0) + 1;
                    return acc;
                }, {});

            const requiredCount = count(requiredArr);
            const insertedCount = count(inserted);

            for (const key in requiredCount) {
                if (requiredCount[key] !== insertedCount[key]) {
                    return inserted;
                }
            }

            return false;
        };

        if (isAlreadyInserted(door.requiredInserted, item)) {
            const text = replaceText(door.interact.partialFail, item)
            triggerUIText(text);
            return false;
        }

        const requireMoreKeys = isLockIncomplete(door.requiredItems, door.requiredInserted, item)


        let interactText;
        if (requireMoreKeys) {

            interactText = replaceText(door.interact.partialSuccess[requireMoreKeys.length - 1], item)
        } else {
            interactText = replaceText(door.interact.success, item)
        }


        // Consume item if single-use
        if (door.isKeySingle) {
            const newInventory = [...inventory];
            newInventory[inventoryIndex] = null;
            set({ inventory: newInventory });
        }


        triggerUIText(interactText);
        for (const levelKey in DOOR_TABLE) {
            const doors = DOOR_TABLE[levelKey];
            const doorIdx = doors.findIndex(d => d.id === usedOnDoorId);
            if (doorIdx !== -1) {
                DOOR_TABLE[levelKey][doorIdx].requiredInserted = requireMoreKeys;
                DOOR_TABLE[levelKey][doorIdx].isUnlocked = !requireMoreKeys;
                break;
            }
        }

        return !requireMoreKeys
    },

    tryGetWeaponInformation: (equipped) => {
        if (!equipped) return WEAPON_TABLE.Knife
        return WEAPON_TABLE[equipped]
    },

    getInventoryForSave: () => {
        const {
            inventory,
            equippedItem,
            playerHealth,
            maxHealth
        } = get();

        return {
            inventory: inventory.map(slot => {
                if (!slot) return null;

                return {
                    item: slot.item,
                    amount: slot.amount ?? 1,
                    ...(slot.cAmmo !== undefined && { cAmmo: slot.cAmmo }),
                    ...(slot.mAmmo !== undefined && { mAmmo: slot.mAmmo }),
                };

            }),
            equippedItem,
            playerHealth,
            maxHealth
        };
    },

    loadInventoryFromSave: (savedInventory) => {
        if (!savedInventory) return;

        set({
            inventory: savedInventory.inventory,
            equippedItem: savedInventory.equippedItem,
            playerHealth: savedInventory.playerHealth,
            maxHealth: savedInventory.maxHealth
        });
    },


}))
