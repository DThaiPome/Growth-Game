import * as Phaser from 'phaser';
import {IPoolItem} from './pool';

abstract class RectangleEntity extends Phaser.GameObjects.Rectangle implements IPoolItem {
    constructor(scene:Phaser.Scene, x:number, y:number, width:number, height:number, fillcolor:number) {
        super(scene, x, y, width, height, fillcolor);
        scene.add.existing(this);
    }

    public activate (x: number, y: number): void {
        this.setX(x);
        this.setY(y);
        this.setVisible(true);
    }

    public deactivate (): void {
        this.setVisible(false);
    }
}

export interface IGridTile {
    init:()=>void;
    vanquish:()=>void;
}

export class DebugTile extends RectangleEntity implements IGridTile {
    private sceneRef: Phaser.Scene;

    constructor(scene:Phaser.Scene,  x:number, y:number, size:number) {
        super(scene, x, y, size, size, 0xFFFFFF);
    }

    public init(): void { }

    public vanquish(): void { }
}

export class ColorTile extends RectangleEntity implements IGridTile {
    private sceneRef: Phaser.Scene;

    constructor(scene:Phaser.Scene,  x:number, y:number, size:number, fillcolor:number) {
        super(scene, x, y, size, size, fillcolor);
    }

    public init(): void { }

    public vanquish(): void { }
}