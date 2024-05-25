import { HEX_COLOR_CODES } from "./color_codes.js";
// import * as PIXI from 'pixi.js';

const MODULE_NAME_PREFIX = 'game_session.js - ';

const SCALE_WIDTH_ARENA_TO_SCREEN = 1;
const SCALE_HEIGHT_ARENA_TO_SCREEN = 0.8;
const SCALE_HEIGHT_HUD_TO_SCREEN = 0.2;
const SCALE_HEIGHT_HUD_TEXT_TO_HUD = 0.8;
const SCALE_WIDTH_HUD_TEXT_TO_HUD = 1/3;
const SCALE_RADIUS_HUD_ROUND_RECT_TO_HEIGHT = 0.3;

const SCALE_WIDTH_OFFSET_TIME_TEXT_TO_HUD = 1/10;
const SCALE_WIDTH_OFFSET_SCORE_TEXT_TO_HUD = 1/2;
const SCALE_WIDTH_OFFSET_LIVES_TEXT_TO_HUD = 9/10;

const SCALE_WIDTH_PLAYER_TO_WALL = 0.8;
const SCALE_HEIGHT_PLAYER_TO_WALL = 0.8;

const INDEX_SCREEN_CONTENT_HUD_BACKGROUND = 0;
const INDEX_SCREEN_CONTENT_HUD_ROUND_RECT = 1;
const INDEX_SCREEN_CONTENT_HUD_TEXT_TIME = 2;
const INDEX_SCREEN_CONTENT_HUD_TEXT_SCORE = 3;
const INDEX_SCREEN_CONTENT_HUD_TEXT_LIVES = 4;

const GRID_CELL_TYPE = {
    WALL: 1,
    EMPTY: 0,
};
const LEVELS_COUNT = 10;

/**
 * Parses milliseconds into a time string.
 * @param {Number} milliseconds - The time in milliseconds. 
 * @returns {String} The time string in the format "mm:ss" or "hh:mm:ss" if hours are present.
 */
