import { Grid } from 'matter';
import * as Phaser from 'phaser';
import * as GridTile from './grid-tile';
import * as Pathfinding from './pathfinding/astar';
import * as Pool from './pool';

export interface IGrid {
    // Add the given tile to the grid at the given *grid coordinates*
    // Removes an existing tile if one exists at the same coordinates.
    setTile:(gridPos:[number, number])=>void;
    // Remove the tile at the given *grid coordinates* if one exists.
    destroyTile:(gridPos:[number, number])=>void;
    // Find a path between the two grid coordinates
    findPath:(gridPos1:[number, number], gridPos2:[number, number])=>Array<[number, number]>;

    // Is there a tile here?
    queryTile:(gridPos:[number, number])=>boolean;

    // Expose the functions used to convert from grid coordinates to game coordinates, and vice versa
    gridToReal:(gridPos:[number, number])=>[number, number];
    realToGrid:(pos:[number, number])=>[number, number];
}

abstract class AGrid implements IGrid {
    
    protected tiles: Map<string, GridTile.IGridTile>;
    protected scene: Phaser.Scene;
    protected tileFactory: (scene: Phaser.Scene, pos: [number, number], tileSize: number) => GridTile.IGridTile;
    protected tileSize: number;

    protected tilePool: Pool.IObjectPool;

    public constructor(scene: Phaser.Scene, tileSize: number, tileFactory: (scene: Phaser.Scene, pos: [number, number], tileSize: number) => GridTile.IGridTile) {
        this.scene = scene;
        this.tileFactory = tileFactory;

        this.tiles = new Map<string, GridTile.IGridTile>();
        this.tileSize = tileSize;

        this.tilePool = new Pool.ObjectPool((x: number, y: number): Pool.IPoolItem => {
            return this.tileFactory(this.scene, [x, y], this.tileSize) as unknown as Pool.IPoolItem; //?
        });
        this.tilePool.add(500);
    }

    private mapGet(gridPos: [number, number]): GridTile.IGridTile {
        let key = gridPos.join();
        return this.tiles.get(key);
    }

    private mapSet(gridPos: [number, number], tile: GridTile.IGridTile): void {
        let key = gridPos.join();
        this.tiles.set(key, tile);
    }

    private mapHas(gridPos: [number, number]): boolean {
        let key = gridPos.join();
        return this.tiles.has(key);
    }

    private mapDelete(gridPos: [number, number]): void {
        let key = gridPos.join();
        this.tiles.delete(key);
    }

    public setTile(gridPos: [number, number]): void {
        if (this.mapHas(gridPos)) {
            this._destroyTile(gridPos);
        }

        let realPos = this.gridToReal(gridPos);
        let newTile = this.tilePool.pop(realPos[0], realPos[1]) as unknown as GridTile.IGridTile;
        this.fitTile(newTile);
        this.mapSet(gridPos, newTile);
    }

    public destroyTile(gridPos: [number, number]): void {
        this._destroyTile(gridPos);
    }

    protected _destroyTile(gridPos: [number, number]): void {
        let goneTile = this.mapGet(gridPos) as unknown as Pool.IPoolItem;
        this.tilePool.push(goneTile);
        this.mapDelete(gridPos);
    }

    // Use A*
    public findPath(gridPos1: [number, number], gridPos2: [number, number]): Array<[number, number]> {
        let equals = (pos1: [number, number], pos2: [number, number]): boolean => {
            return pos1[0] == pos2[0] && pos1[1] == pos2[1];
        };
        let findNeighbors = (pos: [number, number]): Array<[number, number]> => {
            let neighbors = Array<[number, number]>();
            
            let east: [number, number] = [pos[0] + 1, pos[1]];
            let west: [number, number] = [pos[0] - 1, pos[1]];
            let north: [number, number] = [pos[0], pos[1] + 1];
            let south: [number, number] = [pos[0], pos[1] - 1];

            neighbors.push(east);
            neighbors.push(west);
            neighbors.push(north);
            neighbors.push(south);

            return neighbors;
        };
        let toString = (pos: [number, number]): string => {
            return pos.join();
        }
        return Pathfinding.aStar(gridPos1, gridPos2, equals, findNeighbors, this.pathCost, this.gridDistance, toString);
    }

    // Calculate distance for pathfinding
    protected abstract gridDistance(gridPos1:[number, number], gridPos2:[number, number]): number;

    public queryTile (gridPos:[number, number]): boolean {
        return this.mapHas(gridPos);
    }

    public abstract gridToReal(gridPos: [number, number]): [number, number];

    public abstract realToGrid(pos: [number, number]): [number, number];

    // How should the costs of each position be calculated for pathfinding?
    protected abstract pathCost(gridPosA: [number, number], gridPosB: [number, number]): number;

    // Transform a tile so that it fits in the grid
    protected abstract fitTile(tile:GridTile.IGridTile): void;
}

export class DebugGrid extends AGrid {
    protected gridDistance(gridPos1: [number, number], gridPos2: [number, number]): number {
        return Math.abs(gridPos2[0] - gridPos1[0]) + Math.abs(gridPos2[1] - gridPos1[1]);
    }
    public gridToReal(gridPos: [number, number]): [number, number] {
        let result: [number, number] = [gridPos[0] * this.tileSize, gridPos[1] * this.tileSize];
        return result;
    }
    public realToGrid(pos: [number, number]): [number, number] {
        let result: [number, number] = [Phaser.Math.RoundTo(pos[0] / this.tileSize), Phaser.Math.RoundTo(pos[1] / this.tileSize)];
        return result;
    }
    protected pathCost(gridPosA: [number, number], gridPosB: [number, number]): number {
        return Math.random() * 69;
    }
    protected fitTile(tile: GridTile.IGridTile): void {
        return;
    }
    
}