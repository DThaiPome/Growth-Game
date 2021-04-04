import * as Phaser from 'phaser';
import * as Grid from './grid';

// Stores a grid and provides singleton access
export interface IGridManager {
    getGrid:()=>Grid.IGrid;
    initGrid:(grid: Grid.IGrid)=>void;
}

export class GridManager implements IGridManager {
    private static instance: IGridManager;

    private grid: Grid.IGrid;

    private constructor() {}

    public static getInstance(): IGridManager {
        if (!GridManager.instance) {
            GridManager.instance = new GridManager();
        }
        return GridManager.instance;
    }

    public getGrid (): Grid.IGrid {
        return this.grid;
    }

    public initGrid (grid: Grid.IGrid): void {
        this.grid = grid;
    }
}