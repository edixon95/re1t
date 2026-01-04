import { worldTable } from "../data/worldTable"
import { CUTSCENE_TABLE } from "../data/cutsceneTable"

export const WorldManager = ({ gameState }) => {
    if (gameState.mode === "cutscene") {
        const cutscene = CUTSCENE_TABLE[gameState.cutsceneId]
        if (!cutscene?.World) return null
        const CutsceneWorld = cutscene.World
        return <CutsceneWorld />
    }

    const LevelWorld = worldTable[gameState.level || "intro"]
    return LevelWorld || null
}
