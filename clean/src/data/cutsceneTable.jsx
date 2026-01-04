// data/cutsceneTable.js
import { TestIntroCutscene } from "../levels/cutscenes/scenes/TestIntroCutscene"
import { TestIntroCutsceneWorld } from "../levels/cutscenes/worlds/TestIntroCutsceneWorld"
import { TestIntroCutsceneTwo } from "../levels/cutscenes/scenes/TestIntroCutsceneTwo"
import { TestIntroCutsceneWorldTwo } from "../levels/cutscenes/worlds/TestIntroCutsceneWorldTwo"

export const CUTSCENE_TABLE = {
    test_cutscene: {
        Component: TestIntroCutscene,
        World: TestIntroCutsceneWorld,
        endSceneDoor: "A_HALLWAY_EXIT_STAIR",
        skipTransition: false
    },
    test_cutscene_two: {
        Component: TestIntroCutsceneTwo,
        World: TestIntroCutsceneWorldTwo,
        endSceneDoor: "B_HALLWAY_ENTRY_UPPER",
        skipTransition: false
    },
}