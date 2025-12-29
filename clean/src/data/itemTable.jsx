export const ITEM_TABLE = {
    intro: [
        { position: [2, 0.25, 0.8], size: [0.3, 0.3, 0.3], item: "Gun", cAmmo: 0, mAmmo: 12 },
        { position: [-3, 0.25, 3], size: [0.3, 0.3, 0.3], item: "KeyCard" }
    ],
    introTwo: [
        { position: [3, 0.25, 0.6], size: [0.3, 0.3, 0.3], item: "Colt", cAmmo: 0, mAmmo: 10 },
        { position: [6, 0.25, -5], size: [0.3, 0.3, 0.3], item: "Blue KeyCard" },
        { position: [2, 0.25, 0.8], size: [0.3, 0.3, 0.3], item: "Colt Ammo", }
    ],
};

export const fullItemRef = {
    current: Object.values(ITEM_TABLE).flat()
};
