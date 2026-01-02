import { create } from "zustand"
import { ENEMY_TABLE } from "../data/enemyTable"

export const useEnemyStore = create((set) => ({
    enemiesByLevel: {
        introTwo: [
            {
                id: "introTwo-0",
                position: [-3, 0.5, 0.6],
                unspawnedAt: [],
                type: "Basic",
                health: ENEMY_TABLE.Basic.health,
                speed: ENEMY_TABLE.Basic.speed,
                isAlive: true
            }
        ]
    },

    damageEnemy: (level, enemyId, damage) => {
        set((state) => ({
            enemiesByLevel: {
                ...state.enemiesByLevel,
                [level]: state.enemiesByLevel[level].map((enemy) => {
                    if (enemy.id !== enemyId) return enemy

                    const health = enemy.health - damage
                    console.log(health)
                    return {
                        ...enemy,
                        health,
                        isAlive: health > 0
                    }
                })
            }
        }))
    }
}))
