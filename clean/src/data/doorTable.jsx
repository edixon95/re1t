const intro = [
    {
        id: "A_HALLWAY_EXIT_STAIR",
        self: "intro",
        type: "stair",
        travel: "up",
        position: [-3, 0, 5],
        size: [2, 2, 3],
        forward: [1, 0, 0],
        direction: 4,
        leadsTo: {
            level: "introTwo",
            doorId: "B_HALLWAY_ENTRY_UPPER",
        },
        spawn: {
            position: [-3.7, 0.5, 4.3],
            rotationY: 0
        },
    },
    {
        id: "A_HALLWAY_EXIT",
        self: "intro",
        position: [-2, 1, 7.8],
        size: [1, 2, 0.3],
        forward: [1, 0, 0],
        direction: 1,
        leadsTo: {
            level: "introTwo",
            doorId: "B_HALLWAY_ENTRY",
        },
        requiredItem: "KeyCard",
        isKeySingle: true,
        spawn: {
            position: [-3, 0.5, 7.25],
            rotationY: 0
        },
        interact: {
            fail: "Locked. There's a card reader on the door",
            success: "You used the KeyCard and the door beeped"
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
        isKeySingle: false,
        spawn: {
            position: [5, 0.5, -7.25],
            rotationY: Math.PI
        },
        interact: {
            fail: "Locked. There's a card reader on the door and a blue symbol",
            success: "You used the Blue KeyCard and the door beeped"
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

export const getDoor = (id) => {
    for (const levelDoors of Object.values(DOOR_TABLE)) {
        const door = levelDoors.find((d) => d.id === id);
        if (door) return door;
    }
    return null;
}


