import * as Grid from './grid-test/grid';
import * as Tile from './grid-test/grid-tile';
import * as Player from './player/player';
import * as GridManager from './grid-test/grid-manager';
import * as BigSeedCollection from './collectables/big-seed-collection';
import * as Text from './text/text-manager';
import * as Gate from './player/gate';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
    active: false,
    visible: false,
    key: 'Game',
};

export class GameScene extends Phaser.Scene {
    private grid: Grid.IGrid;
    private player: Player.IPlayer;

    //Time of the last frame update.
    private lastTime: number;

    private path: Array<[number, number]>;

    private color: number;

    private timeElapsed : number;

    private seedColl : BigSeedCollection.IBigSeedCollection;
    private portalColl : BigSeedCollection.IBigSeedCollection;
    private testPortal : Gate.Portal;

    private goal : Gate.IGate;

    constructor() {
        super(sceneConfig);
    }

    public create() {
        this.lastTime = this.game.getTime();
        this.timeElapsed = 0;
        this.grid = new Grid.DebugGrid(this, 20, (scene: Phaser.Scene, pos: [number, number], tileSize: number): Tile.IGridTile => {
            return new Tile.ColorTile(scene, pos[0], pos[1], tileSize, 0x00FF00);
        });
        GridManager.GridManager.getInstance().initGrid(this.grid);
        this.path = new Array<[number, number]>();
        // let spaceDown = this.input.keyboard.addKey('space');
        // spaceDown.on('down', (event) => {
        //     this.newPath();
        // });

        this.player = new Player.PlayerRectangle(this, 0, 0);
        this.player.init();

        this.seedColl = new BigSeedCollection.BigSeedCollection(this, this.player);
        this.seedColl.spawnSeeds(250, 350, 500, [-10000, -5000], [20000, 5000]);

        this.portalColl = new BigSeedCollection.PortalCollection(this, this.player);
        this.portalColl.spawnSeeds(20, 750, 500, [-10000, -5000], [20000, 3000]);


        this.input.keyboard.addKey('space').on('down', () => {
            this.cameras.main.zoom = this.cameras.main.zoom == 1 ? 0.1 : 1;
        });

        // this.newPath();

        this.cameras.main.startFollow(this.player);

        Text.TextManager.getInstance().pushMessage("Get to the big star at the top of the world!");     
        
        this.goal = new Gate.Goal(this, 0, -6000, 5, this.player);
    }

    public update() {
        var deltaTime: number = this.getDeltaTime();
        this.player.update(deltaTime);
        Text.TextManager.getInstance().update(deltaTime);
        this.goal.update(deltaTime);
        this.portalColl.update(deltaTime);
        //let camera = this.cameras.cameras[0];
        //camera.x = -this.player.getPos()[0] + camera.width / 2;
        //camera.y = -this.player.getPos()[1] + camera.height / 2;
    }

    private newPath() {
        this.path.forEach((pos: [number, number]) => {
            this.grid.destroyTile(pos);
        });
        let x = Math.floor((Math.random() * 5) + 5);
        let y = Math.floor((Math.random() * 5) + 5);
        this.path = this.grid.findPath([1, 1], [x, y]);
        var length = this.path.length;
        var i = 0;
        this.path.forEach((pos: [number, number]) => {
            let digit = 0xF * (i / length);
            this.color = digit + (16 * digit) + (256 * digit) * (4096 * digit) + (65536 * digit) + (1048576 * digit);
            this.grid.setTile(pos);
            i++;
        });
    }

    private getDeltaTime(): number {
        var newTime: number = this.game.getTime();
        var deltaTime = newTime - this.lastTime;
        this.lastTime = newTime;
        return deltaTime;
    }
}
