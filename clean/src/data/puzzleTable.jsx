const test_puzzle = {
    isComplete: false,
    canWithdrawItems: true,
    parts: {
        pole_1: null,
        pole_2: null,
    },
    isStrict: false,
    wanted: {
        pole_1: "Colt Ammo",
        pole_2: "Herb"
    },
    interact: {
        pole_1: ["There's a picture of some bullets on the table", "Place item on the table?"],
        pole_2: ["There's a picture of some flowers on the table", "Place item on the table?"],
        success: "You hear a click"
    },
    placed: {
        pole_1: {
            empty: "You place the {item} on the table",
            replace: "You take back the {item1} and place {item2} in its place",
        },
        pole_2: {
            empty: "You place the {item} on the table",
            replace: "You take back the {item1} and place {item2} in its place",
        }
    },
    reward: {
        type: "UNLOCK",
        target: "A_HALLWAY_EXIT",
        activatesCutSceneAwait: "test_cutscene_two"
    }
}

export const PUZZLE_TABLE = {
    test_puzzle
}

export const getPuzzleById = (id) => {
    if (!id || !PUZZLE_TABLE[id])
        return false;

    return PUZZLE_TABLE[id]
}

export const addPieceToPuzzle = (id, part, item) => {
    if (!id || !PUZZLE_TABLE[id])
        return false;

    PUZZLE_TABLE[id].parts[part] = item;
    return true;
}

export const replacePieceFromPuzzle = (id, part, item) => {
    if (!id || !PUZZLE_TABLE[id])
        return false;

    const returnedItem = PUZZLE_TABLE[id].parts[part];
    PUZZLE_TABLE[id].parts[part] = item
    return returnedItem;
}

export const withdrawPieceFromPuzzle = (id, part) => {
    if (!id || !PUZZLE_TABLE[id])
        return false;

    const item = PUZZLE_TABLE[id].parts[part];
    PUZZLE_TABLE[id].parts[part] = null
    return item;
}

export const isPuzzleComplete = (id) => {
    if (!id || !PUZZLE_TABLE[id])
        return false;

    const puzzle = PUZZLE_TABLE[id];
    const { parts, wanted, isStrict } = puzzle;

    const partValues = Object.values(parts);
    if (partValues.some(v => v === null))
        return false;

    if (isStrict) {
        return Object.keys(wanted).every(
            key => parts[key] === wanted[key]
        );
    }

    const wantedValues = Object.values(wanted);

    const sortedParts = [...partValues].sort();
    const sortedWanted = [...wantedValues].sort();

    const isComplete = (
        sortedParts.length === sortedWanted.length &&
        sortedParts.every((val, i) => val.item === sortedWanted[i])
    )

    PUZZLE_TABLE[id].isComplete = isComplete

    return !isComplete ? false : PUZZLE_TABLE[id].reward;
};

export const getPuzzlesForSave = () => {
    return Object.entries(PUZZLE_TABLE).map(([id, puzzle]) => ({
        id,
        parts: puzzle.parts,
        isComplete: puzzle.isComplete
    }));
};

export const applyPuzzlesFromSave = (savedPuzzles = []) => {
    savedPuzzles.forEach(({ id, parts, isComplete }) => {
        const puzzle = PUZZLE_TABLE[id];
        if (!puzzle) return;
        puzzle.parts = parts;
        puzzle.isComplete = isComplete
    });
};