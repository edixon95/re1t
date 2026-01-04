// managers/CutsceneManager.jsx
import { CUTSCENE_TABLE } from "../data/cutsceneTable"
import { getDoor } from "../data/doorTable"

export const CutsceneManager = ({ gameState, setGameState }) => {
  const cutscene = CUTSCENE_TABLE[gameState.cutsceneId]
  if (!cutscene) return null

  const CutsceneComponent = cutscene.Component

  return (
    <CutsceneComponent
      onEnd={() => {
        setGameState((prev) => ({
          ...prev,
          mode: "game",
          cutsceneId: null
        }))

        const door = getDoor(cutscene.endSceneDoor)
        if (!cutscene.skipTransition) {
          window.dispatchEvent(
            new CustomEvent("door:enter", {
              detail: door,
            })
          );
        }
      }}
    />
  )
}
