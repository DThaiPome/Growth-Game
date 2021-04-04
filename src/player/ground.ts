import * as Phaser from 'phaser';
import * as Player from './player';

export interface IGround {
    init:() => void;
    update:(deltaTime: number) => void;
}

export class Ground extends Phaser.GameObjects.Rectangle implements IGround {
    private player: Player.PlayerRectangle;

    public constructor(scene: Phaser.Scene, y: number, player: Player.IPlayer) {
        super(scene, (player as Player.PlayerRectangle).x, y, 15000, 3000, 0x111111);
        this.player = player as Player.PlayerRectangle;
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        scene.physics.add.collider(this, this.player, null, null, this);
    }

    public init(): void {
        return;
    }

    public update(deltaTime: number): void {
        this.x = this.player.x;
    }
}