import { create } from "zustand"
import { ENEMY_TABLE } from "../data/enemyTable"

export const useEnemyStore = create((set, get) => ({
    enemiesByLevel: {
        introTwo: [
            {
                id: "introTwo-0",
                position: [-3, 0.5, 0.6],
                type: "Basic",
                health: ENEMY_TABLE.Basic.health,
                speed: ENEMY_TABLE.Basic.speed,
                attackWait: ENEMY_TABLE.Basic.attackWait,
                attackDelay: ENEMY_TABLE.Basic.attackDelay,
                attackDamage: ENEMY_TABLE.Basic.attackDamage,
                isAlive: true
            },
            {
                id: "introTwo-1",
                position: [-3, 0.5, 1],
                type: "Basic",
                health: ENEMY_TABLE.Basic.health,
                speed: ENEMY_TABLE.Basic.speed,
                attackWait: ENEMY_TABLE.Basic.attackWait,
                attackDelay: ENEMY_TABLE.Basic.attackDelay,
                attackDamage: ENEMY_TABLE.Basic.attackDamage,
                isAlive: true
            }
        ]
    },

    saveEnemyPosition: (level, liveEnemyRefs) => {
        set((state) => {
            const enemies = state.enemiesByLevel[level]

            if (!enemies)
                return state

            if (!liveEnemyRefs || Object.keys(liveEnemyRefs).length === 0)
                return state

            return {
                enemiesByLevel: {
                    ...state.enemiesByLevel,
                    [level]: enemies.map((enemy) => {
                        const ref = Object.values(liveEnemyRefs).find(
                            (r) => r?.userData?.enemyId === enemy.id
                        )

                        if (!ref || !enemy.isAlive) return enemy

                        const pos = ref.position

                        return {
                            ...enemy,
                            position: [pos.x, pos.y, pos.z]
                        }
                    })
                }
            }
        })
    },

    damageEnemy: (level, enemyId, damage) => {
        set((state) => ({
            enemiesByLevel: {
                ...state.enemiesByLevel,
                [level]: state.enemiesByLevel[level].map((enemy) => {
                    if (enemy.id !== enemyId) return enemy

                    const health = enemy.health - damage
                    return {
                        ...enemy,
                        health,
                        isAlive: health > 0
                    }
                })
            }
        }))
    },

    getEnemiesForSave: () => {
        const enemiesByLevel = get().enemiesByLevel;

        const result = {};
        for (const [levelKey, enemies] of Object.entries(enemiesByLevel)) {
            result[levelKey] = enemies.map(enemy => ({
                id: enemy.id,
                position: enemy.position,
                isAlive: enemy.isAlive ?? true
            }));
        }

        return result;
    },

    loadEnemiesFromSave: (savedEnemies) => {
        if (!savedEnemies) return;

        set((state) => {
            const newTable = { ...state.enemiesByLevel };

            for (const levelKey in savedEnemies) {
                if (!newTable[levelKey]) continue;

                newTable[levelKey] = newTable[levelKey].map(enemy => {
                    const saved = savedEnemies[levelKey].find(e => e.id === enemy.id);
                    if (!saved) return enemy;

                    return {
                        ...enemy,
                        position: saved.position ?? enemy.position,
                        isAlive: saved.isAlive
                    };
                });
            }

            return { enemiesByLevel: newTable };
        });
    },


}))
