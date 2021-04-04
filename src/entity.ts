import * as Phaser from 'phaser';

//Base functionality for all entities.
export interface IEntity {
    init:()=>void;
    update:(number)=>void;
}