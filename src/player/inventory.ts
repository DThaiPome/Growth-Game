import * as Phaser from 'phaser'

export enum InventoryItem {
    NESeed,
    NWSeed,
    SWSeed,
    SESeed,
    BigKey,
    SmallKey
}

export interface IInventory {
    /**
     * Add some of this item to the inventory
     */
    addItem:(item: InventoryItem, count: number)=>void;
    /**
     * Remove some of this item to the inventory, or return false if no
     * items of this type are present
     */
    removeItem:(item: InventoryItem, count: number)=>boolean;
    /**
     * Create a list of all of the present inventory items, and their
     * counts.
     */
    getItems:()=>Array<[InventoryItem, number]>;
}

export class Inventory implements IInventory {
    private items: Map<InventoryItem, number>;

    public constructor() {
        this.items = new Map<InventoryItem, number>();
    }

    public addItem (item: InventoryItem, count: number): void {
        count = count < 0 ? 0 : count;
        let currentCount = this.items.get(item);
        currentCount = currentCount ? currentCount : 0;
        this.items.set(item, currentCount + count);
    }

    public removeItem (item: InventoryItem, count: number): boolean {
        count = count < 0 ? 0 : count;
        let currentCount = this.items.get(item);
        if (!currentCount) {
            return false;
        }

        let newCount = currentCount - count;
        if (newCount == 0) {
            this.items.delete(item);
        } else {
            this.items.set(item, newCount);
        }
        return true;
    }

    public getItems (): [InventoryItem, number][] {
        let itemArray = new Array<[InventoryItem, number]>();
        this.items.forEach((value, key) => {
            itemArray.push([key, value]);
        });
        return itemArray;
    }

}