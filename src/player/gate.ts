import * as Phaser from 'phaser'
import * as Player from './player';
import * as Inventory from './inventory';
import * as TextManager from '../text/text-manager';
import * as Collectable from '../collectables/collectables';

export interface IGate {
    init:()=>void;
    update:(deltaTime: number)=>void;
}

abstract class AGate extends Phaser.GameObjects.Star implements IGate {
    protected player: Player.IPlayer;
    private keys: number;
    private keyType: Inventory.InventoryItem;
    private distance: number;

    protected opened: boolean;

    public constructor(scene: Phaser.Scene, x: number, y: number, points: number, innerR: number, outerR: number, color: number,
        keys: number, keyType: Inventory.InventoryItem, distance: number, player: Player.IPlayer) {
        super(scene, x, y, points, innerR, outerR, color);
        scene.add.existing(this);
        this.player = player;
        this.keys = keys;
        this.distance = distance;
        this.keyType = keyType;

        this.opened = false;
    }

    public init(): void {

    }

    public update(deltaTime: number): void {
        if (this.checkDistance()) {
            this.updateDistance(deltaTime, true);
            if (!this.opened && this.checkOpen()) {
                this.opened = true;
                this.onOpen();
            }
        } else {
            this.updateDistance(deltaTime, false);
        }
    }

    private checkDistance(): boolean {
        let playerObject = this.player as unknown as Phaser.GameObjects.Rectangle;
        let distance = Math.sqrt(Math.pow((playerObject.x - this.x), 2)
        + Math.pow((playerObject.y - this.y), 2));
        if (distance <= this.distance) {
            return true;
        } 
    }

    private checkOpen(): boolean {
        let items = this.player.getInventory().getItems();
            let count = 0;
            items.forEach((value) => {
                if (value[0] == this.keyType) {
                    count = value[1];
                }
            })
            if (count >= this.keys) {
                this.player.getInventory().removeItem(this.keyType, this.keys);
                return true;
            }
    }

    protected abstract updateDistance(deltaTime: number, close: boolean): void;
    
    protected abstract onOpen(): void;
}

export class Goal extends AGate {
    private message: string;

    public constructor(scene: Phaser.Scene, x: number, y: number, keys: number, player: Player.IPlayer) {
        super(scene, x, y, 7, 500, 600, 0xFFFF00, keys, Inventory.InventoryItem.BigKey, 750, player);
        scene.add.existing(this);
        this.message = `Find ${keys} big keys to open this gate!`;
    }

    protected updateDistance(deltaTime: number, close: boolean): void {
        if (!this.opened) {
            if (close) {
                TextManager.TextManager.getInstance().pushMessage(this.message);
            } else {
                TextManager.TextManager.getInstance().popMessage(this.message);
            }
        }
    }

    protected onOpen(): void {
        TextManager.TextManager.getInstance().popMessage(this.message);
        this.message = "You beat the game!";
        TextManager.TextManager.getInstance().pushMessage(this.message);
    }
}

export class Portal extends AGate {
    private message: string;

    public constructor(scene: Phaser.Scene, x: number, y: number, keys: number, player: Player.IPlayer) {
        super(scene, x, y, 4, 20, 200, 0x550099, keys, Inventory.InventoryItem.SmallKey, 400, player);
        scene.add.existing(this);
        this.message = `Find ${keys} small keys to open this portal|${x}`;
    }

    protected updateDistance(deltaTime: number, close: boolean): void {
        if (close) {
            TextManager.TextManager.getInstance().pushMessage(this.message);
        } else {
            TextManager.TextManager.getInstance().popMessage(this.message);
        }
    }

    protected onOpen(): void {
        TextManager.TextManager.getInstance().popMessage(this.message);
        this.message = `You opened the portal, and big keys came out!|${this.x}`;
        this.spawnKeys();
    }

    private spawnKeys(): void {
        let count = Math.floor(Math.random() * 2) + 2;
        let positions = [
            [1, 1],
            [-1, 1],
            [-1, -1],
            [1, -1]
        ];
        let distance = 300;
        let i = Math.floor(Math.random() * positions.length);
        
        for(let j = 0; j < count; i = (i + 1) % positions.length) {
            let key = new Collectable.BigKey(this.scene, this.x + positions[i][0] * distance, this.y + positions[i][1] * distance);
            this.scene.add.existing(key);
            this.player.addCollectable(key);
            j++;
        }
    }
}