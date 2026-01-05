const intro = {
    world: [{ position: [4, 0, 0], size: [10, 4], color: "#999" }, { position: [-3, 0, 3], size: [4, 10], color: "#999" }, { position: [-6, 0, 4], size: [4, 2], color: "#999" }],
    props: [{ position: [2, 0.2, 0], size: [1, 0.6, 1] }, { position: [-2, 0.5, 3], size: [2, 1, 0.5] }],
    others: [{ position: [2, 0.65, 0], rotation: 1, type: "saveStation" }]
}

const introTwo = {
    world: [{ position: [0, 0, 0], size: [12, 4], color: "#666" }, { position: [5, 0, -4], size: [4, 8], color: "#666" }],
    props: [{ position: [1.5, 0.5, -1.15], size: [1, 1.2, 1.5] }, { position: [4, 0.5, -3], size: [2, 1.2, 0.5] }, { position: [6.2, 0.5, -6], size: [1.5, 1.2, 1] }],
    others: [{ position: [4.5, 0.25, -5], rotation: 1, type: "buttonStation", unlockType: "door", target: "B_HALLWAY_ENTRY", isUsed: false, level: "introTwo" }]
}

const introOneUpper = {
    world: [{ position: [-3, 0, 3], size: [4, 10], color: "#999" }, { position: [0, 0, 4], size: [4, 2.2], color: "#999", skip: true, direction: 3 }],
    props: [{ position: [1.5, 0.5, -1.15], size: [1, 1.2, 1.5] }],
    others: [{ position: [-3, 0.5, 1.5], rotation: 1, type: "puzzleStation", puzzleId: "test_puzzle", part: "pole_1" }, { position: [-3, 0.5, 4], rotation: 1, type: "puzzleStation", puzzleId: "test_puzzle", part: "pole_2" }]
}

export const LEVEL_TABLE = {
    intro,
    introTwo,
    introOneUpper
}

export const handlMarkButtonUsed = (level, target) => {
    const idx = LEVEL_TABLE[level].others.findIndex((x) => x.target === target);

    if (idx === -1)
        return false;

    LEVEL_TABLE[level].others[idx].isUsed = true;

    return true;
}

export const isButtonUsed = (level, target) => {
    return LEVEL_TABLE[level].others.find((x) => x.target === target).isUsed
}

export const getButton = (level, target) => {
    return LEVEL_TABLE[level].others.find((x) => x.target === target)
}

export const getButtonsForSave = () => {
    const buttons = [];

    Object.entries(LEVEL_TABLE).forEach(([levelName, level]) => {
        level.others?.forEach((o) => {
            if (o.type === "buttonStation") {
                buttons.push({
                    level: levelName,
                    target: o.target,
                    isUsed: o.isUsed === true
                });
            }
        });
    });

    return buttons;
};

export const applyButtonsFromSave = (savedButtons = []) => {
    savedButtons.forEach(({ level, target, isUsed }) => {
        const lvl = LEVEL_TABLE[level];
        if (!lvl) return;

        const btn = lvl.others?.find(
            (o) => o.type === "buttonStation" && o.target === target
        );

        if (btn) {
            btn.isUsed = isUsed;
        }
    });
};