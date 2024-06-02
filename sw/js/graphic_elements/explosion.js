import { Entity } from './entity.js';
import { DURATIONS } from '/js/constants/durations.js';

const MODULE_NAME_PREFIX = 'explosion.js - ';

export class Explosion {
    #DURATION_MS_EXPLOSION = DURATIONS.MS_EXPLOSION;

    /**
     * Creates an explosion in the arena.
     * @param app {PIXI.Application} - The PIXI application.
     * @param arena {Arena} - The arena where the explosion will be spawned.
     * @param gridX {number} - The x coordinate in the grid.
     * @param gridY {number} - The y coordinate in the grid.
     * @param textures {Object} - The textures object.
     * @param scaleToWall {number} - The scale factor to apply to the explosion.
     */
    constructor(app, arena, texture, scaleToWall) {
        this.app = app;
        this.arena = arena;
        this.texture = texture;
        this.scaleToWall = scaleToWall;
        this._explosionInstances = [];
        this.time = 0;
        this._isFinished = false;
    }

    /**
     * Gets the explosion instances (graphics elements).
     * @returns {Array} The explosion instances.
     */
    get explosionInstances() {
        return this._explosionInstances;
    }

    /**
     * Gets if the explosion has finished.
     * @returns {boolean} If the explosion has finished.
     */
    get isFinished() {
        return this._isFinished;
        // TODO REMOVE
    }

    /**
     * Redraws the explosion in the arena.
     */
    redraw() {
        this._explosionInstances.forEach(explosion => {
            explosion.redraw();
        });
    }

    /**
     * Spawns the explosion in the arena.
     * @param gridX {number} - The x coordinate in the grid.
     * @param gridY {number} - The y coordinate in the grid.
     * @throws {Error} - Invalid bomb detonation coordinates.
     */
    spawn(gridX, gridY) {
        // sanity check
        if (gridX <= 0 || gridX >= this.arena.colsCount - 1 || gridY <= 0 || gridY >= this.arena.rowsCount - 1) {
            console.error(MODULE_NAME_PREFIX, 'Invalid bomb detonation coordinates:', gridX, gridY);
            throw new Error('Invalid bomb detonation coordinates');
        }

        // explosion positions
        const {centerX, centerY} = {centerX: gridX, centerY: gridY};
        const {northX, northY} = {northX: gridX, northY: gridY - 1};
        const {southX, southY} = {southX: gridX, southY: gridY + 1};
        const {eastX, eastY} = {eastX: gridX + 1, eastY: gridY};
        const {westX, westY} = {westX: gridX - 1, westY: gridY};
        const spread = [{x: northX, y: northY}, {x: southX, y: southY}, {x: eastX, y: eastY}, {x: westX, y: westY}];

        const spawnCoords = [];
        
        // create explosion sprites (now with graphics
        // center
        let explosion = new ExplosionInstance(this.app, this.arena, this.texture, this.scaleToWall);
        spawnCoords.push(this.arena.gridToCanvas(centerX, centerY));

        this._explosionInstances.push(explosion);
        // all directions
        for (let dir of spread) {
            if (this.arena.grid[dir.y][dir.x].type === this.arena.GRID_CELL_TYPE.EMPTY) {
                explosion = new ExplosionInstance(this.app, this.arena, this.texture, this.scaleToWall);
                spawnCoords.push(this.arena.gridToCanvas(dir.x, dir.y));
                this._explosionInstances.push(explosion);
            }
        }

        for (let i = 0; i < this._explosionInstances.length; i++) {
            const { x, y } = spawnCoords[i];
            this._explosionInstances[i].spawn(x, y);
        }
    }

    /**
     * Updates the explosion in the arena.
     * @param updateData {object} - The update data.
     * @returns {object} The updated explosion data.
     */
    update(updateData) {
        const { deltaTimeMS: deltaTimeMS } = updateData;
        this.time += deltaTimeMS;

        // explosion finished
        if (this.time >= this.#DURATION_MS_EXPLOSION) {
            this._explosionInstances.forEach(explosion => {
                explosion.remove();
            });
            this._explosionInstances = [];
            this._isFinished = true;
        }

        const res = {
            time: this.time,
        }
        return res;
    }

    /**
     * Removes the explosion from the arena. 
     * This is useful when the arena is reset.
     */
    remove() {
        this._explosionInstances.forEach(explosion => {
            explosion.remove();
        });
        this._explosionInstances = [];
    }
}

class ExplosionInstance extends Entity {
    /**
     * Represents an explosion in the arena.
     * @param app {PIXI.Application} - The PIXI application.
     * @param arena {Arena} - The arena where the explosion will be spawned.
     * @param texture {PIXI.Sprite} - The graphic element that represents the explosion.
     * @param scaleToWall {number} - The scale factor to apply to the explosion.
     */
    constructor(app, arena, texture, scaleToWall) {
        super(app, arena, texture, scaleToWall);
    }
}