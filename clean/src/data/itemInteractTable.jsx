export const ITEM_INTERACT_TABLE = {
    Gun: {
        Options: [
            { label: "Equip", action: ({ equipUnequip }) => equipUnequip() },
            { label: "Combine", action: ({ beginCombine }) => beginCombine() },
            { label: "Examine", action: ({ openExamine }) => openExamine("A basic weapon") }
        ]
    },

    Colt: {
        Options: [
            { label: "Equip", action: ({ equipUnequip }) => equipUnequip() },
            { label: "Combine", action: ({ beginCombine }) => beginCombine() },
            { label: "Examine", action: ({ openExamine }) => openExamine("A slightly better weapon") }
        ]
    },

    "Colt Ammo": {
        Options: [
            { label: "Combine", action: ({ beginCombine }) => beginCombine() },
            { label: "Examine", action: ({ openExamine }) => openExamine("Bullets for a Colt") }
        ]
    },

    Herb: {
        Options: [
            { label: "Use", action: ({ consumeItem }) => consumeItem() },
            { label: "Combine", action: ({ beginCombine }) => beginCombine() },
            { label: "Examine", action: ({ openExamine }) => openExamine("A medicinal herb") }
        ]
    },

    HerbHerb: {
        Options: [
            { label: "Use", action: ({ consumeItem }) => consumeItem() },
            { label: "Combine", action: ({ beginCombine }) => beginCombine() },
            { label: "Examine", action: ({ openExamine }) => openExamine("Bro what the fuck is this") }
        ]
    },

    KeyCard: {
        Options: [
            { label: "Examine", action: ({ openExamine }) => openExamine("A keycard, looks kinda tasty") },
        ]
    }
};
