import { shallow } from "zustand/shallow";
import { useEnemyStore } from "../stores/useEnemyStores";

const EMPTY_ARRAY = [];

export const liveEnemyRefs = [];

export const EnemyManager = ({ gameState }) => {
    const enemies = useEnemyStore(
        (state) => state.enemiesByLevel[gameState.level],
        shallow
    ) ?? EMPTY_ARRAY;

    if (enemies.length === 0) return null;

    liveEnemyRefs.length = enemies.length;

    return (
        <>
            {enemies.map((enemy, index) =>
                enemy.isAlive ? (
                    <mesh
                        key={enemy.id}
                        ref={(ref) => {
                            liveEnemyRefs[index] = ref;
                        }}
                        position={enemy.position}
                        userData={{ enemyId: enemy.id }}
                        castShadow
                    >
                        <boxGeometry args={[0.5, 1, 0.5]} />
                        <meshStandardMaterial color="cyan" />
                    </mesh>
                ) : null
            )}
        </>
    );
};
