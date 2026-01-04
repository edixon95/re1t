// managers/CutsceneManager.jsx
import { CUTSCENE_TABLE } from "../data/cutsceneTable"

export const CutsceneManager = ({ gameState, setGameState }) => {
  const cutscene = CUTSCENE_TABLE[gameState.cutsceneId]
  if (!cutscene) return null

  const CutsceneComponent = cutscene.Component

  return (
    <CutsceneComponent
      onEnd={() => {
        setGameState(prev => ({
          ...prev,
          level: cutscene.returnLevel,
          mode: "game",
          cutsceneId: null,
        }))
      }}
    />
  )
}
