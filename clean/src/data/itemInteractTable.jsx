export const ITEM_INTERACT_TABLE = {
    Gun: {
        Options: [
            {
                label: "Equip",
                action: ({ equipUnequip }) => {
                    equipUnequip()
                }
            },
            {
                label: "Reload",
                action: ({ tryReloadGun }) => {
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
                    equipUnequip()
                }
            },
            {
                label: "Reload",
                action: ({ tryReloadGun }) => {
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
