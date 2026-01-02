export const COMBINE_TABLE = {
    Colt: {
        "Colt Ammo": {
            type: "RELOAD",
            weapon: "Colt"
        }
    },

    "Colt Ammo": {
        Colt: {
            type: "RELOAD",
            weapon: "Colt"
        }
    },

    Herb: {
        Herb: {
            type: "CRAFT",
            result: "HerbHerb"
        }
    },

    Uzi: {
        "Uzi Ammo": {
            type: "RELOAD",
            weapon: "Uzi"
        }
    },

    "Uzi Ammo": {
        Uzi: {
            type: "RELOAD",
            weapon: "Uzi"
        }
    }
};
