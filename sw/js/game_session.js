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

const DURATION_MS_BOMB = 3000; // 3 seconds
const TIME_CHANGE_MS_BOMB_TEXTURE = 500; // 0.5 seconds
const EXPLOSION_DURATION_MS = 500; // 0.5 second
const EASTER_EGG_TIME = 359990000; // 59 minutes 59 seconds
const TIME_CHANGE_MS_MOVEMENT_SPRITE = 250; // 0.25 seconds
const DURATION_MS_PLAYER_HIT = 3000; // 3 seconds
const DURATION_MS_PLAYER_HIT_BLINK = 100; // 0.1 seconds
const DURATION_MS_LEVEL_CHANGE = 5000; // 5 seconds

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

        // game vector graphics objects
        this.screenContent = screenContent;
        this.screenContent.pauseSign = null;
        this.screenContent.hudElems = [];
        this.screenContent.arena = new Arena(app, textures, rows_count, cols_count);
        this.screenContent.player = null;
        this.screenContent.enemies = [];
        this.screenContent.bombs = [];
        this.screenContent.explosions = [];
        this.screenContent.levelChangeElems = [];

        // other game session variables
        this.playerMovementSprites = [this.textures.player_walk01, /*this.textures.player_walk02,*/ this.textures.player_walk03];
        this.currentPlayerMovementSpriteIndex = 0;
        this.playerHitScreenInfo = null;
        this.levelScreenInfo = null;
        
        // settings
        this.gameSessionState = null;
        this.livesLeft = settings.lives;
        // this.movementSpeed = 85;
        this.movementSpeed = this.app.screen.height * MOVEMENT_SPEED_SCALE_FACTOR_TO_HEIGHT;
        this.level = 1;

        // flags
        this.started = false;
        this.bombPlaced = false;
        this.playerMoving = false;
        this.playerMovingTime = 0;
        this.livesLeftScreenInfo = null;
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
        if (this.screenContent.hudElems) {
            for (let elem of this.screenContent.hudElems) {
                this.app.stage.removeChild(elem);
            }
            this.screenContent.hudElems = [];
        }

        const { width: window_width, height: window_height } = this.app.screen;
        let hud_background = new PIXI.Graphics();
        let hud_width = window_width;
        let hud_height = window_height * SCALE_HEIGHT_HUD_TO_SCREEN;

        // draw background for hud
        hud_background.rect(0, 0, hud_width, hud_height);
        hud_background.fill(HEX_COLOR_CODES.BLUEISH_GRAY);
        this.screenContent.hudElems.push(hud_background);
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
        this.screenContent.hudElems.push(round_rect);
        this.app.stage.addChild(round_rect);

        // draw text for time
        const time_text = `Time:\n${parseTime(this.stats.time)}`;
        const time = this.#getSizedText(time_text, hud_width, hud_height, SCALE_HEIGHT_HUD_TEXT_TO_HUD, SCALE_WIDTH_HUD_TEXT_TO_HUD);
        time.x = (hud_width * SCALE_WIDTH_OFFSET_TIME_TEXT_TO_HUD) - (time.width / 2);
        time.y = (hud_height - (hud_height * SCALE_HEIGHT_HUD_TEXT_TO_HUD)) / 2;
        this.screenContent.hudElems.push(time);
        app.stage.addChild(time);

        // draw text for score
        const score_text = `Score:\n${this.stats.score}`;
        const score = this.#getSizedText(score_text, hud_width, hud_height, SCALE_HEIGHT_HUD_TEXT_TO_HUD, SCALE_WIDTH_HUD_TEXT_TO_HUD);
        score.x = (hud_width * SCALE_WIDTH_OFFSET_SCORE_TEXT_TO_HUD) - (score.width / 2);
        score.y = (hud_height - (hud_height * SCALE_HEIGHT_HUD_TEXT_TO_HUD)) / 2;
        this.screenContent.hudElems.push(score);
        app.stage.addChild(score);

        // draw text for lives
        const lives_text = `Lives:\n${this.stats.lives}`;
        const lives = this.#getSizedText(lives_text, hud_width, hud_height, SCALE_HEIGHT_HUD_TEXT_TO_HUD, SCALE_WIDTH_HUD_TEXT_TO_HUD);
        lives.x = (hud_width * SCALE_WIDTH_OFFSET_LIVES_TEXT_TO_HUD) - (lives.width / 2);
        lives.y = (hud_height - (hud_height * SCALE_HEIGHT_HUD_TEXT_TO_HUD)) / 2;
        this.screenContent.hudElems.push(lives);
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
        let wallWidth = this.screenContent.arena.wallWidth
        let wallHeight = this.screenContent.arena.wallHeight
        entity.width = wallWidth * scale;
        entity.height = wallHeight * scale; //TODO SCALING FOR SPRITES
        let { x, y } = { x: null, y: null };
        if (start_x !== null && start_y !== null) {
            x = start_x;
            y = start_y;
        } else {
            ({ x, y } = this.screenContent.arena.randomEmptySpace());
        }
        entity.x = x + (wallWidth - entity.width) / 2;
        entity.y = y + (wallHeight - entity.height) / 2;
        this.app.stage.addChild(entity);
    }

    /**
     * Redraws the entity on the screen (because of screen resizing)
     * @param {PIXI.Sprite} entity - The entity to redraw.
     * @param {Number} [scale=1] - The scale of the entity.
     */
    #redrawEntity(entity, scale = 1) {
        const wallWidth = this.screenContent.arena.wallWidth
        const wallHeight = this.screenContent.arena.wallHeight
        entity.width = wallWidth * scale;
        entity.height = wallHeight * scale;
        
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
        // check if the new position is valid before updating
        if (!this.screenContent.arena.checkWallCollision(entity, deltaX)) {
            entity.x += deltaX;
        }
        if (!this.screenContent.arena.checkWallCollision(entity, 0, deltaY)) {
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
        // but arrow keys will have functions assigned to change flags for movement

        const arrowUpFunc = () => {
            this.playerMoving = false;
            this.playerMovingTime = 0;
        }


        const spaceFunc = () => {
            if (this.started && this.screenContent.bombs.length < 1) {
                this.bombPlaced = true;
            }
        }

        const escFunc = () => {
            throw new Error('ESCAPE KEY: Not implemented yet.');
        }

        const pauseFunc = () => {
            if (this.started) {
                if (this.gameSessionState.state !== this.gameSessionState.GAME_SESSION_STATE_PAUSED) {
                    this.key_inputs.left.release = null;
                    this.key_inputs.right.release = null;
                    this.key_inputs.space.press = null;
                    this.key_inputs.esc.press = null;
                    this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_PAUSED);
                }
                else {
                    this.key_inputs.left.release = arrowUpFunc;
                    this.key_inputs.right.release = arrowUpFunc;
                    this.key_inputs.space.press = spaceFunc;
                    this.key_inputs.esc.press = escFunc;
                    this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_IN_PROGRESS);
                    this.#handleGameSessionPausedUpdate(true);
                }
            }
        }

        // arrow keys for movement
        this.key_inputs.left.release = arrowUpFunc;
        this.key_inputs.right.release = arrowUpFunc;
        this.key_inputs.up.release = arrowUpFunc;
        this.key_inputs.down.release = arrowUpFunc;
        
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
     * // TODO USE
     */
    #cleanUpKeyInputs() {
        this.key_inputs.left.press = null;
        this.key_inputs.left.release = null;
        this.key_inputs.right.press = null;
        this.key_inputs.right.release = null;
        this.key_inputs.up.press = null;
        this.key_inputs.up.release = null;
        this.key_inputs.down.press = null;
        this.key_inputs.down.release = null;
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

        this.screenContent.arena.draw();
        this.#drawStats();
        // DEBUG add player sprite (now using bunny sprite)
        this.screenContent.player = new PIXI.Sprite(this.textures.player);
        this.#spawnEntity(this.screenContent.player, null, null, SCALE_PLAYER_TO_WALL);

        this.started = true;
        // TODO: add player and enemies
    }

    /**
     * Redraws the game session. Used when the screen is resized.
     */
    redraw() {
        this.basis_change = true;
        
        this.screenContent.arena.redraw();
        this.#drawStats();
        this.#redrawEntity(this.screenContent.player, SCALE_PLAYER_TO_WALL);
        for (let bomb of this.screenContent.bombs) {
            this.#redrawEntity(bomb.bomb, SCALE_BOMB_TO_WALL);
        }
        for (let explosion_instance of this.screenContent.explosions) {
            for (let explosion of explosion_instance.explosions) {
                this.#redrawEntity(explosion);
            }
        }
        if (this.screenContent.pauseSign) {
            this.#redrawPauseSign();
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
        this.screenContent.hudElems[INDEX_SCREEN_CONTENT_HUD_TEXT_TIME].text = `Time:\n${parseTime(this.stats.time)}`;
        this.screenContent.hudElems[INDEX_SCREEN_CONTENT_HUD_TEXT_SCORE].text = `Score:\n${this.stats.score}`;
        this.screenContent.hudElems[INDEX_SCREEN_CONTENT_HUD_TEXT_LIVES].text = `Lives:\n${this.stats.lives}`;
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

        if (this.key_inputs.left.isDown) {
            deltaX -= distance;
            if (this.screenContent.player.scale.x > 0) {
                this.screenContent.player.scale.x *= -1;
                this.screenContent.player.x += this.screenContent.player.width;
            }
            this.playerMoving = true;
        }
        if (this.key_inputs.right.isDown) {
            deltaX += distance;
            if (this.screenContent.player.scale.x < 0) {
                this.screenContent.player.scale.x *= -1;
                this.screenContent.player.x -= this.screenContent.player.width;
            }
            this.playerMoving = true;
        }
        if (this.key_inputs.up.isDown) {
            deltaY -= distance;
            this.playerMoving = true;
        }
        if (this.key_inputs.down.isDown) {
            deltaY += distance;
            this.playerMoving = true;
        }

        if (this.playerMoving) {
            this.playerMovingTime += delta.elapsedMS;

            if (this.playerMovingTime > TIME_CHANGE_MS_MOVEMENT_SPRITE) {
                this.currentPlayerMovementSpriteIndex = (this.currentPlayerMovementSpriteIndex + 1) % this.playerMovementSprites.length;
                this.screenContent.player.texture = this.playerMovementSprites[this.currentPlayerMovementSpriteIndex];
                this.playerMovingTime -= TIME_CHANGE_MS_MOVEMENT_SPRITE;
            }
        } else {
            this.screenContent.player.texture = this.textures.player;
        }
        
        this.#updateEntity(this.screenContent.player, deltaX, deltaY);
    }

    /**
     * Creates an explosion on the screen.
     * @param {Number} cellX - The x-coordinate of the bomb.
     * @param {Number} cellY - The y-coordinate of the bomb. 
     */
    #createExplosion(cellX, cellY) {
        // sanity check
        if (cellX <= 0 || cellX >= this.screenContent.arena.colsCount - 1 || cellY <= 0 || cellY >= this.screenContent.arena.rowsCount - 1) {
            console.error(MODULE_NAME_PREFIX, 'Invalid bomb detonation coordinates:', cellX, cellY);
            return;
        }

        const explosionInstance = {explosions: [], time: null};

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
        let { x: x_center, y: y_center } = this.screenContent.arena.gridToCanvas(centerX, centerY, this.app.screen.width, this.app.screen.height);
        this.#spawnEntity(explosion, x_center, y_center);
        explosionInstance.explosions.push(explosion);
        // all directions
        for (let dir of spread) {
            if (this.screenContent.arena.grid[dir.y][dir.x].type === GRID_CELL_TYPE.EMPTY) {
                explosion = new PIXI.Sprite(this.textures.explosion);
                let { x, y } = this.screenContent.arena.gridToCanvas(dir.x, dir.y, this.app.screen.width, this.app.screen.height);
                this.#spawnEntity(explosion, x, y);
                explosionInstance.explosions.push(explosion);
            }
        }
        explosionInstance.time = this.stats.time;
        this.screenContent.explosions.push(explosionInstance);
        this.soundManager.playExplosion();
    }

    /**
     * Updates the bombs on the screen.
     */
    #updateBombs() {
        // check if a bomb should be placed
        if (this.bombPlaced) {
            // find the player's position (beware of negative scaling)
            const {minX: player_x, minY: player_y} = this.screenContent.player.getBounds();

            // put the bomb in the cell the player is most in
            const { x: cellX, y: cellY } = this.screenContent.arena.canvasToGrid(player_x, player_y, this.app.screen.width, this.app.screen.height);
            const { x, y } = this.screenContent.arena.gridToCanvas(cellX, cellY, this.app.screen.width, this.app.screen.height);

            // create a bomb sprite
            let bomb = new PIXI.Sprite(this.textures.bomb);
            this.#spawnEntity(bomb, x, y, SCALE_BOMB_TO_WALL);
            
            // add the bomb to the list of bombs
            const bomb_info = {bomb: bomb, time: this.stats.time, cellX: cellX, cellY: cellY}
            this.screenContent.bombs.push(bomb_info);

            this.bombPlaced = false;
            console.log(MODULE_NAME_PREFIX, 'Bomb placed at:', x, y);
            console.log(MODULE_NAME_PREFIX, 'Bomb: ', bomb_info);
        }

        // update each bomb
        for (let bomb of this.screenContent.bombs) {
            const bombTimePlaced = this.stats.time - bomb.time;

            // texture swapping
            const bombChangeTexture = Math.round(bombTimePlaced / TIME_CHANGE_MS_BOMB_TEXTURE) % 2;
            const bombTextures = [this.textures.bomb, this.textures.bomb_ignited];
            bomb.bomb.texture = bombTextures[bombChangeTexture];

            // bomb is to be detonated
            if (bombTimePlaced >= DURATION_MS_BOMB) {
                this.app.stage.removeChild(bomb.bomb);

                this.#createExplosion(bomb.cellX, bomb.cellY);
                this.screenContent.bombs.splice(this.screenContent.bombs.indexOf(bomb), 1);
            }
        }
    }

    #playerHit() {
        // TODO enemies hit check
        // explosion hit check
        for (let explosionInstance of this.screenContent.explosions) {
            for (let explosion of explosionInstance.explosions) {
                const explosionBounds = explosion.getBounds();
                const playerBounds = this.screenContent.player.getBounds();
                if (checkCollision(explosionBounds.x, explosionBounds.y, explosionBounds.width, explosionBounds.height, playerBounds.x, playerBounds.y, playerBounds.width, playerBounds.height)) {
                    return true;
                }
            }
        }
    }

    /**
     * Hit checks the entities on the screen and 
     * handles the consequences of the hits.
     * // TODO not complete
     */
    #hitcheckEntities() {
        if (this.#playerHit()) {
            this.soundManager.playPlayerHit();
            this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_PLAYER_HIT);
            return;
        }
    }

    /**
     * Updates the explosions on the screen.
     */
    #updateExplosions() {
        for (let explosion_instance of this.screenContent.explosions) {
            const explosion_time = this.stats.time - explosion_instance.time;
            if (explosion_time >= EXPLOSION_DURATION_MS) {
                for (let explosion of explosion_instance.explosions) {
                    this.app.stage.removeChild(explosion);
                }
                this.screenContent.explosions.splice(this.screenContent.explosions.indexOf(explosion_instance), 1);
            }
        }
    }

    /**
     * Draws the pause sign on the screen.
     */
    #drawPauseSign() {
        const { width: windowWidth, height: windowHeight } = this.app.screen;
        const pauseSign = this.#getSizedText('PAUSED', windowWidth, windowHeight, SCALE_HEIGHT_PAUSE_SIGN_TO_SCREEN, SCALE_WIDTH_PAUSE_SIGN_TO_SCREEN);
        pauseSign.x = (windowWidth - pauseSign.width) / 2;
        pauseSign.y = (windowHeight - pauseSign.height) / 2;
        this.screenContent.pauseSign = pauseSign;
        this.app.stage.addChild(pauseSign);
    }

    /**
     * Redraws the pause sign on the screen.
     * This is called when the screen is resized.
     */
    #redrawPauseSign() {
        const { width: windowWidth, height: windowHeight } = this.app.screen;
        this.app.stage.removeChild(this.screenContent.pauseSign);
        this.screenContent.pauseSign = this.#getSizedText('PAUSED', windowWidth, windowHeight, SCALE_HEIGHT_PAUSE_SIGN_TO_SCREEN, SCALE_WIDTH_PAUSE_SIGN_TO_SCREEN);
        this.screenContent.pauseSign.x = (windowWidth - this.screenContent.pauseSign.width) / 2;
        this.screenContent.pauseSign.y = (windowHeight - this.screenContent.pauseSign.height) / 2;
        this.app.stage.addChild(this.screenContent.pauseSign);
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
            this.#updatePlayerMovement(delta);
            // this.#updateEnemyMovement(delta);
            this.#updateBombs();
            this.#hitcheckEntities();
            if (this.gameSessionState.state !== this.gameSessionState.GAME_SESSION_STATE_IN_PROGRESS) {
                return;
            }
            this.#updateExplosions();
            // this.#updateScore();
            // this.#handleLevelEnd();
            // this.#handleGameEnd();
        }
    }

    #handleGameSessionPlayerHitUpdate(delta) {
        if (this.key_inputs.left.release 
            || this.key_inputs.right.release 
            || this.key_inputs.up.release 
            || this.key_inputs.down.release
            || this.key_inputs.space.press
            || this.key_inputs.esc.press
            || this.key_inputs.pause.press) 
        {
            this.#cleanUpKeyInputs();
        }

        // initialize player hit screen info
        if (!this.playerHitScreenInfo) {
            if (this.playerMoving) {
                this.playerMoving = false;
            }
            // get player to be on top of everything
            this.app.stage.removeChild(this.screenContent.player);
            this.app.stage.addChild(this.screenContent.player);
        
            this.playerHitScreenInfo = {};
            this.playerHitScreenInfo.playerHitTime = 0;
            this.playerHitScreenInfo.playerHitBlinkTime = 0;
        }

        // blink the player sprite
        if (this.playerHitScreenInfo.playerHitBlinkTime >= DURATION_MS_PLAYER_HIT_BLINK) {
            if (this.screenContent.player.visible) {
                this.screenContent.player.visible = false;
            }
            else {
                this.screenContent.player.visible = true;

            }
            this.playerHitScreenInfo.playerHitBlinkTime -= DURATION_MS_PLAYER_HIT_BLINK;
        }

        // player hit timer check
        if (this.playerHitScreenInfo.playerHitTime >= DURATION_MS_PLAYER_HIT) {
            this.playerHitScreenInfo = null;
            this.stats.lives -= 1;
            if (this.stats.lives <= 0) {
                // TODO game over
            }
            // reset timers
            this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_LEVEL_INFO_SCREEN);
            return;
        }

        // update timers each update
        this.playerHitScreenInfo.playerHitTime += delta.elapsedMS;
        this.playerHitScreenInfo.playerHitBlinkTime += delta.elapsedMS;
    }

    #handleGameSessionLevelInfoScreen(delta) {
        if (!this.levelScreenInfo) {
            this.levelScreenInfo = {};
            this.levelScreenInfo.levelChangeTime = 0;

            const background = new PIXI.Graphics();
            background.rect(0, 0, this.app.screen.width, this.app.screen.height);
            background.fill(HEX_COLOR_CODES.BLACK);
            this.screenContent.levelChangeElems.push(background);
            this.app.stage.addChild(background);

            const { width: windowWidth, height: windowHeight } = this.app.screen;
            const newLevelString = `Level: ${this.level}\nLives left: ${this.stats.lives}`;
            const newLevelText = this.#getSizedText(newLevelString, windowWidth, windowHeight, SCALE_HEIGHT_PAUSE_SIGN_TO_SCREEN, SCALE_WIDTH_PAUSE_SIGN_TO_SCREEN);
            newLevelText.x = (windowWidth - newLevelText.width) / 2;
            newLevelText.y = (windowHeight - newLevelText.height) / 2;
            this.screenContent.levelChangeElems.push(newLevelText);
            this.app.stage.addChild(newLevelText);

            this.soundManager.playNewLevel();
        }

        if (this.levelScreenInfo.levelChangeTime >= DURATION_MS_LEVEL_CHANGE) {
            throw new Error('Not implemented yet.');
        }
    }

    /**
     * Handles updating the game session when it is paused.
     * @param {Boolean} endPause - True if the pause sign should be removed, false otherwise.
     */
    #handleGameSessionPausedUpdate(endPause = false) {
        if (this.playerMoving) {
            this.screenContent.player.texture = this.textures.player;
            this.playerMoving = false;
        }
        if (!this.screenContent.pauseSign) {
            this.#drawPauseSign();
        }
        if (endPause) {
            this.app.stage.removeChild(this.screenContent.pauseSign);
            this.screenContent.pauseSign = null;
        }
    }

    #handleGameSessionLeavePromptUpdate(delta) {
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
            case this.gameSessionState.GAME_SESSION_STATE_PLAYER_HIT:
                this.#handleGameSessionPlayerHitUpdate(delta);
                break;
            case this.gameSessionState.GAME_SESSION_STATE_LEVEL_INFO_SCREEN:
                this.#handleGameSessionLevelInfoScreen(delta);
                break;
            case this.gameSessionState.GAME_SESSION_STATE_PAUSED:
                this.#handleGameSessionPausedUpdate();
                break;
            case this.gameSessionState.GAME_SESSION_STATE_LEAVE_PROMPT:
                this.#handleGameSessionLeavePromptUpdate(delta);
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
                    row.push({type: GRID_CELL_TYPE.WALL, elem: null}); // outer walls
                } else if ((rowIndex % 2) === 0 && (colIndex % 2) === 0) {
                    row.push({type: GRID_CELL_TYPE.WALL, elem: null}); // inner walls
                } else {
                    row.push({type: GRID_CELL_TYPE.EMPTY, elem: null}); // empty space
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
        let cellWidth = screenWidth * SCALE_WIDTH_ARENA_TO_SCREEN / this.colsCount;
        let cellHeight = screenHeight * SCALE_HEIGHT_ARENA_TO_SCREEN / this.rowsCount;
        let canvasX = gridX * cellWidth;
        let y_offset = (screenHeight - (cellHeight * this.rowsCount));
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
        let cellWidth = screenWidth * SCALE_WIDTH_ARENA_TO_SCREEN / this.colsCount;
        let cellHeight = screenHeight * SCALE_HEIGHT_ARENA_TO_SCREEN / this.rowsCount;
        let gridX = Math.round(canvasX / cellWidth);
        let y_offset = (screenHeight - (cellHeight * this.rowsCount));
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
        // const wallElems = this.grid.flat().filter(cell => cell.type === GRID_CELL_TYPE.WALL).map(cell => cell.elem);
        // for (const wall of wallElems) {
        for (let row_index = 0; row_index < this.rowsCount; row_index++) {
            for (let col_index = 0; col_index < this.colsCount; col_index++) {
                if (this.grid[row_index][col_index].type !== GRID_CELL_TYPE.WALL) {
                    continue;
                }
                const wall = this.grid[row_index][col_index].elem;

                const wallBounds = wall.getBounds();
                if (checkCollision(elemBounds.x, elemBounds.y, elemBounds.width, elemBounds.height, wallBounds.x, wallBounds.y, wallBounds.width, wallBounds.height, deltaX, deltaY)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Returns random empty space coordinates.
     * @returns {Object} The random empty space coordinates.
     */
    randomEmptySpace() {
        let rowIndex = Math.floor(Math.random() * this.rowsCount);
        let colIndex = Math.floor(Math.random() * this.colsCount);
        while (this.grid[rowIndex][colIndex].type === GRID_CELL_TYPE.WALL) {
            rowIndex = Math.floor(Math.random() * this.rowsCount);
            colIndex = Math.floor(Math.random() * this.colsCount);
        }
        
        const x_coord = this.gridToCanvas(colIndex, rowIndex, this.app.screen.width, this.app.screen.height).x;
        const y_coord = this.gridToCanvas(colIndex, rowIndex, this.app.screen.width, this.app.screen.height).y;
        return { x: x_coord, y: y_coord };
    }

    /**
     * Draws the arena on the screen.
     */
    draw() {
        this.wallWidth = this.app.screen.width * SCALE_WIDTH_ARENA_TO_SCREEN / this.colsCount;
        this.wallHeight = this.app.screen.height * SCALE_HEIGHT_ARENA_TO_SCREEN / this.rowsCount;

        const { width, height } = this.app.screen;
        for (let rowIndex = 0; rowIndex < this.rowsCount; rowIndex++) {
            for (let colIndex = 0; colIndex < this.colsCount; colIndex++) {
                const { x, y, cellWidth, cellHeight } = this.gridToCanvas(colIndex, rowIndex, width, height);
                if (this.grid[rowIndex][colIndex].type === GRID_CELL_TYPE.WALL) {
                    let elem = new PIXI.Sprite(this.textures.wall);
                    elem.width = cellWidth;
                    elem.height = cellHeight;
                    elem.x = x;
                    elem.y = y;
                    this.grid[rowIndex][colIndex].elem = elem;
                    app.stage.addChild(elem);
                } else {
                    let elem = new PIXI.Graphics();
                    elem.rect(x, y, cellWidth, cellHeight);
                    elem.fill(HEX_COLOR_CODES.BLACK);
                    this.grid[rowIndex][colIndex].elem = elem;
                    app.stage.addChild(elem);
                }
            }
        }
    }

    /**
     * Redraws the arena on the screen.
     * Used when the screen is resized.
     */
    redraw() {
        this.wallWidth = this.app.screen.width * SCALE_WIDTH_ARENA_TO_SCREEN / this.colsCount;
        this.wallHeight = this.app.screen.height * SCALE_HEIGHT_ARENA_TO_SCREEN / this.rowsCount;

        const { width, height } = this.app.screen;
        for (let row_index = 0; row_index < this.rowsCount; row_index++) {
            for (let col_index = 0; col_index < this.colsCount; col_index++) {
                const { x, y, cellWidth, cellHeight } = this.gridToCanvas(col_index, row_index, width, height);
                const elem = this.grid[row_index][col_index].elem;
                elem.width = cellWidth;
                elem.height = cellHeight;
                elem.x = x;
                elem.y = y;
            }
        }
    }
}