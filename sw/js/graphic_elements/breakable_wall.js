// import * as PIXI from 'pixi.js';
import { Entity } from './entity.js';

const MODULE_NAME_PREFIX = 'breakable_wall.js - ';

export class BreakableWall extends Entity {
    /**
     * Represents a breakable wall in the arena.
     * @param app {PIXI.Application} - The PIXI application.
     * @param arena {Arena} - The arena where the breakable wall will be spawned.
     * @param texture {PIXI.Sprite} - The graphic element that represents the breakable wall.
     */
    constructor(app, arena, texture) {
        super(app, arena, texture);
    }
}