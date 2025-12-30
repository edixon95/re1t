export const ITEM_INTERACT_TABLE = {
    Gun: {
        Options: [
            {
                label: "Equip",
                action: ({ equipUnequip }) => {
                    console.log("Equipped Gun")
                    equipUnequip()
                }
            },
            {
                label: "Reload",
                action: ({ tryReloadGun }) => {
                    console.log("Reloaded Gun")
                    tryReloadGun()
                }
            },
            {
                label: "Examine",
                action: ({ openExamine }) => {
                    openExamine("A basic weapon")
                }
            }
        ]
    },
    Colt: {
        Options: [
            {
                label: "Equip",
                action: ({ equipUnequip }) => {
                    console.log("Equipped Gun")
                    equipUnequip()
                }
            },
            {
                label: "Reload",
                action: ({ tryReloadGun }) => {
                    console.log("Reloaded Gun")
                    tryReloadGun()
                }
            },
            {
                label: "Examine",
                action: ({ openExamine }) => {
                    openExamine("A slightly better weapon")
                }
            }
        ]
    },
    "Colt Ammo": {
        Options: [
            {
                label: "Reload Gun",
                action: ({ tryUseAmmo }) => {
                    console.log("Reloaded Gun")
                    tryUseAmmo()
                }
            },
            {
                label: "Examine",
                action: ({ openExamine }) => {
                    openExamine("Bullets for a colt")
                }
            }
        ]
    },
    KeyCard: {
        Options: [
            {
                label: "Examine",
                action: ({ openExamine }) => {
                    openExamine("A keycard, looks kinda tasty")
                }
            },
            {
                label: "Eat",
                action: ({ consumeItem }) => {
                    consumeItem()
                }
            }
        ]
    }
}
