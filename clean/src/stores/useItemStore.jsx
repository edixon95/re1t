import { create } from "zustand";

export const useItemStore = create((set, get) => ({
  itemTable: {
    intro: [
      { position: [2, 0.25, 0.8], size: [0.3, 0.3, 0.3], item: "Gun", cAmmo: 0, mAmmo: 12, pickedUp: false },
      { position: [-3, 0.25, 3], size: [0.3, 0.3, 0.3], item: "KeyCard", pickedUp: false }
    ],
    introTwo: [
      { position: [3, 0.25, 0.6], size: [0.3, 0.3, 0.3], item: "Colt", cAmmo: 0, mAmmo: 10, pickedUp: false },
      { position: [6, 0.25, -5], size: [0.3, 0.3, 0.3], item: "Blue KeyCard", pickedUp: false },
      { position: [2, 0.25, 0.8], size: [0.3, 0.3, 0.3], item: "Colt Ammo", pickedUp: false }
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
