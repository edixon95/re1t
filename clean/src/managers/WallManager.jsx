import { useRef } from "react";

export const wallMeshes = [];

export const WallManager = ({ floors }) => {
    const wallThickness = 0.2;
    const wallHeight = 3;
    const debug = false;

    return (
        <>
            {floors.map((floor, idx) => {
                const [fx, , fz] = floor.position;
                const [fw, fd] = floor.size;

                const segments = [];

                const checkOverlap = (start, end, otherStart, otherEnd) =>
                    Math.max(start, otherStart) < Math.min(end, otherEnd);

                // --- LEFT wall along Z ---
                let leftSplits = [[fz - fd / 2, fz + fd / 2]];
                floors.forEach((other, j) => {
                    if (j === idx) return;
                    const [ox, , oz] = other.position;
                    const [ow, od] = other.size;
                    const otherXRange = [ox - ow / 2, ox + ow / 2];

                    // If this other floor intersects the left wall along X
                    if (fx - fw / 2 <= otherXRange[1] && fx - fw / 2 >= otherXRange[0]) {
                        leftSplits = leftSplits.flatMap(([s, e]) => {
                            const otherZRange = [oz - od / 2, oz + od / 2];
                            if (!checkOverlap(s, e, ...otherZRange)) return [[s, e]];
                            const segs = [];
                            if (s < otherZRange[0]) segs.push([s, otherZRange[0]]);
                            if (e > otherZRange[1]) segs.push([otherZRange[1], e]);
                            return segs;
                        });
                    }
                });
                leftSplits.forEach(([s, e]) => {
                    if (e - s > 0.01) {
                        const ref = useRef();
                        wallMeshes.push(ref);
                        segments.push(
                            <mesh
                                key={`L-${idx}-${s}`}
                                ref={ref}
                                position={[fx - fw / 2, wallHeight / 2, (s + e) / 2]}
                                castShadow
                                receiveShadow
                            >
                                <boxGeometry args={[wallThickness, wallHeight, e - s]} />
                                <meshStandardMaterial color="#222" wireframe={debug} />
                            </mesh>
                        );
                    }
                });

                // --- RIGHT wall along Z ---
                let rightSplits = [[fz - fd / 2, fz + fd / 2]];
                floors.forEach((other, j) => {
                    if (j === idx) return;
                    const [ox, , oz] = other.position;
                    const [ow, od] = other.size;
                    const otherXRange = [ox - ow / 2, ox + ow / 2];
                    if (fx + fw / 2 <= otherXRange[1] && fx + fw / 2 >= otherXRange[0]) {
                        rightSplits = rightSplits.flatMap(([s, e]) => {
                            const otherZRange = [oz - od / 2, oz + od / 2];
                            if (!checkOverlap(s, e, ...otherZRange)) return [[s, e]];
                            const segs = [];
                            if (s < otherZRange[0]) segs.push([s, otherZRange[0]]);
                            if (e > otherZRange[1]) segs.push([otherZRange[1], e]);
                            return segs;
                        });
                    }
                });
                rightSplits.forEach(([s, e]) => {
                    if (e - s > 0.01) {
                        const ref = useRef();
                        wallMeshes.push(ref);
                        segments.push(
                            <mesh
                                key={`R-${idx}-${s}`}
                                ref={ref}
                                position={[fx + fw / 2, wallHeight / 2, (s + e) / 2]}
                                castShadow
                                receiveShadow
                            >
                                <boxGeometry args={[wallThickness, wallHeight, e - s]} />
                                <meshStandardMaterial color="#222" wireframe={debug} />
                            </mesh>
                        );
                    }
                });

                // --- TOP wall along X ---
                let topSplits = [[fx - fw / 2, fx + fw / 2]];
                floors.forEach((other, j) => {
                    if (j === idx) return;
                    const [ox, , oz] = other.position;
                    const [ow, od] = other.size;
                    const otherZRange = [oz - od / 2, oz + od / 2];
                    if (fz + fd / 2 <= otherZRange[1] && fz + fd / 2 >= otherZRange[0]) {
                        topSplits = topSplits.flatMap(([s, e]) => {
                            const otherXRange = [ox - ow / 2, ox + ow / 2];
                            if (!checkOverlap(s, e, ...otherXRange)) return [[s, e]];
                            const segs = [];
                            if (s < otherXRange[0]) segs.push([s, otherXRange[0]]);
                            if (e > otherXRange[1]) segs.push([otherXRange[1], e]);
                            return segs;
                        });
                    }
                });
                topSplits.forEach(([s, e]) => {
                    if (e - s > 0.01) {
                        const ref = useRef();
                        wallMeshes.push(ref);
                        segments.push(
                            <mesh
                                key={`T-${idx}-${s}`}
                                ref={ref}
                                position={[(s + e) / 2, wallHeight / 2, fz + fd / 2]}
                                castShadow
                                receiveShadow
                            >
                                <boxGeometry args={[e - s, wallHeight, wallThickness]} />
                                <meshStandardMaterial color="#222" wireframe={debug} />
                            </mesh>
                        );
                    }
                });

                // --- BOTTOM wall along X ---
                let bottomSplits = [[fx - fw / 2, fx + fw / 2]];
                floors.forEach((other, j) => {
                    if (j === idx) return;
                    const [ox, , oz] = other.position;
                    const [ow, od] = other.size;
                    const otherZRange = [oz - od / 2, oz + od / 2];
                    if (fz - fd / 2 <= otherZRange[1] && fz - fd / 2 >= otherZRange[0]) {
                        bottomSplits = bottomSplits.flatMap(([s, e]) => {
                            const otherXRange = [ox - ow / 2, ox + ow / 2];
                            if (!checkOverlap(s, e, ...otherXRange)) return [[s, e]];
                            const segs = [];
                            if (s < otherXRange[0]) segs.push([s, otherXRange[0]]);
                            if (e > otherXRange[1]) segs.push([otherXRange[1], e]);
                            return segs;
                        });
                    }
                });
                bottomSplits.forEach(([s, e]) => {
                    if (e - s > 0.01) {
                        const ref = useRef();
                        wallMeshes.push(ref);
                        segments.push(
                            <mesh
                                key={`B-${idx}-${s}`}
                                ref={ref}
                                position={[(s + e) / 2, wallHeight / 2, fz - fd / 2]}
                                castShadow
                                receiveShadow
                            >
                                <boxGeometry args={[e - s, wallHeight, wallThickness]} />
                                <meshStandardMaterial color="#222" wireframe={debug} />
                            </mesh>
                        );
                    }
                });

                return segments;
            })}
        </>
    );
};
