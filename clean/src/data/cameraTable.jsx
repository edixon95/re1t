// Rooms geo - INTRO
const HALLWAY_A_1 = { position: [-4.710, 0.374, 1.755], lookAt: [0.715, -0.0539, -0.696], boundingBox: [4, 0, 0], size: [10, 1, 4], }
const HALLWAY_A_2 = { position: [-1.291, 3.374, 7.51], lookAt: [-1.833, 2.671, 7.051], boundingBox: [-3, 0, 3], size: [4, 1, 10] }
const intro = {
  HALLWAY_A_1,
  HALLWAY_A_2
}

// Rooms geo - introOneUpper
const LARGE_SAVE_1 = { position: [-4.79, 3.333, 7.537], lookAt: [-4.395, 2.566, 7.03], boundingBox: [-3, 0, 3], size: [4, 1, 10] }
const introOneUpper = {
  LARGE_SAVE_1
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
  introOneUpper,
  introTwo
}
