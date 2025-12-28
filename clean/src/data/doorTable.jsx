export const DOOR_TABLE = {
    intro: [
        {
            id: "A_HALLWAY_EXIT",
            position: [-3, 1, 7.85], // door mesh
            size: [1, 2, 0.3],
            forward: [1, 0, 0],
            leadsTo: {
                level: "introTwo",
                doorId: "B_HALLWAY_ENTRY",
            },
            requiredItem: "KeyCard",
            spawn: {
                position: [-3, 0.5, 7.25], // <-- exact spawn inside map
                rotationY: 0           // <-- facing into the next room
            }
        },
    ],
    introTwo: [
        {
            id: "B_HALLWAY_ENTRY",
            position: [5, 1, -7.85],
            size: [1, 2, 0.3],
            forward: [-1, 0, 0],
            leadsTo: {
                level: "intro",
                doorId: "A_HALLWAY_EXIT",
            },
            spawn: {
                position: [5, 0.5, -7.25], // <-- exact spawn inside map
                rotationY: Math.PI               // <-- facing into intro
            }
        },
    ],
};
