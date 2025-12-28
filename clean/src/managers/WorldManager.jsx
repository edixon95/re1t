import { worldTable } from "../data/worldTable"

export const WorldManager = ({ gameState }) => {
    return worldTable[gameState.level || "intro"]
}