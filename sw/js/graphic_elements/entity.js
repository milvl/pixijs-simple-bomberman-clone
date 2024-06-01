const MODULE_NAME_PREFIX = 'entity.js - ';

/**
 * Represents an entity in the arena.
 */
export class Entity {
    /**
     * Represents an entity in the arena.
     * @param app {PIXI.Application} - The PIXI application.
     * @param arena {Arena} - The arena where the entity will be spawned.
     * @param graphicElem {PIXI.Sprite} - The graphic element that represents the entity.
     * @param scaleToWall {number} - The scale factor to apply to the entity.
     */
    constructor(app, arena, graphicElem, scaleToWall) {
        this.app = app;
        this.arena = arena;
        this._elem = graphicElem;
        this.scaleToWall = scaleToWall;
    }

    get elem() {
        return this._elem;
    }

    /**
     * Spawns the entity in the arena.
     * If start_x and start_y are provided, the entity will spawn at that position.
     * Otherwise, it will spawn at a random empty space.
     * @param [start_x=null] {number} - The x coordinate where the entity will spawn.
     * @param [start_y=null] {number} - The y coordinate where the entity will spawn.
     */
    spawn(start_x = null, start_y = null) {
        let wallWidth = this.arena.wallWidth
        let wallHeight = this.arena.wallHeight
        this.elem.width = wallWidth * this.scaleToWall;
        this.elem.height = wallHeight * this.scaleToWall;

        // if entity scalling is negative, force it to be positive (to avoid spawning issues)
        // TODO remove for testing xd
        if (this.elem.scale.x < 0) {
            this.elem.scale.x *= -1;
        }
        if (this.elem.scale.y < 0) {
            this.elem.scale.y *= -1;
        }

        let { x, y } = { x: null, y: null };
        if (start_x !== null && start_y !== null) {
            x = start_x;
            y = start_y;
        } else {
            ({ x, y } = this.arena.randomEmptySpace());
        }
        this.elem.x = x + (wallWidth - this.elem.width) / 2;
        this.elem.y = y + (wallHeight - this.elem.height) / 2;
        this.app.stage.addChild(this.elem);
    }

    /**
     * Enables the entity visibility in the arena.
     */
    show() {
        this.elem.visible = true;
    }

    /**
     * Hides the entity from the arena.
     */
    hide() {
        this.elem.visible = false;
    }

    /**
     * Removes the entity from the arena.
     */
    remove() {
        this.app.stage.removeChild(this.elem);
    }
}