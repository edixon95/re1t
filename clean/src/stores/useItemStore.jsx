import { create } from "zustand";

export const useItemStore = create((set, get) => ({
  itemTable: {
    intro: [
      { position: [6, 0.25, -0.8], size: [0.3, 0.3, 0.3], item: "Herb", pickedUp: false, id: "intro_herb_01" },
      { position: [6, 0.25, 0.8], size: [0.3, 0.3, 0.3], item: "Herb", pickedUp: false, id: "intro_herb_02" },
      { position: [4, 0.25, -0.5], size: [0.3, 0.3, 0.3], item: "Colt", cAmmo: 0, mAmmo: 10, pickedUp: false, id: "intro_colt_01" },
      { position: [4, 0.25, 0.8], size: [0.3, 0.3, 0.3], item: "Colt Ammo", pickedUp: false, id: "intro_coltAmmo_01" },
      { position: [-3, 0.25, 3], size: [0.3, 0.3, 0.3], item: "KeyCard", pickedUp: false, id: "intro_keycard_01" }
    ],
    introTwo: [
      { position: [6, 0.25, -5], size: [0.3, 0.3, 0.3], item: "Blue KeyCard", pickedUp: false, id: "introTwo_blueKeyCard_01" }
    ]
  },

  getAllItems: () => Object.values(get().itemTable).flat(),

  pickUpItem: (itemName) =>
    set((state) => ({
      itemTable: Object.fromEntries(
        Object.entries(state.itemTable).map(([level, items]) => [
          level,
          items.map(i => i.item === itemName ? { ...i, pickedUp: true } : i)
        ])
      )
    })),

  updateItemAmmo: (levelKey, itemName, cAmmo, mAmmo) => {
    const table = get().itemTable;
    const levelItems = table[levelKey] || [];
    const newLevelItems = levelItems.map(i =>
      i.item === itemName ? { ...i, cAmmo, mAmmo } : i
    );
    set({ itemTable: { ...table, [levelKey]: newLevelItems } });
  },

}));
