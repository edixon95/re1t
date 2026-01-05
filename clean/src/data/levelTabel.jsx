const intro = {
    world: [{ position: [4, 0, 0], size: [10, 4], color: "#999" }, { position: [-3, 0, 3], size: [4, 10], color: "#999" }, { position: [-6, 0, 4], size: [4, 2], color: "#999" }],
    props: [{ position: [2, 0.2, 0], size: [1, 0.6, 1] }, { position: [-2, 0.5, 3], size: [2, 1, 0.5] }],
    others: [{ position: [2, 0.65, 0], rotation: 1, type: "saveStation" }]
}

const introTwo = {
    world: [{ position: [0, 0, 0], size: [12, 4], color: "#666" }, { position: [5, 0, -4], size: [4, 8], color: "#666" }],
    props: [{ position: [1.5, 0.5, -1.15], size: [1, 1.2, 1.5] }, { position: [4, 0.5, -3], size: [2, 1.2, 0.5] }, { position: [6.2, 0.5, -6], size: [1.5, 1.2, 1] }]
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