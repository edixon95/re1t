const Colt = {
    Colt: { "Colt Ammo": { type: "RELOAD", weapon: "Colt" } },
    "Colt Ammo": { Colt: { type: "RELOAD", weapon: "Colt" } }
};

const Herb = {
    Herb: { Herb: { type: "CRAFT", result: "HerbHerb" } }
};

const Uzi = {
    Uzi: { "Uzi Ammo": { type: "RELOAD", weapon: "Uzi" } },
    "Uzi Ammo": { Uzi: { type: "RELOAD", weapon: "Uzi" } }
};

export const COMBINE_TABLE = {
    ...Colt,
    ...Herb,
    ...Uzi
};
