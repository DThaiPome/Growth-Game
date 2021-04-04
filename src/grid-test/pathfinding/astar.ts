import * as MinHeap from './minheap';

export function aStar<T>(start: T, goal:T,
    equals: (t1:T, t2:T)=>boolean, // Are the two nodes equal?
    findNeighbors: (t:T)=>Array<T>, // Get all neighbors of a node 
    dScore: (t1:T, t2:T)=>number, // Get the score of going from node 1 to node 2
    distance: (t1:T, t2:T)=>number, // Find the distance of node 1 to node 2
    toString: (t:T)=>string) // Convert T to a string (for maps)
    : Array<T> {
    // Nodes that were already discovered.
    let discovered = new Set<string>();
    // Only contains start initially.
    discovered.add(toString(start));

    // What node came from where.
    let cameFrom = new Map<string, T>();

    // Map of scores
    let gScore = new Map<string, number>();
    gScore.set(toString(start), 0);

    // Heap of nodes
    let fScore = (t: T) => {
        return gScore.get(toString(t)) + distance(t, goal);
    };
    let heap = new MinHeap.MinimumHeap<T>((t1: T, t2: T) => {
        return fScore(t1) >= fScore(t2);
    });
    heap.push(start);

    while (discovered.size > 0) {
        let current = heap.pop();
        discovered.delete(toString(current));
        if (equals(current, goal)) {
            return reconstructPath(toString, cameFrom, start, goal, equals);
        }

        let neighbors = findNeighbors(current);
        neighbors.forEach((t: T) => {
            let newScore = gScore.get(toString(current)) + dScore(current, t);
            if (!gScore.has(toString(t)) || newScore < gScore.get(toString(t))) {
                cameFrom.set(toString(t), current);
                gScore.set(toString(t), newScore);
                if (!discovered.has(toString(t))) {
                    discovered.add(toString(t));
                    heap.push(t);
                }
            }
        });
    }

    return new Array<T>();
}

function reconstructPath<T>(toString: (t:T)=>string, cameFrom: Map<string, T>, start: T, goal: T, equals:(t1: T, t2: T)=>boolean): Array<T> {
    let path = new Array<T>();
    let current = goal;
    while (!equals(current, start)) {
        path.push(current);
        current = cameFrom.get(toString(current));
    }
    path.push(start);
    return path.reverse();
}