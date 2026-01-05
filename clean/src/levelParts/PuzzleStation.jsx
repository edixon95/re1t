import { useEffect, useState } from "react";
import { getPuzzleById } from "../data/puzzleTable";

export const PuzzleStation = ({ position, ref, item }) => {
    const [hasPart, setHasPart] = useState(false);

    useEffect(() => {
        let mounted = true;

        const checkPuzzle = () => {
            const puzzle = getPuzzleById(item.puzzleId);
            const next = puzzle?.parts[item.part] !== null;

            if (mounted) {
                setHasPart(prev => (prev !== next ? next : prev));
            }
        };

        checkPuzzle();
        const interval = setInterval(checkPuzzle, 250);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [item.puzzleId, item.part]);

    return (
        <mesh
            ref={ref}
            position={position}
            userData={{ type: "puzzleStation", puzzle: item }}
            castShadow
            receiveShadow
        >
            <boxGeometry args={[0.6, 1, 0.6]} />
            <meshStandardMaterial color="pink" />

            {hasPart && (
                <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
                    <boxGeometry args={[0.3, 0.3, 0.3]} />
                    <meshStandardMaterial color="orange" />
                </mesh>
            )}
        </mesh>
    );
};
