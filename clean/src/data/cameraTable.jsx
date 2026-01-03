// Rooms geo - INTRO
const HALLWAY_A_1 = { position: [-4.710, 0.374, 1.755], lookAt: [0.715, -0.0539, -0.696], boundingBox: [4, 0, 0], size: [10, 1, 4], }
const HALLWAY_A_2 = { position: [-1.43, 2.5, 7.737], lookAt: [-1.994, 1.944, 7.126], boundingBox: [-3, 0, 3], size: [4, 1, 10] }
const intro = {
  HALLWAY_A_1,
  HALLWAY_A_2
}

// Rooms geo - INTROTWO
const HALLWAY_B_1 = { position: [-6, 3.5, 1.6], lookAt: [-1.5, -1, 0], boundingBox: [0, 0, 0], size: [12, 1, 4] }
const HALLWAY_B_2 = { position: [6, 3.5, 0], lookAt: [5, 0, -4], boundingBox: [5, 0, -4], size: [4, 1, 8] }
const introTwo = {
  HALLWAY_B_1,
  HALLWAY_B_2
}

export const CAMERA_TABLE = {
  intro,
  introTwo
}
