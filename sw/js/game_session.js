import { HEX_COLOR_CODES } from "./color_codes.js";
import { GameSessionState } from "./game_session_states.js";
// import * as PIXI from 'pixi.js';

const MODULE_NAME_PREFIX = 'game_session.js - ';

const TITLE_FONT_FAMILY = "Emulogic zrEw";
const TEXT_FONT_FAMILY = "Pressstart2p Vav7";

const SCALE_WIDTH_ARENA_TO_SCREEN = 1;
const SCALE_HEIGHT_ARENA_TO_SCREEN = 0.8;
const SCALE_HEIGHT_HUD_TO_SCREEN = 0.2;
// const SCALE_HEIGHT_HUD_TEXT_TO_HUD = 0.8;
const SCALE_HEIGHT_HUD_TEXT_TO_HUD = 0.5;   // TODO NOTE: weird chosen font scaling issue
const SCALE_WIDTH_HUD_TEXT_TO_HUD = 1/3;
const SCALE_RADIUS_HUD_ROUND_RECT_TO_HEIGHT = 0.3;
const SCALE_WIDTH_PAUSE_SIGN_TO_SCREEN = 0.5;
const SCALE_HEIGHT_PAUSE_SIGN_TO_SCREEN = 0.5;

const SCALE_WIDTH_OFFSET_TIME_TEXT_TO_HUD = 1/8;
const SCALE_WIDTH_OFFSET_SCORE_TEXT_TO_HUD = 1/2;
const SCALE_WIDTH_OFFSET_LIVES_TEXT_TO_HUD = 7/8;

const SCALE_PLAYER_TO_WALL = 0.8;
const SCALE_BOMB_TO_WALL = 0.8;

const INDEX_SCREEN_CONTENT_HUD_BACKGROUND = 0;
const INDEX_SCREEN_CONTENT_HUD_ROUND_RECT = 1;
const INDEX_SCREEN_CONTENT_HUD_TEXT_TIME = 2;
const INDEX_SCREEN_CONTENT_HUD_TEXT_SCORE = 3;
const INDEX_SCREEN_CONTENT_HUD_TEXT_LIVES = 4;

const MOVEMENT_SPEED_SCALE_FACTOR_TO_HEIGHT = 0.11;
const BOMB_DURATION_MS = 3000; // 3 seconds
const BOMB_CHANGE_TEXTURE_TIME_MS = 500; // 0.5 seconds
const EXPLOSION_DURATION_MS = 500; // 0.5 second
const EASTER_EGG_TIME = 359990000; // 59 minutes 59 seconds

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
        // I am not expecting someone to play for 100 hours straight so I won't bother scaling this
        if (hours > 99) {
            return '(ㆆ_ㆆ)????'
        }
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

////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Represents the game session manager.
 * This class manages the game session and its state.
 * It also handles the game logic and updates.
 * It also handles the key inputs for the game session.
 */
export class GameSessionManager {
    constructor(app, settings, screenContent, textures, soundManager, key_inputs, rows_count, cols_count) {
        this.app = app;
        this.endless = settings.endless;
        this.screenContent = screenContent;
        this.screenContent.pauseSign = null;
        this.textures = textures;
        this.soundManager = soundManager;
        this.key_inputs = key_inputs;

        // variables for screen resizing
        this.prevWidth = this.app.screen.width;
        this.prevHeight = this.app.screen.height;
        this.basis_change = false;

        // game stats
        this.stats = {
            score: 0,
            time: 0,
            lives: settings.lives,
        };

        // game objects and settings
        this.gameSessionState = null;
        this.arena = new Arena(app, textures, rows_count, cols_count);
        this.player = null;
        this.lives_left = settings.lives;
        this.enemies = [];
        this.bombs = [];
        this.explosions = [];
        // this.movementSpeed = 85;
        this.movementSpeed = this.app.screen.height * MOVEMENT_SPEED_SCALE_FACTOR_TO_HEIGHT;
        settings.endless ? this.level = 1 : this.level = undefined;

        // flags
        this.started = false;
        this.bomb_placed = false;
    }

