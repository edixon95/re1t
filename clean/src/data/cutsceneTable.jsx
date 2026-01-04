// data/cutsceneTable.js
import { TestIntroCutscene } from "../levels/cutscenes/scenes/TestIntroCutscene"
import { TestIntroCutsceneWorld } from "../levels/cutscenes/worlds/TestIntroCutsceneWorld"

export const CUTSCENE_TABLE = {
    test_cutscene: {
        Component: TestIntroCutscene,
        World: TestIntroCutsceneWorld,
        endSceneDoor: "A_HALLWAY_EXIT_STAIR",
        skipTransition: false
    },
}
