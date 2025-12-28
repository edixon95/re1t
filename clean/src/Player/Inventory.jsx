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
