import * as Phaser from 'phaser'
import * as GridManager  from '../grid-test/grid-manager';
import * as Grid from '../grid-test/grid';
import * as Inventory from './inventory';
import * as Seed from '../collectables/collectables';
import * as Ground from './ground';
import * as Text from '../text/text-manager';

export interface IPlayer {
    init:() => void;
    update:(deltaTime: number )=> void;
    getPos:()=>[number, number];
    getInventory:()=>Inventory.IInventory;
    addCollectable:(coll: Seed.ICollectable)=>void;
}

export class PlayerRectangle extends Phaser.GameObjects.Rectangle implements IPlayer {
    private wObj: Phaser.Input.Keyboard.Key;
    private sObj: Phaser.Input.Keyboard.Key;
    private aObj: Phaser.Input.Keyboard.Key;
    private dObj: Phaser.Input.Keyboard.Key;

    private speed: number;

    private hasGravity: boolean;

    private inv: Inventory.Inventory;

    private ground: Ground.Ground;

    public constructor(scene: Phaser.Scene, x:number, y:number) {
        super(scene, x, y, 30, 30, 0xFF0000);
        //scene.physics.world.enableBody(this);
        scene.physics.add.existing(this, false);
        scene.add.existing(this);

        this.ground = new Ground.Ground(scene, 1750, this);
    }

    public getPos (): [number, number] {
        return [this.x, this.y];
    }
    
    public init (): void {
        this.wObj = this.scene.input.keyboard.addKey('W');
        this.sObj = this.scene.input.keyboard.addKey('S');
        this.aObj = this.scene.input.keyboard.addKey('A');
        this.dObj = this.scene.input.keyboard.addKey('D');
        this.speed = 120;

        this.scene.input.keyboard.addKey('right').on('down', () => {
            this.spawnPath(Inventory.InventoryItem.NESeed);
        });
        this.scene.input.keyboard.addKey('up').on('down', () => {
            this.spawnPath(Inventory.InventoryItem.NWSeed);
        });
        this.scene.input.keyboard.addKey('left').on('down', () => {
            this.spawnPath(Inventory.InventoryItem.SWSeed);
        });
        this.scene.input.keyboard.addKey('down').on('down', () => {
            this.spawnPath(Inventory.InventoryItem.SESeed);
        });

        this.inv = new Inventory.Inventory();
        this.inv.addItem(Inventory.InventoryItem.NESeed, 4);
        this.inv.addItem(Inventory.InventoryItem.NWSeed, 4);
        Text.TextManager.getInstance().setInventory(this.inv);
    }

    public update (deltaTime: number): void {
        this.hasGravity = !this.checkForTiles();
        let body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(this.hasGravity);
        if (!this.hasGravity) {
            body.velocity.y = 0;
        }
        let input = this.getMoveInput();
        this.move(input, deltaTime);

        this.ground.update(deltaTime);
    }

    private checkForTiles (): boolean {
        let tilesToCheck = [
            [0,0],
            [1, 0],
            [1, 1],
            [0, 1],
            [-1, 1],
            [-1, 0],
            [-1, -1],
            [0, -1],
            [1, -1],
        ];
        let grid: Grid.IGrid = GridManager.GridManager.getInstance().getGrid();
        let gridPos = grid.realToGrid([this.x, this.y]);
        let found = false;
        tilesToCheck.forEach((value) => {
            if (!found) {
                value[0] += gridPos[0];
                value[1] += gridPos[1];
                found = grid.queryTile(value as [number, number]);
            }
        });
        return found;
    }

    private getMoveInput (): [number, number] {
        let x: number = 0;
        let y: number = 0;
        if (this.wObj.isDown) {
            y -= 1;
        }
        if (this.sObj.isDown) {
            y += 1;
        }
        if (this.aObj.isDown) {
            x -= 1;
        }
        if (this.dObj.isDown) {
            x += 1;
        }
        return [x, y];
    }

    private move (input: [number, number], deltaTime: number): void {
        input[0] *= this.speed;
        input[1] *= this.speed;
        
        this.body.velocity.x = input[0];
        if (!this.hasGravity) {
            this.body.velocity.y = input[1];
        }
    }

    private spawnPath (direction: Inventory.InventoryItem): void {
        if ((this.hasGravity && this.body.velocity.y != 0) || !this.inv.removeItem(direction, 1)) {
            return;
        }

        let grid = GridManager.GridManager.getInstance().getGrid();

        let x = 0;
        let y = 0;

        switch(direction) {
            case Inventory.InventoryItem.NESeed:
                x = 1;
                y = -1;
                break;
            case Inventory.InventoryItem.NWSeed:
                x = -1;
                y = -1;
                break;
            case Inventory.InventoryItem.SWSeed:
                x = -1;
                y = 1;
                break;
            case Inventory.InventoryItem.SESeed:
                x = 1;
                y = 1;
                break;
        }

        x = Math.floor((Math.random() * 7) + 17) * x;
        y = Math.floor((Math.random() * 7) + 17) * y;

        let playerGridPos = grid.realToGrid([this.x, this.y]);
        let destPos = [x + playerGridPos[0], y + playerGridPos[1]];
        let untilSeed = Math.floor((Math.random() * 8) + 20);
        grid.findPath(playerGridPos, destPos as [number, number]).forEach((value) => {
            grid.setTile(value);

            untilSeed--;
            if (untilSeed == 0) {
                let pos = grid.gridToReal(value);
                let seed = new Seed.Seed(this.scene, pos[0], pos[1]);
                this.addCollectable(seed);
                untilSeed = Math.floor((Math.random() * 4) + 10);
            }
        });
    }

    private onCollectSeed(seed: Inventory.InventoryItem): void {
        this.inv.addItem(seed, 1);
    }

    public getInventory(): Inventory.IInventory {
        return this.inv;
    }

    public addCollectable(coll: Seed.ICollectable): void {
        this.scene.physics.add.collider(this, coll as unknown as Phaser.GameObjects.GameObject, null, 
        (player, seed) => {
            if (!this.hasGravity) {
                this.onCollectSeed((seed as Seed.Seed).getCollectable());
                seed.destroy();
                return false;
            } else {
                return false;
            }
        }, this);
    }
}