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
