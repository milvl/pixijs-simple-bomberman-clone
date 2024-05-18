import { HEX_COLOR_CODES } from "./color_codes.js";

const WIDTH_SCALE_ARENA_TO_SCREEN = 1;
const HEIGHT_SCALE_ARENA_TO_SCREEN = 0.8;

const GRID_CELL_TYPE = {
    WALL: 1,
    EMPTY: 0,
};

/**
 * Represents a game session.
 */
export class Arena {
    /**
     * Creates a new arena with walls and empty spaces.
     * @param {Number} rows - The number of rows in the arena.
     * @param {Number} cols - The number of columns in the arena.
     */
    constructor(app, rows, cols) {
        this.app = app;
        this.rows = rows;
        this.cols = cols;
        this.grid = this.#createGrid(rows, cols);
    }

    /**
     * Creates a grid with walls and empty spaces.
     * @param {Number} rows - The number of rows in the grid.
     * @param {Number} cols - The number of columns in the grid.
     * @returns {Array} The grid.
    */
    #createGrid(rows, cols) {
        const grid = [];
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
                    row.push(GRID_CELL_TYPE.WALL); // outer walls
                } else if (r % 2 === 0 && c % 2 === 0) {
                    row.push(GRID_CELL_TYPE.WALL); // inner walls
                } else {
                    row.push(GRID_CELL_TYPE.EMPTY); // empty space
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
     * @param {Number} screenWidth - The width of the screen.
     * @param {Number} screenHeight - The height of the screen.
     * @returns {Object} The canvas coordinates.
     */
    #gridToCanvas(gridX, gridY, screenWidth, screenHeight) {
        let cellWidth = screenWidth * WIDTH_SCALE_ARENA_TO_SCREEN / this.cols;
        let cellHeight = screenHeight * HEIGHT_SCALE_ARENA_TO_SCREEN / this.rows;
        let canvasX = gridX * cellWidth;
        let y_offset = (screenHeight - (cellHeight * this.rows));
        let canvasY = y_offset + (gridY * cellHeight);
        return { x: canvasX, y: canvasY, cellWidth, cellHeight };
    }

    /**
     * Draws the arena on the screen.
     * // TODO add support for textures
     */
    draw() {
        const { width, height } = this.app.screen;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const { x, y, cellWidth, cellHeight } = this.#gridToCanvas(c, r, width, height);
                const cell = new PIXI.Graphics();
                if (this.grid[r][c] === GRID_CELL_TYPE.WALL) {
                    cell.beginFill(HEX_COLOR_CODES.GRAY);
                } else {
                    cell.beginFill(HEX_COLOR_CODES.BLACK);
                }
                cell.drawRect(x, y, cellWidth, cellHeight);
                cell.endFill();
                app.stage.addChild(cell);
            }
        }
    }
}