export class MinimumHeap<T> {
    public heap: Array<T>;
    private greaterThan:(t1:T, t2:T) => boolean;

    public constructor(greaterThan:(t1:T, t2:T) => boolean) {
        this.heap = new Array<T>();
        this.greaterThan = greaterThan;
    }

    public push(t: T): void {
        this.heap.push(t);
        if (this.heap.length > 1) {
            let currentIndex = this.heap.length - 1;
            
            while (currentIndex > 1 && this.greaterThan(this.heap[Math.floor(currentIndex / 2)], this.heap[currentIndex])) {
                this.swapIndex(Math.floor(currentIndex / 2), currentIndex);
                currentIndex = Math.floor(currentIndex / 2);
            }
        }
    } 

    public pop(): T {
        let head = this.heap[0];
        this.heap[0] = this.heap[this.heap.length - 1];
        this.heap.splice(this.heap.length - 1, 1);

        let parent = 0;
        let leftChildIndex = 2 * parent + 1;
        let rightChildIndex = 2 * parent + 2;
        let left = leftChildIndex > this.heap.length ? null : this.heap[leftChildIndex];
        let right = rightChildIndex > this.heap.length ? null : this.heap[rightChildIndex];
        
        do {
            if (!left && !right) {
                break;
            } else if (!right && left && this.greaterThan(this.heap[parent], left)) {
                this.swapIndex(parent, leftChildIndex);
                parent = leftChildIndex;
            } else if (left && right) {
                if (this.greaterThan(right, left) && this.greaterThan(this.heap[parent], left)) {
                    this.swapIndex(parent, leftChildIndex);
                    parent = leftChildIndex;
                } else if (this.greaterThan(left, right) && this.greaterThan(this.heap[parent], right)) {
                    this.swapIndex(parent, rightChildIndex);
                    parent = rightChildIndex;
                }
            }

            leftChildIndex = 2 * parent + 1;
            rightChildIndex = 2 * parent + 2;
            left = leftChildIndex > this.heap.length ? null : this.heap[leftChildIndex];
            right = rightChildIndex > this.heap.length ? null : this.heap[rightChildIndex];
        } while (left && right && (this.greaterThan(this.heap[parent], left) || this.greaterThan(this.heap[parent], right)));

        return head;
    }

    private swapIndex(a: number, b: number): void {
        let t = this.heap[a];
        this.heap[a] = this.heap[b];
        this.heap[b] = t;
    }
}