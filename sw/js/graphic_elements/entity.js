const MODULE_NAME_PREFIX = 'entity.js - ';

/**
 * Represents an entity in the arena.
 */
export class Entity {
    /**
     * Represents an entity in the arena.
     * @param app {PIXI.Application} - The PIXI application.
     * @param arena {Arena} - The arena where the entity will be spawned.
     * @param texture {PIXI.Sprite} - The graphic element that represents the entity.
     * @param scaleToWall [number=1] - The scale factor to apply to the entity.
     */
    constructor(app, arena, texture, scaleToWall = 1) {
        this.app = app;
        this.arena = arena;
        this._elem = new PIXI.Sprite(texture);
        this._visible = this.elem.visible;
        this.scaleToWall = scaleToWall;
    }

    get elem() {
        return this._elem;
    }

    get visible() {
        return this._visible;
    }

    set visible(value) {
        this._visible = value;
        this.elem.visible = value;
    }

    /**
     * Gets the grid position of the entity.
     * @returns {object} - The grid position of the entity.
     */
    get gridPosition() {
        const { x, y } = this.elem;
        const { x: gridX, y: gridY } = this.arena.canvasToGrid(x, y);
        return { gridX, gridY };
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
            ({ x, y } = this.arena.randomEmptySpace()); // TODO check if this is working
        }
        this.elem.x = x + (wallWidth - this.elem.width) / 2;
        this.elem.y = y + (wallHeight - this.elem.height) / 2;
        this.app.stage.addChild(this.elem);
    }

    /**
     * Redraws the entity in the arena.
     * @param prevScreenSize {object} - The previous screen size.
     */
    redraw(prevScreenSize) {
        const { width: prevScreenWidth, height: prevScreenHeight } = prevScreenSize;
        const { width: newScreenWidth, height: newScreenHeight } = this.app.screen;
        
        const wallWidth = this.arena.wallWidth
        const wallHeight = this.arena.wallHeight
        this.elem.width = wallWidth * this.scaleToWall;
        this.elem.height = wallHeight * this.scaleToWall;
        const newWidthScale = newScreenWidth / prevScreenWidth;
        const newHeightScale = newScreenHeight / prevScreenHeight;
        this.elem.x = this.elem.x * newWidthScale;
        this.elem.y = this.elem.y * newHeightScale;
    }

    /**
     * Checks if two rectangles (will) collide.
     * @param {Number} e1_x - The x-coordinate of the first element.
     * @param {Number} e1_y - The y-coordinate of the first element.
     * @param {Number} e1_width - The width of the first element.
     * @param {Number} e1_height - The height of the first element.
     * @param {Number} e2_x - The x-coordinate of the second element.
     * @param {Number} e2_y - The y-coordinate of the second element.
     * @param {Number} e2_width - The width of the second element.
     * @param {Number} e2_height - The height of the second element.
     * @param {Number} [e1_deltaX=0] - The delta x-coordinate of the first element (optional).
     * @param {Number} [e1_deltaY=0] - The delta y-coordinate of the first element (optional).
     * @returns {Boolean} True if the elements collide, false otherwise.
     */
    #checkCollision(e1_x, e1_y, e1_width, e1_height, e2_x, e2_y, e2_width, e2_height, e1_deltaX = 0, e1_deltaY = 0) {
        const e1_nextX = e1_x + e1_deltaX;
        const e1_nextY = e1_y + e1_deltaY;

        const e1_left = e1_nextX;
        const e1_right = e1_nextX + e1_width;
        const e1_top = e1_nextY;
        const e1_bottom = e1_nextY + e1_height;

        const e2_left = e2_x;
        const e2_right = e2_x + e2_width;
        const e2_top = e2_y;
        const e2_bottom = e2_y + e2_height;

        return !(e1_left >= e2_right ||
                e1_right <= e2_left ||
                e1_top >= e2_bottom ||
                e1_bottom <= e2_top);
    }

    /**
     * Checks if the entity was hit any of the entities provided.
     * @param entitisesToCheckHitBy {Array} - The entities to check hit by.
     * @returns {Boolean} True if the entity will hit any of the entities provided, false otherwise.
     */
    #hitCheckSelf(entitisesToCheckHitBy) {
        const thisBounds = this.elem.getBounds();
        for (let entity of entitisesToCheckHitBy) {
            const entityBounds = entity.elem.getBounds();
            if (this.#checkCollision(thisBounds.minX, thisBounds.minY, thisBounds.width, thisBounds.height, entityBounds.minX, entityBounds.minY, entityBounds.width, entityBounds.height)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if the entity will collide with the obstacles.
     * @param entities {Array} - The entities to check collision with.
     * @param deltaX {number} - The x-coordinate delta.
     * @param deltaY {number} - The y-coordinate delta.
     * @param passable [boolean=false] - If the entity can pass through the obstacles.
     * @returns {object} - The collision check result.
     */
    #checkEntityCollision(entities, deltaX, deltaY, passable = false) {
        let willCollideHorizontal = false;
        let willCollideVertical = false;
        const { minX: x, minY: y, width: width, height: height } = this.elem.getBounds();

        for (let entity of entities) {
            let { minX: obstacleX, minY: obstacleY, width: obstacleWidth, height: obstacleHeight } = entity.elem.getBounds();

            // if the entity is already colliding and it can pass through, skip the collision check
            if (passable && this.#checkCollision(x, y, width, height, obstacleX, obstacleY, obstacleWidth, obstacleHeight, 0, 0)) {
                return { horizontal: false, vertical: false };
            }

            let willCollideHorizontalObstacle = this.#checkCollision(x, y, width, height, obstacleX, obstacleY, obstacleWidth, obstacleHeight, deltaX, 0);
            let willCollideVerticalObstacle = this.#checkCollision(x, y, width, height, obstacleX, obstacleY, obstacleWidth, obstacleHeight, 0, deltaY);
            
            willCollideHorizontal = willCollideHorizontal || willCollideHorizontalObstacle;
            willCollideVertical = willCollideVertical || willCollideVerticalObstacle;
            
            // if the entity will collide in both directions, stop checking
            if (willCollideHorizontal && willCollideVertical) {
                break;
            }
        }
        return { horizontal: willCollideHorizontal, vertical: willCollideVertical };
    }

    /**
     * Updates the entity position in the arena.
     * @param deltaX [number=0] - The x-coordinate delta.
     * @param deltaY [number=0] - The y-coordinate delta.
     * @param obstacles {Array} - The obstacles to check collision with.
     * @param bombs {Array} - The bombs to check collision with.
     */
    #updateMovement(deltaX = 0, deltaY = 0, obstacles = [], bombs = []) {
        // first arena collision check
        let { horizontal: willCollideHorizontalWall, vertical: willCollideVerticalWall } = this.arena.checkWallCollision(this.elem, deltaX, deltaY, this.#checkCollision);
        let { horizontal: willCollideHorizontalObstacle, vertical: willCollideVerticalObstacle } = this.#checkEntityCollision(obstacles ? obstacles : [], deltaX, deltaY, false);
        let { horizontal: willCollideHorizontalBomb, vertical: willCollideVerticalBomb } = this.#checkEntityCollision(bombs ? bombs : [], deltaX, deltaY, true);

        // allow or disallow movement (separetely to allow sliding on walls and obstacles)
        if (!willCollideHorizontalWall && !willCollideHorizontalObstacle && !willCollideHorizontalBomb) {
            this.elem.x += deltaX;
        }
        if (!willCollideVerticalWall && !willCollideVerticalObstacle && !willCollideVerticalBomb) {
            this.elem.y += deltaY;
        }
    }

    /**
     * Updates the entity. Here only the movement is updated.
     * Other updates such as animations, etc. can be added as 
     * extra functionality in the child classes.
     * @param updateData {object} - The data to update the entity.
     * @returns {object} - The updated entity data.
     */
    update(updateData) {
        const res = {};

        if (updateData.entitiesToCheckHitBy && this.#hitCheckSelf(updateData.entitiesToCheckHitBy)) {
            res.hit = true;
        }
        else {
            res.hit = false;
        }

        const { deltaX: deltaX, deltaY: deltaY, obstacles: obstacles, bombs: bombs } = updateData;
        this.#updateMovement(deltaX, deltaY, obstacles, bombs);
        res.x = this.elem.x;
        res.y = this.elem.y;

        return res;
    }

    /**
     * Moves the entity to the top of the canvas 
     * elements displayed.
     */
    moveToTop() {
        this.app.stage.removeChild(this.elem);
        this.app.stage.addChild(this.elem);
    }

    /**
     * Removes the entity from the arena.
     */
    remove() {
        this.app.stage.removeChild(this.elem);
    }
}