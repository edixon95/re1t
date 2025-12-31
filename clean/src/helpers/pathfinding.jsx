// I obviously didn't write this lol

import * as THREE from "three";

class Node {
    constructor(xIndex, zIndex, worldX, worldZ, walkable = true) {
        this.xIndex = xIndex;
        this.zIndex = zIndex;
        this.worldX = worldX;
        this.worldZ = worldZ;
        this.walkable = walkable;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.parent = null;
    }
}

export function createGrid(floor, obstacles, cellSize = 0.5) {
    if (!floor) return null;
    const [fx, fy, fz] = floor.position;
    const [fw, fd] = floor.size;

    const cols = Math.ceil(fw / cellSize);
    const rows = Math.ceil(fd / cellSize);
    const grid = [];

    for (let i = 0; i < cols; i++) {
        grid[i] = [];
        for (let j = 0; j < rows; j++) {
            const worldX = fx - fw / 2 + i * cellSize + cellSize / 2;
            const worldZ = fz - fd / 2 + j * cellSize + cellSize / 2;

            let walkable = true;
            const pos = new THREE.Vector3(worldX, fy, worldZ);

            for (let obs of obstacles) {
                if (!obs) continue;
                const bbox = new THREE.Box3().setFromObject(obs);
                if (bbox.containsPoint(pos)) {
                    walkable = false;
                    break;
                }
            }

            grid[i][j] = new Node(i, j, worldX, worldZ, walkable);
        }
    }

    return { grid, cols, rows, cellSize, originX: fx - fw / 2, originZ: fz - fd / 2 };
}

function worldToGrid(gridObj, pos) {
    if (!pos || isNaN(pos.x) || isNaN(pos.z) || !gridObj) {
        return { i: 0, j: 0 };
    }
    const { cellSize, originX, originZ, cols, rows } = gridObj;
    let i = Math.floor((pos.x - originX) / cellSize);
    let j = Math.floor((pos.z - originZ) / cellSize);
    i = Math.max(0, Math.min(cols - 1, i));
    j = Math.max(0, Math.min(rows - 1, j));
    return { i, j };
}

export function findPath(gridObj, startVec3, endVec3) {
    if (!gridObj || !gridObj.grid || !startVec3 || !endVec3) return [];

    const { grid, cols, rows } = gridObj;

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const node = grid[i][j];
            node.g = 0;
            node.h = 0;
            node.f = 0;
            node.parent = null;
        }
    }

    const startIdx = worldToGrid(gridObj, startVec3);
    const endIdx = worldToGrid(gridObj, endVec3);

    const startNode = grid[startIdx.i][startIdx.j];
    const endNode = grid[endIdx.i][endIdx.j];

    if (!startNode.walkable || !endNode.walkable) return [];

    const openList = [];
    const closedList = new Set();

    openList.push(startNode);

    while (openList.length > 0) {
        openList.sort((a, b) => a.f - b.f);
        const current = openList.shift();
        closedList.add(current);

        if (current === endNode) {
            const path = [];
            let node = current;
            while (node) {
                path.unshift({ x: node.worldX, z: node.worldZ });
                node = node.parent;
            }
            return path;
        }

        const neighbors = [];
        const dirs = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ];

        for (let [dx, dz] of dirs) {
            const ni = current.xIndex + dx;
            const nj = current.zIndex + dz;
            if (ni < 0 || ni >= cols || nj < 0 || nj >= rows) continue;
            const neighbor = grid[ni][nj];
            if (!neighbor.walkable || closedList.has(neighbor)) continue;
            neighbors.push(neighbor);
        }

        for (let neighbor of neighbors) {
            const gScore = current.g + 1;
            if (!openList.includes(neighbor) || gScore < neighbor.g) {
                neighbor.g = gScore;
                neighbor.h = Math.abs(neighbor.xIndex - endNode.xIndex) + Math.abs(neighbor.zIndex - endNode.zIndex);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;
                if (!openList.includes(neighbor)) openList.push(neighbor);
            }
        }
    }

    return [];
}