function parseTime(milliseconds) {
    if (milliseconds < 0) {
        milliseconds = 0;
    }
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds = seconds % 60;

    if (hours > 0) {
        minutes = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    else {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
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
function checkCollision(e1_x, e1_y, e1_width, e1_height, e2_x, e2_y, e2_width, e2_height, e1_deltaX = 0, e1_deltaY = 0) {
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

export class GameSessionManager {
    constructor(app, settings, screenContent, sprites, audio, key_inputs, rows_count, cols_count) {
        this.app = app;
        this.endless = settings.endless;
        this.screenContent = screenContent;
        this.sprites = sprites;
        this.audio = audio;
        this.key_inputs = key_inputs;

        this.prevWidth = this.app.screen.width;
        this.prevHeight = this.app.screen.height;
        this.basis_change = false;
        this.started = false;

        this.movementSpeed = 85;

        this.stats = {
            score: 0,
            time: 0,
            lives: settings.lives,
        };

        this.lives_left = settings.lives;

        this.arena = new Arena(app, rows_count, cols_count);
        this.player = null;
        this.enemies = [];
        this.bombs = [];
        settings.endless ? this.level = 1 : this.level = undefined;

        this.movementMock = this.app.screen.height * 0.11;
        console.log(MODULE_NAME_PREFIX, 'Height:', this.app.screen.height);
    }

    /**
     * Returns a PIXI.Text object with the text for hud.
     * @param {String} text - The text to display.
     * @param {Number} hudWidth - The width of the hud.
     * @param {Number} hudHeight - The height of the hud.
     * @param {Number} maxScaleHeightTextToHud - The maximum scale of the text height to the hud height.
     * @param {Number} maxScaleWidthTextToHud - The maximum scale of the text width to the hud width.
     * @returns {PIXI.Text} The PIXI.Text object.
     */
    #getBespokeHudText(text, hudWidth, hudHeight, maxScaleHeightTextToHud, maxScaleWidthTextToHud) {
        let maxHeight = hudHeight * maxScaleHeightTextToHud;
        let maxWidth = hudWidth * maxScaleWidthTextToHud;
        let fontSize = 1;
        let logoText = new PIXI.Text({'text': text, 'style': {
            fontFamily: 'Arial',
            fontSize: fontSize,
            fill: HEX_COLOR_CODES.WHITE,  // text color
            align: 'center'}
        });
        
        while (logoText.height < maxHeight) {
            fontSize += 1;
            logoText.style.fontSize = fontSize;
        }
        logoText.style.fontSize = fontSize - 1;
        while (logoText.width > maxWidth) {
            fontSize -= 1;
            logoText.style.fontSize = fontSize;
        }
        return logoText;
    }

    #drawStats() {
        if (this.screenContent.hud_elems) {
            for (let elem of this.screenContent.hud_elems) {
                this.app.stage.removeChild(elem);
            }
            this.screenContent.hud_elems = [];
        }

        const { width: window_width, height: window_height } = this.app.screen;
        let hud_background = new PIXI.Graphics();
        this.screenContent.hud_elems = [];
        let hud_width = window_width;
        let hud_height = window_height * SCALE_HEIGHT_HUD_TO_SCREEN;

        // draw background for hud
        hud_background.rect(0, 0, hud_width, hud_height);
        hud_background.fill(HEX_COLOR_CODES.GRAY);      //TODO - texture
        this.screenContent.hud_elems.push(hud_background);
        this.app.stage.addChild(hud_background);

        // draw round rect for hud
        let round_rect = new PIXI.Graphics();
        let overlap_offset = 0 - hud_height / 2;
        round_rect.roundRect(0, 
                             overlap_offset, 
                             window_width, 
                             hud_height + Math.abs(overlap_offset), 
                             hud_height * SCALE_RADIUS_HUD_ROUND_RECT_TO_HEIGHT);
        round_rect.fill(HEX_COLOR_CODES.BLACK);
        this.screenContent.hud_elems.push(round_rect);
        this.app.stage.addChild(round_rect);

        // draw text for time
        const time_text = `Time: \n${parseTime(this.stats.time)}`;
        const time = this.#getBespokeHudText(time_text, hud_width, hud_height, SCALE_HEIGHT_HUD_TEXT_TO_HUD, SCALE_WIDTH_HUD_TEXT_TO_HUD);
        time.x = (hud_width * SCALE_WIDTH_OFFSET_TIME_TEXT_TO_HUD) - (time.width / 2);
        time.y = (hud_height - (hud_height * SCALE_HEIGHT_HUD_TEXT_TO_HUD)) / 2;
        this.screenContent.hud_elems.push(time);
        app.stage.addChild(time);

        // draw text for score
        const score_text = `Score: \n${this.stats.score}`;
        const score = this.#getBespokeHudText(score_text, hud_width, hud_height, SCALE_HEIGHT_HUD_TEXT_TO_HUD, SCALE_WIDTH_HUD_TEXT_TO_HUD);
        score.x = (hud_width * SCALE_WIDTH_OFFSET_SCORE_TEXT_TO_HUD) - (score.width / 2);
        score.y = (hud_height - (hud_height * SCALE_HEIGHT_HUD_TEXT_TO_HUD)) / 2;
        this.screenContent.hud_elems.push(score);
        app.stage.addChild(score);

        // draw text for lives
        const lives_text = `Lives: \n${this.stats.lives}`;
        const lives = this.#getBespokeHudText(lives_text, hud_width, hud_height, SCALE_HEIGHT_HUD_TEXT_TO_HUD, SCALE_WIDTH_HUD_TEXT_TO_HUD);
        lives.x = (hud_width * SCALE_WIDTH_OFFSET_LIVES_TEXT_TO_HUD) - (lives.width / 2);
        lives.y = (hud_height - (hud_height * SCALE_HEIGHT_HUD_TEXT_TO_HUD)) / 2;
        this.screenContent.hud_elems.push(lives);
        app.stage.addChild(lives);
    }

    #spawnEntity(entity, start_x = null, start_y = null) {
        let wall_width = this.arena.wall_width
        let wall_height = this.arena.wall_height
        entity.width = wall_width * SCALE_WIDTH_PLAYER_TO_WALL;
        entity.height = wall_height * SCALE_HEIGHT_PLAYER_TO_WALL;
        let { x, y } = this.arena.randomEmptySpace();   //TODO - add support for custom spawn location
        entity.x = x + (wall_width - entity.width) / 2;
        entity.y = y + (wall_height - entity.height) / 2;
        this.app.stage.addChild(entity);
    }

    #redrawEntity(entity) {
        app.stage.removeChild(entity);
        app.stage.addChild(entity);
        const wall_width = this.arena.wall_width
        const wall_height = this.arena.wall_height
        entity.width = wall_width * SCALE_WIDTH_PLAYER_TO_WALL;
        entity.height = wall_height * SCALE_HEIGHT_PLAYER_TO_WALL;
        
        // transform old coordinates to new coordinates
        const newWidthScale = this.app.screen.width / this.prevWidth;
        const newHeightScale = this.app.screen.height / this.prevHeight;
        entity.x = entity.x * newWidthScale;
        entity.y = entity.y * newHeightScale;
    }

    /**
     * Updates the entity.
     * @param {PIXI.Sprite} entity - The entity to update.
     * @param {Number} deltaX - The change in x-coordinate.
     * @param {Number} deltaY - The change in y-coordinate. 
     */
    #updateEntity(entity, deltaX, deltaY) {
        // if (deltaX !== 0 || deltaY !== 0) {
            // rotate the player sprite by tiny amount as a movement indicator
            // entity.rotation += 0.01 * this.movementMock;
            // if (entity.rotation > 0.1 || entity.rotation < -0.1)
            //     this.movementMock = -this.movementMock;
        // }

        // check if the new position is valid before updating
        if (!this.arena.checkWallCollision(entity, deltaX)) {
            entity.x += deltaX;
        }
        if (!this.arena.checkWallCollision(entity, 0, deltaY)) {
            entity.y += deltaY;
        }
        this.app.stage.removeChild(entity);
        this.app.stage.addChild(entity);

        // TODO hit check
    }

    /**
     * Starts the game session.
     */
    start() {
        this.arena.draw();
        this.#drawStats();
        // DEBUG add player sprite (now using bunny sprite)
        this.player = new PIXI.Sprite(this.sprites.bomb);
        this.#spawnEntity(this.player);

        this.started = true;
        // TODO: add player and enemies
    }

    redraw() {
        this.basis_change = true;
        
        this.arena.draw();
        this.#drawStats();
        this.#redrawEntity(this.player);

        this.prevWidth = this.app.screen.width;
        this.prevHeight = this.app.screen.height;
        this.movementSpeed = this.app.screen.height * 0.11;
        this.basis_change = false;
    }

    #updateStats() {
        this.screenContent.hud_elems[INDEX_SCREEN_CONTENT_HUD_TEXT_TIME].text = `Time: \n${parseTime(this.stats.time)}`;
        this.screenContent.hud_elems[INDEX_SCREEN_CONTENT_HUD_TEXT_SCORE].text = `Score: \n${this.stats.score}`;
        this.screenContent.hud_elems[INDEX_SCREEN_CONTENT_HUD_TEXT_LIVES].text = `Lives: \n${this.stats.lives}`;
    }


    update(delta) {
        if (!this.started) {
            console.error('Game session not started yet.');
            return;
        }
        this.stats.time = this.stats.time + delta.elapsedMS;

        this.#updateStats();

        if (!this.basis_change) {
            const distance = this.movementSpeed * (delta.elapsedMS / 1000); // convert ms to seconds

            let deltaX = 0;
            let deltaY = 0;

            if (this.key_inputs.left.isDown)
                deltaX -= distance;
            if (this.key_inputs.right.isDown) 
                deltaX += distance;
            if (this.key_inputs.up.isDown) 
                deltaY -= distance;
            if (this.key_inputs.down.isDown) 
                deltaY += distance;
            
            this.#updateEntity(this.player, deltaX, deltaY);
        }
    }
}


