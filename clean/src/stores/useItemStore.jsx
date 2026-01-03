import { create } from "zustand";

export const useItemStore = create((set, get) => ({
  itemTable: {
    intro: [
      { position: [6, 0.25, -0.8], size: [0.3, 0.3, 0.3], item: "Herb", isCollected: false, id: "intro_herb_01" },
      { position: [6, 0.25, 0.8], size: [0.3, 0.3, 0.3], item: "Herb", isCollected: false, id: "intro_herb_02" },
      { position: [4, 0.25, -0.5], size: [0.3, 0.3, 0.3], item: "Colt", cAmmo: 0, mAmmo: 10, isCollected: false, id: "intro_colt_01" },
      { position: [4, 0.25, 0.8], size: [0.3, 0.3, 0.3], item: "Colt Ammo", isCollected: false, id: "intro_coltAmmo_01" },
      { position: [4, 0.25, 0.8], size: [0.3, 0.3, 0.3], item: "Colt Ammo", isCollected: false, id: "intro_coltAmmo_02" },
      { position: [-3, 0.25, 3], size: [0.3, 0.3, 0.3], item: "KeyCard", isCollected: false, id: "intro_keycard_01" }
    ],
    introTwo: [
      { position: [6, 0.25, -5], size: [0.3, 0.3, 0.3], item: "Blue KeyCard", isCollected: false, id: "introTwo_blueKeyCard_01" },
      { position: [-3, 0.5, 1], size: [0.3, 0.3, 0.3], item: "Uzi", cAmmo: 0, mAmmo: 30, isCollected: false, id: "introTwo_uzi_01" },
      { position: [-3, 0.5, 0.2], size: [0.3, 0.3, 0.3], item: "Uzi Ammo", isCollected: false, id: "introTwo_uziAmmo_01" },
    ],
    introOneUpper: [
      { position: [6, 0.25, -0.8], size: [0.3, 0.3, 0.3], item: "Herb", isCollected: false, id: "intro_herb_01" }
    ]
  },

  safeToRender: true, // new flag

  setSafeToRender: (value) => set({ safeToRender: value }),

  getAllItems: () => Object.values(get().itemTable).flat(),

  pickUpItem: (itemId) =>
    set((state) => {
      const newItemTable = { ...state.itemTable };

      for (const level in newItemTable) {
        const items = newItemTable[level];
        const index = items.findIndex(i => i.id === itemId);
        if (index !== -1) {
          items[index] = { ...items[index], isCollected: true };
          break;
        }
      }
      return { itemTable: newItemTable };
    }),


  updateItemAmmo: (levelKey, itemName, cAmmo, mAmmo) => {
    const table = get().itemTable;
    const levelItems = table[levelKey] || [];
    const newLevelItems = levelItems.map(i =>
      i.item === itemName ? { ...i, cAmmo, mAmmo } : i
    );
    set({ itemTable: { ...table, [levelKey]: newLevelItems } });
  },

  getItemsForSave: () => {
    const itemTable = get().itemTable;

    const result = {};
    for (const [levelKey, items] of Object.entries(itemTable)) {
      result[levelKey] = items.map(item => ({
        id: item.id,
        isCollected: item.isCollected ?? false
      }));
    }

    return result;
  },

  loadItemsFromSave: (savedItems) => {
    if (!savedItems) {
      setTimeout(() => set({ safeToRender: true }), 0);
      return;
    }

    set({ safeToRender: false }); // freeze rendering

    set((state) => {
      const newTable = { ...state.itemTable };
      for (const levelKey in savedItems) {
        if (!newTable[levelKey]) continue;
        newTable[levelKey] = newTable[levelKey].map(item => {
          const saved = savedItems[levelKey].find(s => s.id === item.id);
          return saved
            ? { ...item, isCollected: saved.isCollected }
            : item;
        });
      }
      return { itemTable: newTable };
    });

    // Allow rendering next tick
    setTimeout(() => set({ safeToRender: true }), 0);
  },


}));