    /**
     * Returns a PIXI.Text object with the text scaled to fit a specified border.
     * @param {String} text - The text to display.
     * @param {Number} borderWidth - The width of the border.
     * @param {Number} borderHeight - The height of the border.
     * @param {Number} maxScaleHeightTextToBorder - The maximum scale of the text height to the border height.
     * @param {Number} maxScaleWidthTextToBorder - The maximum scale of the text width to the border width.
     * @returns {PIXI.Text} The PIXI.Text object.
     */
    #getSizedText(text, borderWidth, borderHeight, maxScaleHeightTextToBorder, maxScaleWidthTextToBorder) {
        let maxHeight = borderHeight * maxScaleHeightTextToBorder;
        let maxWidth = borderWidth * maxScaleWidthTextToBorder;
        let fontSize = 1;
        let logoText = new PIXI.Text({'text': text, 'style': {
            fontFamily: TEXT_FONT_FAMILY,
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

    /**
     * Draws the stats on the screen.
     */
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
        hud_background.fill(HEX_COLOR_CODES.BLUEISH_GRAY);
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
        const time_text = `Time:\n${parseTime(this.stats.time)}`;
        const time = this.#getSizedText(time_text, hud_width, hud_height, SCALE_HEIGHT_HUD_TEXT_TO_HUD, SCALE_WIDTH_HUD_TEXT_TO_HUD);
        time.x = (hud_width * SCALE_WIDTH_OFFSET_TIME_TEXT_TO_HUD) - (time.width / 2);
        time.y = (hud_height - (hud_height * SCALE_HEIGHT_HUD_TEXT_TO_HUD)) / 2;
        this.screenContent.hud_elems.push(time);
        app.stage.addChild(time);

        // draw text for score
        const score_text = `Score:\n${this.stats.score}`;
        const score = this.#getSizedText(score_text, hud_width, hud_height, SCALE_HEIGHT_HUD_TEXT_TO_HUD, SCALE_WIDTH_HUD_TEXT_TO_HUD);
        score.x = (hud_width * SCALE_WIDTH_OFFSET_SCORE_TEXT_TO_HUD) - (score.width / 2);
        score.y = (hud_height - (hud_height * SCALE_HEIGHT_HUD_TEXT_TO_HUD)) / 2;
        this.screenContent.hud_elems.push(score);
        app.stage.addChild(score);

        // draw text for lives
        const lives_text = `Lives:\n${this.stats.lives}`;
        const lives = this.#getSizedText(lives_text, hud_width, hud_height, SCALE_HEIGHT_HUD_TEXT_TO_HUD, SCALE_WIDTH_HUD_TEXT_TO_HUD);
        lives.x = (hud_width * SCALE_WIDTH_OFFSET_LIVES_TEXT_TO_HUD) - (lives.width / 2);
        lives.y = (hud_height - (hud_height * SCALE_HEIGHT_HUD_TEXT_TO_HUD)) / 2;
        this.screenContent.hud_elems.push(lives);
        app.stage.addChild(lives);
    }

    /**
     * Spawns an entity on the screen.
     * @param {PIXI.Sprite} entity - The entity to spawn.
     * @param {Number} [start_x=null] - The starting x-coordinate.
     * @param {Number} [start_y=null] - The starting y-coordinate.
     * @param {Number} [scale=1] - The scale of the entity.
     */
    #spawnEntity(entity, start_x = null, start_y = null, scale = 1) {
        let wall_width = this.arena.wall_width
        let wall_height = this.arena.wall_height
        entity.width = wall_width * scale;
        entity.height = wall_height * scale; //TODO SCALING FOR SPRITES
        let { x, y } = { x: null, y: null };
        if (start_x !== null && start_y !== null) {
            x = start_x;
            y = start_y;
        } else {
            ({ x, y } = this.arena.randomEmptySpace());
        }
        entity.x = x + (wall_width - entity.width) / 2;
        entity.y = y + (wall_height - entity.height) / 2;
        this.app.stage.addChild(entity);
    }

    /**
     * Redraws the entity on the screen (because of screen resizing)
     * @param {PIXI.Sprite} entity - The entity to redraw.
     * @param {Number} [scale=1] - The scale of the entity.
     */
    #redrawEntity(entity, scale = 1) {
        app.stage.removeChild(entity);
        app.stage.addChild(entity);
        const wall_width = this.arena.wall_width
        const wall_height = this.arena.wall_height
        entity.width = wall_width * scale;
        entity.height = wall_height * scale;
        
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
     * Sets up the key inputs for the game session.
     */
    #setUpKeyInputs() {
        // arrow keys for movement are handled on each frame update (to combat desync)

        const spaceFunc = () => {
            if (this.started && this.bombs.length < 1) {
                this.bomb_placed = true;
            }
        }

        const escFunc = () => {
            throw new Error('ESCAPE KEY: Not implemented yet.');
        }

        const pauseFunc = () => {
            if (this.started) {
                if (this.gameSessionState.state !== this.gameSessionState.GAME_SESSION_STATE_PAUSED) {
                    this.key_inputs.space.press = null;
                    this.key_inputs.esc.press = null;
                    this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_PAUSED);
                }
                else {
                    this.key_inputs.space.press = spaceFunc;
                    this.key_inputs.esc.press = escFunc;
                    this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_IN_PROGRESS);
                    this.#handleGameSessionPausedUpdate(true);
                }
            }
        }
        
        // spacebar for bomb
        this.key_inputs.space.press = spaceFunc;

        // esc for returning to main menu (with prompt)
        this.key_inputs.esc.press = escFunc;

        // p for pausing the game
        this.key_inputs.pause.press = pauseFunc;
    }

    /**
     * Cleans up the key inputs for the game session.
     * This is called when the game session is stopped.
     */
    #cleanUpKeyInputs() {
        this.key_inputs.space.press = null;
        this.key_inputs.esc.press = null;
        this.key_inputs.pause.press = null;
    }

    /**
     * Starts the game session.
     */
    start() {
        this.#setUpKeyInputs();
        this.gameSessionState = new GameSessionState();

        this.arena.draw();
        this.#drawStats();
        // DEBUG add player sprite (now using bunny sprite)
        this.player = new PIXI.Sprite(this.textures.player);
        this.#spawnEntity(this.player, null, null, SCALE_PLAYER_TO_WALL);

        this.started = true;
        // TODO: add player and enemies
    }

    /**
     * Redraws the game session. Used when the screen is resized.
     */
    redraw() {
        this.basis_change = true;
        
        this.arena.draw();
        this.#drawStats();
        this.#redrawEntity(this.player, SCALE_PLAYER_TO_WALL);
        for (let bomb of this.bombs) {
            this.#redrawEntity(bomb.bomb, SCALE_BOMB_TO_WALL);
        }
        for (let explosion_instance of this.explosions) {
            for (let explosion of explosion_instance.explosions) {
                this.#redrawEntity(explosion);
            }
        }
        if (this.screenContent.pauseSign) {
            this.app.stage.removeChild(this.screenContent.pauseSign);
            this.screenContent.pauseSign = null;
            this.#handleGameSessionPausedUpdate();
        }

        this.prevWidth = this.app.screen.width;
        this.prevHeight = this.app.screen.height;
        this.movementSpeed = this.app.screen.height * MOVEMENT_SPEED_SCALE_FACTOR_TO_HEIGHT;
        this.basis_change = false;
    }

    /**
     * Updates the stats on the screen.
     */
    #updateStats() {
        this.screenContent.hud_elems[INDEX_SCREEN_CONTENT_HUD_TEXT_TIME].text = `Time:\n${parseTime(this.stats.time)}`;
        this.screenContent.hud_elems[INDEX_SCREEN_CONTENT_HUD_TEXT_SCORE].text = `Score:\n${this.stats.score}`;
        this.screenContent.hud_elems[INDEX_SCREEN_CONTENT_HUD_TEXT_LIVES].text = `Lives:\n${this.stats.lives}`;
        // this.#drawStats(); // to ensure the text is updated and scaled properly (can be overlayed because hud is always at the top of the screen)
    }

    /**
     * Updates the player movement based on key inputs.
     * @param {Object} delta - The delta object.
     */
    #updatePlayerMovement(delta) {
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

    /**
     * Creates an explosion on the screen.
     * @param {Number} cellX - The x-coordinate of the bomb.
     * @param {Number} cellY - The y-coordinate of the bomb. 
     */
    #createExplosion(cellX, cellY) {
        // sanity check
        if (cellX <= 0 || cellX >= this.arena.cols_count - 1 || cellY <= 0 || cellY >= this.arena.rows_count - 1) {
            console.error(MODULE_NAME_PREFIX, 'Invalid bomb detonation coordinates:', cellX, cellY);
            return;
        }

        const explosion_instance = {explosions: [], time: null};

        // explosion positions
        const {centerX, centerY} = {centerX: cellX, centerY: cellY};
        const {northX, northY} = {northX: cellX, northY: cellY - 1};
        const {southX, southY} = {southX: cellX, southY: cellY + 1};
        const {eastX, eastY} = {eastX: cellX + 1, eastY: cellY};
        const {westX, westY} = {westX: cellX - 1, westY: cellY};
        const spread = [{x: northX, y: northY}, {x: southX, y: southY}, {x: eastX, y: eastY}, {x: westX, y: westY}];

        // create explosion sprites (now with graphics
        // center
        let explosion = new PIXI.Sprite(this.textures.explosion);
        let { x: x_center, y: y_center } = this.arena.gridToCanvas(centerX, centerY, this.app.screen.width, this.app.screen.height);
        this.#spawnEntity(explosion, x_center, y_center);
        explosion_instance.explosions.push(explosion);
        // all directions
        for (let dir of spread) {
            if (this.arena.grid[dir.y][dir.x] === GRID_CELL_TYPE.EMPTY) {
                explosion = new PIXI.Sprite(this.textures.explosion);
                let { x, y } = this.arena.gridToCanvas(dir.x, dir.y, this.app.screen.width, this.app.screen.height);
                this.#spawnEntity(explosion, x, y);
                explosion_instance.explosions.push(explosion);
            }
        }
        explosion_instance.time = this.stats.time;
        this.explosions.push(explosion_instance);
        this.soundManager.playExplosion();
    }

    /**
     * Updates the bombs on the screen.
     */
    #updateBombs() {
        // check if a bomb should be placed
        if (this.bomb_placed) {
            // find the player's position
            const player_x = this.player.x;
            const player_y = this.player.y;

            // put the bomb in the cell the player is most in
            const { x: cellX, y: cellY } = this.arena.canvasToGrid(player_x, player_y, this.app.screen.width, this.app.screen.height);
            const { x, y } = this.arena.gridToCanvas(cellX, cellY, this.app.screen.width, this.app.screen.height);

            // create a bomb sprite
            let bomb = new PIXI.Sprite(this.textures.bomb);
            this.#spawnEntity(bomb, x, y, SCALE_BOMB_TO_WALL);
            
            // add the bomb to the list of bombs
            const bomb_info = {bomb: bomb, time: this.stats.time, cellX: cellX, cellY: cellY}
            this.bombs.push(bomb_info);

            this.bomb_placed = false;
            console.log(MODULE_NAME_PREFIX, 'Bomb placed at:', x, y);
            console.log(MODULE_NAME_PREFIX, 'Bomb: ', bomb_info);
        }

        // update each bomb
        for (let bomb of this.bombs) {
            const bomb_time_placed = this.stats.time - bomb.time;

            // texture swapping
            const bomb_change_texture = Math.round(bomb_time_placed / BOMB_CHANGE_TEXTURE_TIME_MS) % 2;
            const bomb_textures = [this.textures.bomb, this.textures.bomb_ignited];
            bomb.bomb.texture = bomb_textures[bomb_change_texture];

            // bomb is to be detonated
            if (bomb_time_placed >= BOMB_DURATION_MS) {
                this.app.stage.removeChild(bomb.bomb);

                this.#createExplosion(bomb.cellX, bomb.cellY);
                this.bombs.splice(this.bombs.indexOf(bomb), 1);
            }
        }
    }

    /**
     * Hit checks the entities on the screen and 
     * handles the consequences of the hits.
     * // TODO not complete
     */
    #hitcheckEntities() {
        // explosion hit check
        for (let explosion_instance of this.explosions) {
            for (let explosion of explosion_instance.explosions) {
                const explosion_bounds = explosion.getBounds();
                const player_bounds = this.player.getBounds();
                if (checkCollision(explosion_bounds.x, explosion_bounds.y, explosion_bounds.width, explosion_bounds.height, player_bounds.x, player_bounds.y, player_bounds.width, player_bounds.height)) {
                    this.stats.lives -= 1;
                    // remove the explosion
                    this.app.stage.removeChild(explosion);
                    explosion_instance.explosions.splice(explosion_instance.explosions.indexOf(explosion), 1);
                    console.error(MODULE_NAME_PREFIX, 'Player hit by explosion!');
                }
            }
        }
    }

    /**
     * Updates the explosions on the screen.
     */
    #updateExplosions() {
        for (let explosion_instance of this.explosions) {
            const explosion_time = this.stats.time - explosion_instance.time;
            if (explosion_time >= EXPLOSION_DURATION_MS) {
                for (let explosion of explosion_instance.explosions) {
                    this.app.stage.removeChild(explosion);
                }
                this.explosions.splice(this.explosions.indexOf(explosion_instance), 1);
            }
        }
    }

    /**
     * Handles updating the game session when it is in progress.
     * Does not update when the screen is being resized.
     * @param {Object} delta - The delta object for time-based updates.
     */
    #handleGameSessionInProgressUpdate(delta) {
        // process entity updates when the screen is not being resized
        if (!this.basis_change) {
            this.stats.time = this.stats.time + delta.elapsedMS;

            this.#updateStats();
            // this.#handleLeaveGame();
            // this.#handlePause();
            this.#updatePlayerMovement(delta);
            // this.#updateEnemyMovement(delta);
            this.#updateBombs();
            this.#hitcheckEntities();
            this.#updateExplosions();
            // this.#updateScore();
            // this.#handleLevelEnd();
            // this.#handleGameEnd();
        }
    }

    #handleGameSessionLivesLeftUpdate(delta) {
        // TODO
    }

    /**
     * Handles updating the game session when it is paused.
     * @param {Boolean} endPause - True if the pause sign should be removed, false otherwise.
     */
    #handleGameSessionPausedUpdate(endPause = false) {
        if (!this.screenContent.pauseSign) {
            const { width: window_width, height: window_height } = this.app.screen;
            const pauseSign = this.#getSizedText('PAUSED', window_width, window_height, SCALE_HEIGHT_PAUSE_SIGN_TO_SCREEN, SCALE_WIDTH_PAUSE_SIGN_TO_SCREEN);
            pauseSign.x = (window_width - pauseSign.width) / 2;
            pauseSign.y = (window_height - pauseSign.height) / 2;
            this.screenContent.pauseSign = pauseSign;
            this.app.stage.addChild(pauseSign);
        }
        if (endPause) {
            this.app.stage.removeChild(this.screenContent.pauseSign);
            this.screenContent.pauseSign = null;
        }
    }

    #handleGameSessionLeavePromptUpdate(delta) {
        // TODO
    }

    #handleGameSessionLevelClearedUpdate(delta) {
        // TODO
    }

    #handleGameSessionGameEndUpdate(delta) {
        // TODO
    }

    /**
     * Handles the game session updates based on state of 
     * the game session and user inputs.
     * @param {Object} delta - The delta object for time-based updates.
     * @throws {Error} If the game session has not been started yet.
     * @throws {Error} If the game session state is invalid.
     */
    update(delta) {
        if (!this.started) {
            console.error('Game session not started yet.');
            return;
        }
        switch (this.gameSessionState.state) {
            case this.gameSessionState.GAME_SESSION_STATE_IN_PROGRESS:
                this.#handleGameSessionInProgressUpdate(delta);
                break;
            case this.gameSessionState.GAME_SESSION_STATE_LIVES_LEFT:
                this.#handleGameSessionLivesLeftUpdate(delta);
                break;
            case this.gameSessionState.GAME_SESSION_STATE_PAUSED:
                this.#handleGameSessionPausedUpdate();
                break;
            case this.gameSessionState.GAME_SESSION_STATE_LEAVE_PROMPT:
                this.#handleGameSessionLeavePromptUpdate(delta);
                break;
            case this.gameSessionState.GAME_SESSION_STATE_LEVEL_CLEARED:
                this.#handleGameSessionLevelClearedUpdate(delta);
                break;
            case this.gameSessionState.GAME_SESSION_STATE_GAME_END:
                this.#handleGameSessionGameEndUpdate(delta);
                break;
            default:
                console.error(MODULE_NAME_PREFIX + "Invalid game state: " + this.gameSessionState.state);
                throw new Error("Invalid game state: " + this.gameSessionState.state);
        }
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Represents a game session.
 */
class Arena {
    /**
     * Creates a new arena with walls and empty spaces.
     * @param {PIXI.Application} app - The PIXI application.
     * @param {Object} textures - The textures object.
     * @param {Number} rows_count - The number of rows in the arena.
     * @param {Number} cols_count - The number of columns in the arena.
     */
    constructor(app, textures, rows_count, cols_count) {
        this.app = app;
        this.textures = textures;
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
    gridToCanvas(gridX, gridY, screenWidth, screenHeight) {
        let cellWidth = screenWidth * SCALE_WIDTH_ARENA_TO_SCREEN / this.cols_count;
        let cellHeight = screenHeight * SCALE_HEIGHT_ARENA_TO_SCREEN / this.rows_count;
        let canvasX = gridX * cellWidth;
        let y_offset = (screenHeight - (cellHeight * this.rows_count));
        let canvasY = y_offset + (gridY * cellHeight);
        return { x: canvasX, y: canvasY, cellWidth: cellWidth, cellHeight: cellHeight };
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
        let gridX = Math.round(canvasX / cellWidth);
        let y_offset = (screenHeight - (cellHeight * this.rows_count));
        let gridY = Math.round((canvasY - y_offset) / cellHeight);
        return { x: gridX, y: gridY };
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
        
        const x_coord = this.gridToCanvas(col_index, row_index, this.app.screen.width, this.app.screen.height).x;
        const y_coord = this.gridToCanvas(col_index, row_index, this.app.screen.width, this.app.screen.height).y;
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
                const { x, y, cellWidth, cellHeight } = this.gridToCanvas(col_index, row_index, width, height);
                // const elem = new PIXI.Graphics();
                // elem.rect(x, y, cellWidth, cellHeight);
                if (this.grid[row_index][col_index] === GRID_CELL_TYPE.WALL) {
                    let elem = new PIXI.Sprite(this.textures.wall);
                    elem.width = cellWidth;
                    elem.height = cellHeight;
                    elem.x = x;
                    elem.y = y;
                    // elem.fill(HEX_COLOR_CODES.GRAY);
                    this.wallsElements.push(elem);
                    app.stage.addChild(elem);
                } else {
                    let elem = new PIXI.Graphics();
                    elem.rect(x, y, cellWidth, cellHeight);
                    elem.fill(HEX_COLOR_CODES.BLACK);
                    this.freeSpaceElements.push(elem);
                    app.stage.addChild(elem);
                }
            }
        }
    }
}