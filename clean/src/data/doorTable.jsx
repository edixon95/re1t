const intro = [
    {
        id: "A_HALLWAY_EXIT_STAIR",
        self: "intro",
        type: "stair",
        travel: "up",
        position: [-5, 0, 5],
        size: [2, 2, 3],
        forward: [1, 0, 0],
        direction: 3,
        leadsTo: {
            level: "introOneUpper",
            doorId: "B_HALLWAY_ENTRY_UPPER",
        },
        spawn: {
            position: [-4.3, 0.5, 4.1],
            rotationY: 4
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
            position: [-2, 0.5, 7.25],
            rotationY: 1
        },
        interact: {
            isInteractedWith: false,
            initial: "It doesn't open. There's a card reader attached to the front.",
            after: "Try to put something in the reader?",
            fail: "You press the {item} into the reader, nothing happened",
            success: "You used the KeyCard and the door beeped",
            specialFail: {
                Herb: "You press the herbs into the reader, the room smells slightly fresher. The door is still locked.",
                HerbHerb: "You press the herbs into the reader, the room smells extra fresh and the door remains locked",
                "Colt Ammo": "You press the bullets into the reader, one gets slightly wedged and you push it out. Did the door just laugh at you?",
                Colt: "You press the barrel of the colt into the reader, leaving a scratch on the still locked door"
            }
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
            rotationY: 2
        },
        interact: {
            isInteractedWith: false,
            initial: "It doesn't open. There's a card reader attached to the front, this time it's blue.",
            after: "Try to put something in the blue reader?",
            fail: "You press the {item} into the reader, nothing happened",
            success: "You used the Blue KeyCard and the door beeped",
            specialFail: {
                Herb: "You press the herbs into the reader, the room smells slightly fresher. The door is still locked.",
                HerbHerb: "You press the herbs into the reader, the room smells extra fresh and the door remains locked",
                "Colt Ammo": "You press the bullets into the reader, one gets slightly wedged and you push it out. Did the door just laugh at you?",
                Colt: "You press the barrel of the colt into the reader, leaving a scratch on the still locked door"
            }
        }
    }
]

const introOneUpper = [
    {
        id: "B_HALLWAY_ENTRY_UPPER",
        self: "introOneUpper",
        type: "stair",
        travel: "down",
        position: [2, -2, 5],
        size: [2, 2, 3],
        forward: [1, 0, 0],
        direction: 3,
        leadsTo: {
            level: "intro",
            doorId: "A_HALLWAY_EXIT_STAIR",
        },
        spawn: {
            position: [-1.8, 0.5, 4.3],
            rotationY: 3
        },
        cutsceneId: "test_cutscene_two",
        isSceneViewed: false
    },
]

export const DOOR_TABLE = {
    intro,
    introTwo,
    introOneUpper
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

export function hasInteractedWithDoor(id) {
    for (const levelDoors of Object.values(DOOR_TABLE)) {
        const door = levelDoors.find(d => d.id === id);
        if (door && door.interact) {
            door.interact.isInteractedWith = true;
            return true;
        }
    }
    return false;
}

export function hasViewedScene(id) {
    for (const levelDoors of Object.values(DOOR_TABLE)) {
        const door = levelDoors.find(d => d.id === id);
        if (door) {
            door.isSceneViewed = true;
            return true;
        }
    }
    return false;
}


