const intro = [
    {
        id: "A_HALLWAY_EXIT",
        self: "intro",
        position: [-3, 1, 7.85],
        size: [1, 2, 0.3],
        forward: [1, 0, 0],
        direction: 1,
        leadsTo: {
            level: "introTwo",
            doorId: "B_HALLWAY_ENTRY",
        },
        requiredItem: "KeyCard",
        isAnonymous: true,
        isKeySingle: true,
        spawn: {
            position: [-3, 0.5, 7.25],
            rotationY: 0
        }
    }
]

const introTwo = [
    {
        id: "B_HALLWAY_ENTRY",
        self: "introTwo",
        position: [5, 1, -7.85],
        size: [1, 2, 0.3],
        forward: [-1, 0, 0],
        direction: 1,
        leadsTo: {
            level: "intro",
            doorId: "A_HALLWAY_EXIT",
        },
        requiredItem: "Blue KeyCard",
        isAnonymous: false,
        isKeySingle: false,
        spawn: {
            position: [5, 0.5, -7.25],
            rotationY: Math.PI
        }
    }
]

export const DOOR_TABLE = {
    intro,
    introTwo
};

export const getDoorsForSave = () => {
    const result = {};

    for (const [levelName, doors] of Object.entries(DOOR_TABLE)) {
        result[levelName] = doors.map(door => ({
            id: door.id,
            isUnlocked: door.isUnlocked ?? false
        }));
    }

    return result;
};

export const applyDoorsFromSave = (savedDoors) => {
    if (!savedDoors) return;

    for (const levelKey in savedDoors) {
        const levelDoors = DOOR_TABLE[levelKey];
        if (!levelDoors) continue;

        for (const savedDoor of savedDoors[levelKey]) {
            const door = levelDoors.find(d => d.id === savedDoor.id);
            if (door) {
                door.isUnlocked = !!savedDoor.isUnlocked;
            }
        }
    }
};

