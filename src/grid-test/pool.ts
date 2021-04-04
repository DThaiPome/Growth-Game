export interface IPoolItem {
    activate: (x: number, y: number) => void;
    deactivate: () => void;
}

export interface IObjectPool {
    /**
     * Add objects to the pool that are deactivated by default
     * 
     * @param count number of objects to add
     */
    add: (count: number) => void;
    /**
     * Get an object from the pool and activate it
     */
    pop: (x: number, y: number) => IPoolItem;
    
    /**
     * Return an item to the pool
     */
    push: (item: IPoolItem) => void;
}

export class ObjectPool implements IObjectPool {
    private pool: Array<IPoolItem>;
    private objectFactory: (x: number, y: number)=>IPoolItem;

    public constructor(objectFactory: (x: number, y: number)=>IPoolItem) {
        this.pool = new Array<IPoolItem>();
        this.objectFactory = objectFactory;
    }

    public add (count: number): void {
        for(let i = 0; i < count; i++) {
            let obj = this.objectFactory(0, 0);
            obj.deactivate();
            this.pool.push(obj);
        }
    }

    public pop (x: number, y: number): IPoolItem {
        let obj = this.pool.pop();
        if (!obj) {
            this.add(1);
            return this.pop(x, y);
        }
        obj.activate(x, y);
        return obj;
    }

    public push (item: IPoolItem): void {
        item.deactivate();
        this.pool.push(item);
    }
}