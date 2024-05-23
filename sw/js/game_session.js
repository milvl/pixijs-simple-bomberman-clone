import { HEX_COLOR_CODES } from "./color_codes.js";
// import * as PIXI from 'pixi.js';

const SCALE_WIDTH_ARENA_TO_SCREEN = 1;
const SCALE_HEIGHT_ARENA_TO_SCREEN = 0.8;
const SCALE_HEIGHT_HUD_TO_SCREEN = 0.2;
const SCALE_HEIGHT_HUD_TEXT_TO_HUD = 0.8;
const SCALE_WIDTH_HUD_TEXT_TO_HUD = 1/3;
const SCALE_RADIUS_HUD_ROUND_RECT_TO_HEIGHT = 0.3;

const SCALE_WIDTH_OFFSET_TIME_TEXT_TO_HUD = 1/10;
const SCALE_WIDTH_OFFSET_SCORE_TEXT_TO_HUD = 1/2;
const SCALE_WIDTH_OFFSET_LIVES_TEXT_TO_HUD = 9/10;

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

export class GameSessionManager {
    constructor(app, settings, screenContent, sprites, audio, rows_count, cols_count) {
        this.app = app;
        this.endless = settings.endless;
        this.screenContent = screenContent;
        this.sprites = sprites;
        this.audio = audio;
        this.arena = new Arena(app, rows_count, cols_count);
        settings.endless ? this.level = 1 : this.level = undefined;
        this.width = app.screen.width;
        this.height = app.screen.height;
        this.started = false;

        this.stats = {
            score: 0,
            time: 0,
            lives: settings.lives,
        };

        this.lives_left = settings.lives;
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

    #drawStats() {      // TODO
        const { width: window_width, height: window_height } = this.app.screen;
        let hud_background = new PIXI.Graphics();
        this.screenContent.hud_elems = [];
        let hud_width = window_width;
        let hud_height = window_height * SCALE_HEIGHT_HUD_TO_SCREEN;
        hud_background.rect(0, 0, hud_width, hud_height);
        hud_background.fill(HEX_COLOR_CODES.GRAY);      //TODO - texture
        this.screenContent.hud_elems.push(hud_background);
        this.app.stage.addChild(hud_background);

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

        const score_text = `Score: \n${this.stats.score}`;
        const score = this.#getBespokeHudText(score_text, hud_width, hud_height, SCALE_HEIGHT_HUD_TEXT_TO_HUD, SCALE_WIDTH_HUD_TEXT_TO_HUD);
        score.x = (hud_width * SCALE_WIDTH_OFFSET_SCORE_TEXT_TO_HUD) - (score.width / 2);
        score.y = (hud_height - (hud_height * SCALE_HEIGHT_HUD_TEXT_TO_HUD)) / 2;
        this.screenContent.hud_elems.push(score);
        app.stage.addChild(score);

        const time_text = `Time: \n${parseTime(this.stats.time)}`;
        const time = this.#getBespokeHudText(time_text, hud_width, hud_height, SCALE_HEIGHT_HUD_TEXT_TO_HUD, SCALE_WIDTH_HUD_TEXT_TO_HUD);
        time.x = (hud_width * SCALE_WIDTH_OFFSET_TIME_TEXT_TO_HUD) - (time.width / 2);
        time.y = (hud_height - (hud_height * SCALE_HEIGHT_HUD_TEXT_TO_HUD)) / 2;
        this.screenContent.hud_elems.push(time);
        app.stage.addChild(time);

        const lives_text = `Lives: \n${this.stats.lives}`;
        const lives = this.#getBespokeHudText(lives_text, hud_width, hud_height, SCALE_HEIGHT_HUD_TEXT_TO_HUD, SCALE_WIDTH_HUD_TEXT_TO_HUD);
        lives.x = (hud_width * SCALE_WIDTH_OFFSET_LIVES_TEXT_TO_HUD) - (lives.width / 2);
        lives.y = (hud_height - (hud_height * SCALE_HEIGHT_HUD_TEXT_TO_HUD)) / 2;
        this.screenContent.hud_elems.push(lives);
        app.stage.addChild(lives);
    }

    /**
     * Starts the game session.
     */
    start() {
        this.arena.draw();
        this.#drawStats();
        this.started = true;
        // TODO: add player and enemies
    }

    redraw() {
        this.app.stage.removeChildren();
        this.arena.draw();
        this.#drawStats();
    }

    update(delta) {
        if (!this.started) {
            return;
        }
        this.stats.time = this.stats.time + delta.elapsedMS;
        // console.log('Time:', this.stats.time);

        this.#drawStats();
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
     * Draws the arena on the screen.
     * // TODO add support for textures
     */
    draw() {
        const { width, height } = this.app.screen;
        for (let row_index = 0; row_index < this.rows_count; row_index++) {
            for (let c = 0; c < this.cols_count; c++) {
                const { x, y, cellWidth, cellHeight } = this.#gridToCanvas(c, row_index, width, height);
                const cell = new PIXI.Graphics();
                if (this.grid[row_index][c] === GRID_CELL_TYPE.WALL) {
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