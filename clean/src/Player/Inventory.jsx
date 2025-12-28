import { DOOR_TABLE } from "../data/doorTable"
import { interactionAttempt, interactionSuccess } from "../UI/InformationalUI"

export const inventory = Array(12).fill(null)

// simple listener system
const listeners = new Set()

export const onInventoryChange = (fn) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
}

const notify = () => {
    listeners.forEach(fn => fn())
}

export const tryAddInventory = (item) => {
    console.log("adding item:", item)

    if (item.stackable) {
        const idx = inventory.findIndex(
            x => x && x.item === item.item
        )

        if (idx !== -1) {
            inventory[idx].amount += item.amount
            notify()
            return item.item
        }
    }

    for (let i = 0; i < inventory.length; i++) {
        if (inventory[i] === null) {
            inventory[i] = item
            notify()
            return item.item
        }
    }

    return false
}

const findDoorById = (doorId) => {
    for (const levelKey in DOOR_TABLE) { // loop over keys: intro, introTwo
        const doors = DOOR_TABLE[levelKey];
        for (let i = 0; i < doors.length; i++) {
            if (doors[i].id === doorId) {
                return { levelKey, index: i, door: doors[i] };
            }
        }
    }
    return null; // not found
};

export const tryUseInventoryItem = (requestedItem, isAnonymous, isSingleUse, usedOn) => {
    console.log(requestedItem)
    const idx = inventory.findIndex(
        x => x && x.item === requestedItem
    )

    if (idx === -1) {
        interactionAttempt(isAnonymous, requestedItem)
        return false;
    }

    const result = findDoorById(usedOn);
    if (result) {

        if (isSingleUse) {
            inventory[idx] = null;
        }

        DOOR_TABLE[result.levelKey][result.index].isUnlocked = true;
        interactionSuccess(requestedItem)
        return true;
    }

    // find used on

}
