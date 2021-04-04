import * as Phaser from 'phaser';
import * as TestScene from './test-scene';


const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',
 
  type: Phaser.AUTO,
 
  scale: {
    width:  window.innerWidth * 0.8,
    height: window.innerHeight * 0.8
  },
 
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 750 },
      debug: false,
    },
  },
   scene:  TestScene.GameScene,
  parent: 'game',
  backgroundColor: '#678987',
};
 
export class TestGame extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    super(config);
  }
}

window.onload = () => {
  var game = new TestGame(gameConfig);
}