/**
 * Represents a game session.
 */
class Arena {
    /**
     * Creates a new arena with walls and empty spaces.
     * @param {Number} rows_count - The number of rows in the arena.
     * @param {Number} cols_count - The number of columns in the arena.
     */
    constructor(app, rows_count, cols_count) {
        this.app = app;
        this.rows_count = rows_count;
        this.cols_count = cols_count;
        this.grid = this.#createGrid(rows_count, cols_count);
        this.wall_width = null;
        this.wall_height = null;
        this.wallsElements = [];
        this.freeSpaceElements = [];
    }

    /**
     * Creates a grid with walls and empty spaces.
     * @param {Number} rows_count - The number of rows in the grid.
     * @param {Number} cols_count - The number of columns in the grid.
     * @returns {Array} The grid.
    */
    #createGrid(rows_count, cols_count) {
        const grid = [];
        for (let row_index = 0; row_index < rows_count; row_index++) {
            const row = [];
            for (let col_index = 0; col_index < cols_count; col_index++) {
                if (row_index === 0 || row_index === (rows_count - 1) || col_index === 0 || col_index === (cols_count - 1)) {
                    row.push(GRID_CELL_TYPE.WALL); // outer walls
                } else if ((row_index % 2) === 0 && (col_index % 2) === 0) {
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
        let cellWidth = screenWidth * SCALE_WIDTH_ARENA_TO_SCREEN / this.cols_count;
        let cellHeight = screenHeight * SCALE_HEIGHT_ARENA_TO_SCREEN / this.rows_count;
        let canvasX = gridX * cellWidth;
        let y_offset = (screenHeight - (cellHeight * this.rows_count));
        let canvasY = y_offset + (gridY * cellHeight);
        return { x: canvasX, y: canvasY, cellWidth, cellHeight };
    }

    /**
     * Converts canvas coordinates to grid coordinates.
     * @param {Number} canvasX - The x-coordinate on the canvas.
     * @param {Number} canvasY - The y-coordinate on the canvas.
     * @param {Number} screenWidth - The width of the screen.
     * @param {Number} screenHeight - The height of the screen.
     * @returns {Object} The grid coordinates.
     */
    canvasToGrid(canvasX, canvasY, screenWidth, screenHeight) {
        let cellWidth = screenWidth * SCALE_WIDTH_ARENA_TO_SCREEN / this.cols_count;
        let cellHeight = screenHeight * SCALE_HEIGHT_ARENA_TO_SCREEN / this.rows_count;
        let gridX = Math.floor(canvasX / cellWidth);
        let y_offset = (screenHeight - (cellHeight * this.rows_count));
        let gridY = Math.floor((canvasY - y_offset) / cellHeight);
        return { gridX, gridY };
    }

    /**
      * Checks if an element will collide with a wall 
      * based on its velocity and position.
      * @param {PIXI.Sprite} elem - The element to check for collision.
      * @param {Number} [deltaX=0] - The change in x-coordinate.
      * @param {Number} [deltaY=0] - The change in y-coordinate.
      */
    checkWallCollision(elem, deltaX = 0, deltaY = 0) {
        const elemBounds = elem.getBounds();
        for (const wall of this.wallsElements) {
            const wallBounds = wall.getBounds();
            if (checkCollision(elemBounds.x, elemBounds.y, elemBounds.width, elemBounds.height, wallBounds.x, wallBounds.y, wallBounds.width, wallBounds.height, deltaX, deltaY)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns random empty space coordinates.
     * @returns {Object} The random empty space coordinates.
     */
    randomEmptySpace() {
        let row_index = Math.floor(Math.random() * this.rows_count);
        let col_index = Math.floor(Math.random() * this.cols_count);
        while (this.grid[row_index][col_index] === GRID_CELL_TYPE.WALL) {
            row_index = Math.floor(Math.random() * this.rows_count);
            col_index = Math.floor(Math.random() * this.cols_count);
        }
        
        const x_coord = this.#gridToCanvas(col_index, row_index, this.app.screen.width, this.app.screen.height).x;
        const y_coord = this.#gridToCanvas(col_index, row_index, this.app.screen.width, this.app.screen.height).y;
        return { x: x_coord, y: y_coord };
    }

    /**
     * Draws the arena on the screen.
     * // TODO add support for textures
     */
    draw() {
        if (this.wallsElements) {
            for (let wall of this.wallsElements) {
                this.app.stage.removeChild(wall);
            }
            this.wallsElements = [];
        }
        if (this.freeSpaceElements) {
            for (let freeSpace of this.freeSpaceElements) {
                this.app.stage.removeChild(freeSpace);
            }
            this.freeSpaceElements = [];
        }

        this.wall_width = this.app.screen.width * SCALE_WIDTH_ARENA_TO_SCREEN / this.cols_count;
        this.wall_height = this.app.screen.height * SCALE_HEIGHT_ARENA_TO_SCREEN / this.rows_count;

        const { width, height } = this.app.screen;
        for (let row_index = 0; row_index < this.rows_count; row_index++) {
            for (let col_index = 0; col_index < this.cols_count; col_index++) {
                const { x, y, cellWidth, cellHeight } = this.#gridToCanvas(col_index, row_index, width, height);
                const elem = new PIXI.Graphics();
                elem.rect(x, y, cellWidth, cellHeight);
                if (this.grid[row_index][col_index] === GRID_CELL_TYPE.WALL) {
                    elem.fill(HEX_COLOR_CODES.GRAY);
                    this.wallsElements.push(elem);
                } else {
                    elem.fill(HEX_COLOR_CODES.BLACK);
                    this.freeSpaceElements.push(elem);
                }
                app.stage.addChild(elem);
            }
        }
    }
}