import { HEX_COLOR_CODES } from '../constants/color_codes.js';

const MODULE_NAME_PREFIX = 'arena.js - ';

/**
 * Represents a game session.
 */
export class Arena {
    GRID_CELL_TYPE = {
        WALL: 1,
        EMPTY: 0,
    };

    /**
     * Creates a new arena with walls and empty spaces.
     * @param {PIXI.Application} app - The PIXI application.
     * @param {Object} textures - The textures object.
     * @param {Number} rowsCount - The number of rows in the arena.
     * @param {Number} colsCount - The number of columns in the arena.
     */
    constructor(app, textures, rowsCount, colsCount) {
        this.app = app;
        this.textures = textures;
        this.rowsCount = rowsCount;
        this.colsCount = colsCount;
        this.grid = this.#createGrid(rowsCount, colsCount);
        this.wallWidth = null;
        this.wallHeight = null;
        this.wallsElements = [];
        this.freeSpaceElements = [];
    }

    /**
     * Creates a grid with walls and empty spaces.
     * @param {Number} rowsCount - The number of rows in the grid.
     * @param {Number} colsCount - The number of columns in the grid.
     * @returns {Array} The grid.
    */
    #createGrid(rowsCount, colsCount) {
        const grid = [];
        for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
            const row = [];
            for (let colIndex = 0; colIndex < colsCount; colIndex++) {
                if (rowIndex === 0 || rowIndex === (rowsCount - 1) || colIndex === 0 || colIndex === (colsCount - 1)) {
                    row.push({type: this.GRID_CELL_TYPE.WALL, elem: null}); // outer walls
                } else if ((rowIndex % 2) === 0 && (colIndex % 2) === 0) {
                    row.push({type: this.GRID_CELL_TYPE.WALL, elem: null}); // inner walls
                } else {
                    row.push({type: this.GRID_CELL_TYPE.EMPTY, elem: null}); // empty space
                }
            }
            grid.push(row);
        }
        return grid;
    }

    /**
     * Converts grid coordinates to canvas coordinates.
     * @param {Number} gridX - The x-coordinate on the grid.
     * @param {Number} gridY - The y-coordinate on the grid.
     * @param {Number} [scaleWidthArenaToScreen=1] - The scale factor for width.
     * @param {Number} [scaleHeightArenaToScreen=1] - The scale factor for height.
     * @returns {Object} The canvas coordinates.
     */
    gridToCanvas(gridX, gridY, scaleWidthArenaToScreen = 1, scaleHeightArenaToScreen = 1) {
        const { width: screenWidth, height: screenHeight } = this.app.screen;
        let cellWidth = screenWidth * scaleWidthArenaToScreen / this.colsCount;
        let cellHeight = screenHeight * scaleHeightArenaToScreen / this.rowsCount;
        let canvasX = gridX * cellWidth;
        let y_offset = (screenHeight - (cellHeight * this.rowsCount));
        let canvasY = y_offset + (gridY * cellHeight);
        return { x: canvasX, y: canvasY, cellWidth: cellWidth, cellHeight: cellHeight };
    }

    /**
     * Converts canvas coordinates to grid coordinates.
     * @param {Number} canvasX - The x-coordinate on the canvas.
     * @param {Number} canvasY - The y-coordinate on the canvas.
     * @param {Number} [scaleWidthArenaToScreen=1] - The scale factor for width.
     * @param {Number} [scaleHeightArenaToScreen=1] - The scale factor for height.
     * @returns {Object} The grid coordinates.
     */
    canvasToGrid(canvasX, canvasY, scaleWidthArenaToScreen = 1, scaleHeightArenaToScreen = 1) {
        const { width: screenWidth, height: screenHeight } = this.app.screen;
        let cellWidth = screenWidth * scaleWidthArenaToScreen / this.colsCount;
        let cellHeight = screenHeight * scaleHeightArenaToScreen / this.rowsCount;
        let gridX = Math.round(canvasX / cellWidth);
        let y_offset = (screenHeight - (cellHeight * this.rowsCount));
        let gridY = Math.round((canvasY - y_offset) / cellHeight);
        return { x: gridX, y: gridY };
    }

    /**
      * Checks if an element will collide with a wall 
      * based on its velocity and position.
      * Information returned in separate horizontal and vertical flags 
      * to allow sliding along walls.
      * @param {PIXI.Sprite} elem - The element to check for collision.
      * @param {Number} [deltaX=0] - The change in x-coordinate.
      * @param {Number} [deltaY=0] - The change in y-coordinate.
      * @param {Function} checkCollisionFn - The collision detection function.
      * @returns {Object} An object with the horizontal and vertical collision flags.
      */
    checkWallCollision(elem, deltaX = 0, deltaY = 0, checkCollisionFn) {
        let willCollideHorizontal = false;
        let willCollideVertical = false;
        const elemBounds = elem.getBounds();
        for (let rowIndex = 0; rowIndex < this.rowsCount; rowIndex++) {
            for (let colIndex = 0; colIndex < this.colsCount; colIndex++) {
                if (this.grid[rowIndex][colIndex].type !== this.GRID_CELL_TYPE.WALL) {
                    continue;
                }
                const wall = this.grid[rowIndex][colIndex].elem;
                const wallBounds = wall.getBounds();

                if (!willCollideHorizontal) {
                    willCollideHorizontal = checkCollisionFn(elemBounds.minX, elemBounds.minY, elemBounds.width, elemBounds.height, wallBounds.x, wallBounds.y, wallBounds.width, wallBounds.height, deltaX);
                }
                if (!willCollideVertical) {
                    willCollideVertical = checkCollisionFn(elemBounds.minX, elemBounds.minY, elemBounds.width, elemBounds.height, wallBounds.x, wallBounds.y, wallBounds.width, wallBounds.height, 0, deltaY);
                }
            }
        }
        return {horizontal: willCollideHorizontal, vertical: willCollideVertical};
    }

    /**
     * Returns random empty space coordinates.
     * @param {Number} [scaleWidthArenaToScreen=1] - The scale factor for width.
     * @param {Number} [scaleHeightArenaToScreen=1] - The scale factor for height.
     * @returns {Object} The random empty space coordinates.
     */
    randomEmptySpace(scaleWidthArenaToScreen = 1, scaleHeightArenaToScreen = 1) {
        const { width: screenWidth, height: screenHeight } = this.app.screen;
        let rowIndex = Math.floor(Math.random() * this.rowsCount);
        let colIndex = Math.floor(Math.random() * this.colsCount);
        while (this.grid[rowIndex][colIndex].type === this.GRID_CELL_TYPE.WALL) {
            rowIndex = Math.floor(Math.random() * this.rowsCount);
            colIndex = Math.floor(Math.random() * this.colsCount);
        }
        
        const x_coord = this.gridToCanvas(colIndex, rowIndex, screenWidth, screenHeight, scaleWidthArenaToScreen, scaleHeightArenaToScreen).x;
        const y_coord = this.gridToCanvas(colIndex, rowIndex, screenWidth, screenHeight, scaleWidthArenaToScreen, scaleHeightArenaToScreen).y;
        return { x: x_coord, y: y_coord };
    }

    /**
     * Draws the arena on the screen.
     * @param {Number} [scaleWidthArenaToScreen=1] - The scale factor for width.
     * @param {Number} [scaleHeightArenaToScreen=1] - The scale factor for height.
     */
    draw(scaleWidthArenaToScreen = 1, scaleHeightArenaToScreen = 1) {
        const { width: screenWidth, height: screenHeight } = this.app.screen;
        this.wallWidth = screenWidth * scaleWidthArenaToScreen / this.colsCount;
        this.wallHeight = screenHeight * scaleHeightArenaToScreen / this.rowsCount;
        console.log(this);

        for (let rowIndex = 0; rowIndex < this.rowsCount; rowIndex++) {
            for (let colIndex = 0; colIndex < this.colsCount; colIndex++) {
                const { x, y, cellWidth, cellHeight } = this.gridToCanvas(colIndex, rowIndex, scaleWidthArenaToScreen, scaleHeightArenaToScreen);
                if (this.grid[rowIndex][colIndex].type === this.GRID_CELL_TYPE.WALL) {
                    let elem = new PIXI.Sprite(this.textures.wall);
                    elem.width = cellWidth;
                    elem.height = cellHeight;
                    elem.x = x;
                    elem.y = y;
                    this.grid[rowIndex][colIndex].elem = elem;
                    this.app.stage.addChild(elem);
                } else {
                    let elem = new PIXI.Graphics();
                    elem.rect(x, y, cellWidth, cellHeight);
                    elem.fill(HEX_COLOR_CODES.BLACK);
                    this.grid[rowIndex][colIndex].elem = elem;
                    this.app.stage.addChild(elem);
                }
            }
        }
    }

    /**
     * Redraws the arena on the screen.
     * Used when the screen is resized.
     * @param {Number} [scaleWidthArenaToScreen=1] - The scale factor for width.
     * @param {Number} [scaleHeightArenaToScreen=1] - The scale factor for height.
     */
    redraw(scaleWidthArenaToScreen = 1, scaleHeightArenaToScreen = 1) {
        const { width: screenWidth, height: screenHeight } = this.app.screen;
        this.wallWidth = screenWidth * scaleWidthArenaToScreen / this.colsCount;
        this.wallHeight = screenHeight * scaleHeightArenaToScreen / this.rowsCount;

        for (let rowIndex = 0; rowIndex < this.rowsCount; rowIndex++) {
            for (let colIndex = 0; colIndex < this.colsCount; colIndex++) {
                const { x, y, cellWidth, cellHeight } = this.gridToCanvas(colIndex, rowIndex, scaleWidthArenaToScreen, scaleHeightArenaToScreen);
                const elem = this.grid[rowIndex][colIndex].elem;
                elem.width = cellWidth;
                elem.height = cellHeight;
                elem.x = x;
                elem.y = y;
            }
        }
    }

    /**
     * Cleans up the arena.
     */
    cleanUp() {
        for (let row of this.grid) {
            for (let cell of row) {
                this.app.stage.removeChild(cell.elem);
            }
        }
        this.grid = null;
        this.wallWidth = null;
        this.wallHeight = null;
        this.wallsElements = null;
        this.freeSpaceElements = null;
    }
}