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
     * @param {Number} e1Width - The width of the first element.
     * @param {Number} e1Height - The height of the first element.
     * @param {Number} e2_x - The x-coordinate of the second element.
     * @param {Number} e2_y - The y-coordinate of the second element.
     * @param {Number} e2Width - The width of the second element.
     * @param {Number} e2Height - The height of the second element.
     * @param {Number} [e1DeltaX=0] - The delta x-coordinate of the first element (optional).
     * @param {Number} [e1DeltaY=0] - The delta y-coordinate of the first element (optional).
     * @returns {Boolean} True if the elements collide, false otherwise.
     */
    #checkCollision(e1_x, e1_y, e1Width, e1Height, e2_x, e2_y, e2Width, e2Height, e1DeltaX = 0, e1DeltaY = 0) {
        const e1_nextX = e1_x + e1DeltaX;
        const e1_nextY = e1_y + e1DeltaY;

        const e1_left = e1_nextX;
        const e1_right = e1_nextX + e1Width;
        const e1_top = e1_nextY;
        const e1_bottom = e1_nextY + e1Height;

        const e2_left = e2_x;
        const e2_right = e2_x + e2Width;
        const e2_top = e2_y;
        const e2_bottom = e2_y + e2Height;

        return !(e1_left >= e2_right ||
                e1_right <= e2_left ||
                e1_top >= e2_bottom ||
                e1_bottom <= e2_top);
    }

    /**
     * Checks if the entity will hit any of the entities provided.
     * @param entitisesToCheckHitBy {Array} - The entities to check hit by.
     * @returns {Boolean} True if the entity will hit any of the entities provided, false otherwise.
     */
    #hitCheck(entitisesToCheckHitBy) {
        const thisBounds = this.elem.getBounds();
        for (let entity of entitisesToCheckHitBy) {
            const entityBounds = entity.elem.getBounds();
            if (checkCollision(thisBounds.minX, thisBounds.minY, thisBounds.width, thisBounds.height, entityBounds.minX, entityBounds.minY, entityBounds.width, entityBounds.height)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Checks if the entity will collide with the obstacles.
     * @param obstacles {Array} - The obstacles to check collision with.
     * @param deltaX {number} - The x-coordinate delta.
     * @param deltaY {number} - The y-coordinate delta.
     * @returns {object} - The collision check result.
     */
    #checkObstaclesCollision(obstacles, deltaX, deltaY) {
        let willCollideHorizontal = false;
        let willCollideVertical = false;
        const { minX: x, minY: y, width: width, height: height } = this.elem.getBounds();

        for (let obstacle of obstacles) {
            let { minX: obstacleX, minY: obstacleY, width: obstacleWidth, height: obstacleHeight } = obstacle.getBounds();
            let { horizontal: willCollideHorizontalObstacle, vertical: willCollideVerticalObstacle } = this.#checkCollision(x, y, width, height, obstacleX, obstacleY, obstacleWidth, obstacleHeight, deltaX, deltaY);
            
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
     * @param deltaX {number} - The x-coordinate delta.
     * @param deltaY {number} - The y-coordinate delta.
     * @param obstacles {Array} - The obstacles to check collision with.
     */
    #updateMovement(deltaX, deltaY, obstacles) {
        // first arena collision check
        let {horizontal: willCollideHorizontalWall, vertical: willCollideVerticalWall} = this.arena.checkWallCollision(this.elem, deltaX, deltaY, this.#checkCollision);
        let {horizontal: willCollideHorizontalObstacle, vertical: willCollideVerticalObstacle} = this.#checkObstaclesCollision(obstacles ? obstacles : [], deltaX, deltaY);

        // allow or disallow movement (separetely to allow sliding on walls and obstacles)
        if (!willCollideHorizontalWall && !willCollideHorizontalObstacle) {
            this.elem.x += deltaX;
        }
        if (!willCollideVerticalWall && !willCollideVerticalObstacle) {
            this.elem.y += deltaY;
        }
    }

    /**
     * Updates the entity. Here only the movement is updated.
     * Other updates such as animations, etc. can be added as 
     * extra functionality in the child classes.
     * @param updateData {object} - The data to update the entity.
     */
    update(updateData) {
        const res = {};
        if (updateData.entitisesToCheckHitBy && this.#hitCheck(updateData.entitisesToCheckHitBy)) {
            res.hit = true;
        }

        const { deltaX: deltaX, deltaY: deltaY } = updateData;
        const { obstacles: obstacles } = updateData;
        this.#updateMovement(deltaX, deltaY, obstacles);
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