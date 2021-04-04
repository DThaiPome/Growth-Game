import * as Phaser from 'phaser';
import * as Collectables from './collectables';
import * as Player from '../player/player';
import * as Gate from '../player/gate';

export interface IBigSeedCollection {
    spawnSeeds:(seeds: number, minDistance: number, variance: number, origin: [number, number], range: [number, number]) => void;
    update:(deltaTime: number)=>void;
}

// TODO: ABSTRACT THIS SO WE CAN DO PORTALS TOO
abstract class ACollectionSpawner implements IBigSeedCollection {
    protected collectables: Array<Phaser.GameObjects.GameObject>;
    private scene: Phaser.Scene;
    private player: Player.IPlayer;

    private collectableFactory: (scene: Phaser.Scene, x: number, y: number) => Phaser.GameObjects.GameObject;
    private updateFactory: (obj: Phaser.GameObjects.GameObject, deltaTime: number) => void;

    public constructor(scene: Phaser.Scene, player: Player.IPlayer, factory: (scene: Phaser.Scene, x: number, y: number) => Phaser.GameObjects.GameObject,
    update: (obj: Phaser.GameObjects.GameObject, deltaTime: number) => void) {
        this.collectables = new Array<Phaser.GameObjects.GameObject>();
        this.scene = scene;
        this.player = player;
        this.collectableFactory = factory;
        this.updateFactory = update;
    }
    
    public update(deltaTime: number): void {
        this.collectables.forEach((value) => {
            if (value) {
                this.updateFactory(value, deltaTime);
            }
        });
    }

    public spawnSeeds(seeds: number, minDistance: number, variance: number, origin: [number, number], range: [number, number]): void {
        let rows = Math.floor(range[1] / minDistance);
        let cols = Math.floor(range[0] / minDistance);
        let totalSize = rows * cols;
        seeds = seeds < totalSize ? seeds : totalSize;
        let cells = new Array<boolean>();
        let i;
        for(i = 0; i < seeds; i++) {
            cells.push(true);
        }
        for(; i < totalSize; i++) {
            cells.push(false);
        }
        cells.forEach((value, index) => {
            let rand = Math.floor(Math.random() * totalSize);
            cells[index] = cells[rand];
            cells[rand] = value;
        });
        
        // Place the seeds

        for(let r = 0; r < rows; r++) {
            for(let c = 0; c < cols; c++) {
                let index = (r * rows) + c;
                if (cells[index]) {
                    let x = origin[0] + (c * minDistance) + (Math.random() * variance);
                    let y = origin[1] + (r * minDistance) + (Math.random() * variance);
                    let coll = this.collectableFactory(this.scene, x, y);
                    this.collectables.push(coll);
                }
            }
        }
    }
}

export class BigSeedCollection extends ACollectionSpawner {
    
    public constructor(scene: Phaser.Scene, player: Player.IPlayer) {
        super(scene, player, (scene, x, y) => {
            let seed = new Collectables.BigSeed(scene, x, y);
            player.addCollectable(seed);
            return seed;
        }, (obj, deltaTime) => {
            return;
        });
    }
}

export class PortalCollection extends ACollectionSpawner {
    private portals: Array<Gate.Portal>;

    public constructor(scene: Phaser.Scene, player: Player.IPlayer) {
        super(scene, player, (scene, x, y) => {
            let portal = new Gate.Portal(scene, x, y, 8, player);
            this.portals.push(portal);
            return portal;
        }, (obj, deltaTime) => {
            (obj as unknown as Gate.Portal).update(deltaTime);
        });
        this.portals = new Array<Gate.Portal>();
    }

    public update(deltaTime: number): void {
        this.portals.forEach((value) => {
            value.update(deltaTime);
        });
    }
}