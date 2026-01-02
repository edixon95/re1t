// Grouped item definitions
const Gun = { Gun: { Options: [{ label: "Equip", action: ({ equipUnequip }) => equipUnequip() }, { label: "Combine", action: ({ beginCombine }) => beginCombine() }, { label: "Examine", action: ({ openExamine }) => openExamine("A basic weapon") }] } };

const Colt = {
    Colt: { Options: [{ label: "Equip", action: ({ equipUnequip }) => equipUnequip() }, { label: "Combine", action: ({ beginCombine }) => beginCombine() }, { label: "Examine", action: ({ openExamine }) => openExamine("A slightly better weapon") }] },
    "Colt Ammo": { Options: [{ label: "Combine", action: ({ beginCombine }) => beginCombine() }, { label: "Examine", action: ({ openExamine }) => openExamine("Bullets for a Colt") }] }
};

const Uzi = {
    Uzi: { Options: [{ label: "Equip", action: ({ equipUnequip }) => equipUnequip() }, { label: "Combine", action: ({ beginCombine }) => beginCombine() }, { label: "Examine", action: ({ openExamine }) => openExamine("Turn it sideways for more damage") }] },
    "Uzi Ammo": { Options: [{ label: "Combine", action: ({ beginCombine }) => beginCombine() }, { label: "Examine", action: ({ openExamine }) => openExamine("Bullets for an Uzi") }] }
};

const Herb = {
    Herb: { Options: [{ label: "Use", action: ({ consumeItem }) => consumeItem() }, { label: "Combine", action: ({ beginCombine }) => beginCombine() }, { label: "Examine", action: ({ openExamine }) => openExamine("A medicinal herb") }] },
    HerbHerb: { Options: [{ label: "Use", action: ({ consumeItem }) => consumeItem() }, { label: "Combine", action: ({ beginCombine }) => beginCombine() }, { label: "Examine", action: ({ openExamine }) => openExamine("Bro what the fuck is this") }] }
};

const KeyCard = {
    KeyCard: { Options: [{ label: "Examine", action: ({ openExamine }) => openExamine("A keycard, looks kinda tasty") }] },
    "Blue KeyCard": { Options: [{ label: "Examine", action: ({ openExamine }) => openExamine("A keycard, this one doesn't look as tasty") }] }
};

export const ITEM_INTERACT_TABLE = {
    ...Gun,
    ...Colt,
    ...Uzi,
    ...Herb,
    ...KeyCard
};
