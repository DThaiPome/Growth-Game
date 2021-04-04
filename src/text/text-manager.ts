import * as Inventory from '../player/inventory';

export interface ITextManager {
    update:(deltaTime: number)=>void;
    pushMessage:(text: string)=>void;
    popMessage:(text: string)=>void;
    setInventory:(inv: Inventory.IInventory)=>void;
}

export class TextManager implements ITextManager {
    private static instance: ITextManager;

    private messageText: HTMLDivElement;
    private messages: Array<string>;

    private inventoryText: HTMLDivElement;
    private inventory: Inventory.IInventory;

    public static getInstance() {
        if (!TextManager.instance) {
            TextManager.instance = new TextManager();
        }
        return TextManager.instance;
    }

    private constructor() {
        this.messageText = document.getElementById("messageText") as HTMLDivElement;
        this.messages = new Array<string>();

        this.inventoryText = document.getElementById("inventoryText") as HTMLDivElement;
    }

    public update(deltaTime: number): void {
        this.updateMessageText();
        this.updateInventoryText();
    }

    private updateMessageText(): void {
        let message = this.messages[this.messages.length - 1];
        if (message) {
            // Filter out everything past |
            this.messageText.textContent = this.filterString(message);
        } else {
            this.messageText.textContent = "";
        }
    }

    private filterString(str: string): string {
        let index = str.lastIndexOf("|");
        return str.substring(0, index == -1 ? str.length : index);
    }

    private updateInventoryText(): void {
        let items = this.inventory.getItems();
        let strings = [];
        items.forEach((value) => {
            strings.push(`${value[1]} of ${this.itemToString(value[0])}`);
        });
        let invString = strings.join(", ");
        let result = `Inventory: ${invString}`;
        this.inventoryText.textContent = result;
    }

    private itemToString(item: Inventory.InventoryItem): string {
        switch(item) {
            case Inventory.InventoryItem.NESeed:
                return "Northeast Seed";
            case Inventory.InventoryItem.NWSeed:
                return "Northwest Seed";
            case Inventory.InventoryItem.SWSeed:
                return "Southwest Seed";
            case Inventory.InventoryItem.SESeed:
                return "Southeast Seed";
            case Inventory.InventoryItem.BigKey:
                return "Big Key";
            case Inventory.InventoryItem.SmallKey:
                return "Small Key";
            default:
                return "Something";
        }
    }

    public pushMessage(text: string): void {
        if (!this.findMessage(text)) {
            this.messages.push(text);
        }
    }

    public popMessage(text: string): void {
        let newMessages = new Array<string>();
        this.messages.forEach((value) => {
            if (!(value === text)) {
                newMessages.push(value);
            }
        });
        this.messages = newMessages;
    }

    private findMessage(text: string): boolean {
        let found = false;
        this.messages.forEach((value) => {
            if (value === text) {
                found = true;
            }
        });
        return found;
    }

    public setInventory(inv: Inventory.IInventory) {
        this.inventory = inv;
    }
}