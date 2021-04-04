import * as Phaser from 'phaser'
import * as Inventory from '../player/inventory';

export interface ICollectable {
    /** Return what kind of seed this is, as an inventory item type */
    getCollectable:()=>Inventory.InventoryItem;
}

abstract class Collectable extends Phaser.GameObjects.Rectangle implements ICollectable {
    private item: Inventory.InventoryItem;

    public constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, color: number) {
        super(scene, x, y, width, height, color);
        scene.add.existing(this);
        this.item = this.setItem();
        scene.physics.add.existing(this);
        (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    }
    
    protected abstract setItem(): Inventory.InventoryItem;

    public getCollectable (): Inventory.InventoryItem {
        return this.item;
    }
}

/** For basic four directional seeds */
export class Seed extends Collectable {
    public constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 10, 10, 0x888800);
    }

    protected setItem (): Inventory.InventoryItem {
        let rand = Math.floor(Math.random() * 2);
        switch(rand) {
            case 0:
                return Inventory.InventoryItem.NESeed;
            case 1:
                return Inventory.InventoryItem.NWSeed;
        }
    }
}
/** For special items */
export class BigSeed extends Collectable {
    public constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 50, 50, 0xAA00AA);
    }

    /** TODO: Make this give other items, once they exist */
    protected setItem (): Inventory.InventoryItem {
        let rand = Math.floor(Math.random() * 3);
        switch(rand) {
            case 0:
                return Inventory.InventoryItem.SESeed;
            case 1:
                return Inventory.InventoryItem.SWSeed;
            case 2:
                return Inventory.InventoryItem.SmallKey;
        }
    }
}

export class BigKey extends Collectable {
    public constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 25, 25, 0xBB8833);
    }

    /** TODO: Make this give other items, once they exist */
    protected setItem (): Inventory.InventoryItem {
        return Inventory.InventoryItem.BigKey;
    }
}