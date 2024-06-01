import { HEX_COLOR_CODES } from "./constants/color_codes.js";
import { GameSessionState } from "./game_session_states.js";
import { LEVELS } from "./levels_config.js";
import { Arena } from "./graphic_elements/arena.js";
import { Enemy } from "./graphic_elements/enemy.js";
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
const SCALE_ENEMY_TO_WALL = 0.9;
const SCALE_BOMB_TO_WALL = 0.8;
const SCALE_EXPLOSION_TO_WALL = 0.95;

const INDEX_SCREEN_CONTENT_HUD_BACKGROUND = 0;
const INDEX_SCREEN_CONTENT_HUD_ROUND_RECT = 1;
const INDEX_SCREEN_CONTENT_HUD_TEXT_TIME = 2;
const INDEX_SCREEN_CONTENT_HUD_TEXT_SCORE = 3;
const INDEX_SCREEN_CONTENT_HUD_TEXT_LIVES = 4;
const INDEX_SCREEN_CONTENT_INFO_SCREEN_BACKGROUND = 0;
const INDEX_SCREEN_CONTENT_INFO_SCREEN_TEXT = 1;

const MOVEMENT_SPEED_SCALE_FACTOR_TO_HEIGHT = 0.11;

const DURATION_MS_BOMB = 3000; // 3 seconds
const DURATION_MS_BOMB_TEXTURE_CHANGE = 500; // 0.5 seconds
const DURATION_MS_EXPLOSION = 500; // 0.5 second
const EASTER_EGG_TIME = 359990000; // 59 minutes 59 seconds
const DURATION_MS_MOVEMENT_SPRITE_CHANGE = 250; // 0.25 seconds
const DURATION_MS_PLAYER_HIT = 3000; // 3 seconds
const DURATION_MS_PLAYER_HIT_BLINK = 100; // 0.1 seconds
const DURATION_MS_LEVEL_CHANGE = 5000; // 5 seconds

const WALL_SCORE_VALUE = 10;

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
function checkCollision(e1_x, e1_y, e1Width, e1Height, e2_x, e2_y, e2Width, e2Height, e1DeltaX = 0, e1DeltaY = 0) {
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

////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Represents the game session manager.
 * This class manages the game session and its state.
 * It also handles the game logic and updates.
 * It also handles the key inputs for the game session.
 */
export class GameSessionManager {
    constructor(app, settings, screenContent, textures, soundManager, keyInputs, rowsCount, colsCount) {
        this.app = app;
        this.endless = settings.endless;
        this.textures = textures;
        this.soundManager = soundManager;
        this.keyInputs = keyInputs;

        // variables for screen resizing
        this.prevWidth = this.app.screen.width;
        this.prevHeight = this.app.screen.height;
        this.prevScreenSize = {width: this.prevWidth, height: this.prevHeight};
        this.basisChange = false;

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
        this.screenContent.arena = new Arena(app, textures, rowsCount, colsCount, SCALE_WIDTH_ARENA_TO_SCREEN, SCALE_HEIGHT_ARENA_TO_SCREEN);
        this.screenContent.player = null;
        this.screenContent.enemies = [];
        this.screenContent.breakableWalls = [];
        this.screenContent.bombs = [];
        this.screenContent.explosions = [];
        this.screenContent.exitDoor = null;
        this.screenContent.infoScreenElems = [];
        this.screenContent.nullable = false;        // flag for higher up module to nullify this object

        // other game session variables
        this.playerMovementSprites = [this.textures.player_walk01, /*this.textures.player_walk02,*/ this.textures.player_walk03];
        this.enemySprites = [this.textures.ghost01, this.textures.ghost02, this.textures.ghost03, this.textures.ghost04, this.textures.ghost05, this.textures.ghost06];
        this.currentPlayerMovementSpriteIndex = 0;
        this.currentEnemySpriteIndex = 0;
        this.playerHitScreenInfo = null;
        this.levelChangeInfo = null;
        this.enemiesSpriteTimer = null;
        
        // settings
        this.gameSessionState = null;
        this.livesLeft = settings.lives;
        // this.movementSpeed = 85;
        this.movementSpeed = this.app.screen.height * MOVEMENT_SPEED_SCALE_FACTOR_TO_HEIGHT;
        this.levelsConfig = null;
        this.level = 1;

        // flags
        this.started = false;
        this.ended = false;
        this.bombPlaced = false;
        this.playerMoving = false;
        this.playerMovingTime = 0;
        this.livesLeftScreenInfo = null;
        this.leave = null;
    }

    #prepareLevelsConfig() {
        this.levelsConfig = [];
        
        if (!this.endless) {
            this.levelsConfig = [...LEVELS];
        }    
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

        const enterFunc = () => {
            if (this.started) {
                this.leave = true;
                console.log(MODULE_NAME_PREFIX, 'Leaving game session');
            }
        }

        const escFunc = () => {
            if (this.started) {
                if (this.gameSessionState.state === this.gameSessionState.GAME_SESSION_STATE_IN_PROGRESS) {
                    this.keyInputs.left.release = null;
                    this.keyInputs.right.release = null;
                    this.keyInputs.space.press = null;
                    this.keyInputs.pause.press = null;
                    this.keyInputs.enter.press = enterFunc;
                    this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_LEAVE_PROMPT);
                    return;
                }
                if (this.gameSessionState.state === this.gameSessionState.GAME_SESSION_STATE_LEAVE_PROMPT) {
                    this.keyInputs.enter.press = null;
                    this.keyInputs.left.release = arrowUpFunc;
                    this.keyInputs.right.release = arrowUpFunc;
                    this.keyInputs.space.press = spaceFunc;
                    this.keyInputs.pause.press = pauseFunc;

                    this.leave = false;
                }
            }
        }

        const pauseFunc = () => {
            if (this.started) {
                if (this.gameSessionState.state !== this.gameSessionState.GAME_SESSION_STATE_PAUSED) {
                    this.keyInputs.left.release = null;
                    this.keyInputs.right.release = null;
                    this.keyInputs.space.press = null;
                    this.keyInputs.esc.press = null;
                    this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_PAUSED);
                }
                else {
                    this.keyInputs.left.release = arrowUpFunc;
                    this.keyInputs.right.release = arrowUpFunc;
                    this.keyInputs.space.press = spaceFunc;
                    this.keyInputs.esc.press = escFunc;
                    this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_IN_PROGRESS);
                    this.#handleGameSessionPausedUpdate(true);
                }
            }
        }

        // arrow keys for movement
        this.keyInputs.left.release = arrowUpFunc;
        this.keyInputs.right.release = arrowUpFunc;
        this.keyInputs.up.release = arrowUpFunc;
        this.keyInputs.down.release = arrowUpFunc;
        
        // spacebar for bomb
        this.keyInputs.space.press = spaceFunc;

        // esc for returning to main menu (with prompt)
        this.keyInputs.esc.press = escFunc;

        // p for pausing the game
        this.keyInputs.pause.press = pauseFunc;
    }

    /**
     * Cleans up the key inputs for the game session.
     * This is called when the game session is stopped.
     */
    #cleanUpKeyInputs() {
        this.keyInputs.left.press = null;
        this.keyInputs.left.release = null;
        this.keyInputs.right.press = null;
        this.keyInputs.right.release = null;
        this.keyInputs.up.press = null;
        this.keyInputs.up.release = null;
        this.keyInputs.down.press = null;
        this.keyInputs.down.release = null;
        this.keyInputs.space.press = null;
        this.keyInputs.esc.press = null;
        this.keyInputs.pause.press = null;
        this.keyInputs.enter.press = null;

        // force player to stop moving
        this.playerMoving = false;
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
     * @param {Number} [scaleToWall=1] - The scale of the entity to the wall.
     */
    #spawnEntity(entity, start_x = null, start_y = null, scaleToWall = 1) {
        let wallWidth = this.screenContent.arena.wallWidth
        let wallHeight = this.screenContent.arena.wallHeight
        entity.width = wallWidth * scaleToWall;
        entity.height = wallHeight * scaleToWall;

        // if entity scalling is negative, force it to be positive (to avoid spawning issues)
        // TODO remove for testing xd
        if (entity.scale.x < 0) {
            entity.scale.x *= -1;
        }
        if (entity.scale.y < 0) {
            entity.scale.y *= -1;
        }

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

    #prepareEntities() {
        // clear any existing entities
        if (this.screenContent.player) {
            this.app.stage.removeChild(this.screenContent.player);
        }
        for (let bomb of this.screenContent.bombs) {
            this.app.stage.removeChild(bomb.bomb);
        }
        this.screenContent.bombs = [];
        for (let explosion_instance of this.screenContent.explosions) {
            for (let explosion of explosion_instance.explosions) {
                this.app.stage.removeChild(explosion);
            }
        }
        this.screenContent.explosions = [];

        for (let enemy of this.screenContent.enemies) {
            enemy.remove();
        }
        this.screenContent.enemies = [];

        for (let wall of this.screenContent.breakableWalls) {
            this.app.stage.removeChild(wall);
        }
        this.screenContent.breakableWalls = [];

        this.enemiesSpriteTimer = 0;

        // prepare entities
        if (!this.endless) {
            const levelConfig = this.levelsConfig[0];

            // breakable walls
            for (let wall of levelConfig.breakableWalls) {
                const { gridX, gridY } = wall;
                const { x, y } = this.screenContent.arena.gridToCanvas(gridX, gridY);
                let breakableWall = new PIXI.Sprite(this.textures.break_wall);
                this.#spawnEntity(breakableWall, x, y);
                this.screenContent.breakableWalls.push(breakableWall);
            }

            // enemies
            for (let enemy of levelConfig.enemies) {
                const { gridX, gridY } = enemy;
                const { x, y } = this.screenContent.arena.gridToCanvas(gridX, gridY);
                let enemySprite = new PIXI.Sprite(this.textures.ghost01);
                const enemyObj = new Enemy(this.app, this.screenContent.arena, enemySprite, SCALE_ENEMY_TO_WALL, this.enemySprites, enemy.difficulty);
                enemyObj.spawn(x, y);
                this.screenContent.enemies.push(enemyObj);
            }
            
            // player
            const { gridX, gridY } = levelConfig.player;
            const { x, y } = this.screenContent.arena.gridToCanvas(gridX, gridY);
            this.screenContent.player = new PIXI.Sprite(this.textures.player);
            this.#spawnEntity(this.screenContent.player, x, y, SCALE_PLAYER_TO_WALL);
        }
        else {
            // TODO randomize (endless mode)
        }
    }

    /**
     * Updates the entity.
     * @param {PIXI.Sprite} entity - The entity to update.
     * @param {Number} deltaX - The change in x-coordinate.
     * @param {Number} deltaY - The change in y-coordinate. 
     */
    #updateEntityPosition(entity, deltaX, deltaY) {
        // TODO NOTE: handled separately to allow sliding along objects
        let {horizontal: willCollideHorizontalBomb, vertical: willCollideVerticalBomb} = this.#checkEntitiesCollision(entity, deltaX, deltaY, this.screenContent.bombs.map(bomb => bomb.bomb));
        let {horizontal: willCollideHorizontalWall, vertical: willCollideVerticalWall} = this.screenContent.arena.checkWallCollision(entity, deltaX, deltaY, checkCollision);
        let {horizontal: willCollideHorizontalBreakableWall, vertical: willCollideVerticalBreakableWall} = this.#checkEntitiesCollision(entity, deltaX, deltaY, this.screenContent.breakableWalls);

        if (!willCollideHorizontalBomb && !willCollideHorizontalWall && !willCollideHorizontalBreakableWall) {
            entity.x += deltaX;
        }
        if (!willCollideVerticalBomb && !willCollideVerticalWall && !willCollideVerticalBreakableWall) {
            entity.y += deltaY;
        }
    }

    /**
     * Updates the enemy sprites.
     * @param {Object} delta - The delta object.
     */
    #updateEnemies(delta) {
        // if (this.enemiesSpriteTimer > DURATION_MS_MOVEMENT_SPRITE_CHANGE) {
        //     for (let enemy of this.screenContent.enemies) {
        //         const enemySprite = enemy.elem;
        //         this.currentEnemySpriteIndex = (this.currentEnemySpriteIndex + 1) % this.enemySprites.length;
        //         enemySprite.texture = this.enemySprites[this.currentEnemySpriteIndex];
        //     }
        //     this.enemiesSpriteTimer -= DURATION_MS_MOVEMENT_SPRITE_CHANGE;
        // }
        // this.enemiesSpriteTimer += delta.elapsedMS;
        const updateData = {
            deltaX: 0,
            deltaY: 0,
            deltaTimeMS: delta.elapsedMS,
        }
        for (let enemy of this.screenContent.enemies) {
            enemy.update(updateData);
        }
        // TODO HERE
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
     * Updates the player movement based on key inputs.
     * @param {Object} delta - The delta object.
     */
    #updatePlayerMovement(delta) {
        const distance = this.movementSpeed * (delta.elapsedMS / 1000); // convert ms to seconds

        let deltaX = 0;
        let deltaY = 0;

        if (this.keyInputs.left.isDown) {
            deltaX -= distance;
            if (this.screenContent.player.scale.x > 0) {
                this.screenContent.player.scale.x *= -1;
                this.screenContent.player.x += this.screenContent.player.width;
            }
            this.playerMoving = true;
        }
        if (this.keyInputs.right.isDown) {
            deltaX += distance;
            if (this.screenContent.player.scale.x < 0) {
                this.screenContent.player.scale.x *= -1;
                this.screenContent.player.x -= this.screenContent.player.width;
            }
            this.playerMoving = true;
        }
        if (this.keyInputs.up.isDown) {
            deltaY -= distance;
            this.playerMoving = true;
        }
        if (this.keyInputs.down.isDown) {
            deltaY += distance;
            this.playerMoving = true;
        }

        // texture swapping
        if (this.playerMoving) {
            this.playerMovingTime += delta.elapsedMS;

            if (this.playerMovingTime > DURATION_MS_MOVEMENT_SPRITE_CHANGE) {
                this.currentPlayerMovementSpriteIndex = (this.currentPlayerMovementSpriteIndex + 1) % this.playerMovementSprites.length;
                this.screenContent.player.texture = this.playerMovementSprites[this.currentPlayerMovementSpriteIndex];
                this.playerMovingTime -= DURATION_MS_MOVEMENT_SPRITE_CHANGE;
            }
        } else {
            this.screenContent.player.texture = this.textures.player;
        }
        
        this.#updateEntityPosition(this.screenContent.player, deltaX, deltaY);
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
        let { x: x_center, y: y_center } = this.screenContent.arena.gridToCanvas(centerX, centerY);
        this.#spawnEntity(explosion, x_center, y_center);
        explosionInstance.explosions.push(explosion);
        // all directions
        for (let dir of spread) {
            if (this.screenContent.arena.grid[dir.y][dir.x].type === this.screenContent.arena.GRID_CELL_TYPE.EMPTY) {
                explosion = new PIXI.Sprite(this.textures.explosion);
                let { x, y } = this.screenContent.arena.gridToCanvas(dir.x, dir.y);
                this.#spawnEntity(explosion, x, y, SCALE_EXPLOSION_TO_WALL);
                explosionInstance.explosions.push(explosion);
            }
        }
        explosionInstance.time = this.stats.time;
        this.screenContent.explosions.push(explosionInstance);
        this.soundManager.playExplosion();
    }

    /**
     * Updates the explosions on the screen.
     */
    #updateExplosions() {
        const toRemove = [];
        for (let explosionInstance of this.screenContent.explosions) {
            const explosionTime = this.stats.time - explosionInstance.time;
            if (explosionTime >= DURATION_MS_EXPLOSION) {
                for (let explosion of explosionInstance.explosions) {
                    this.app.stage.removeChild(explosion);
                }
                toRemove.push(explosionInstance);
            }
        }
        // remove the explosion objects that are to be removed
        for (let explosionInstance of toRemove) {
            this.screenContent.explosions.splice(this.screenContent.explosions.indexOf(explosionInstance), 1);
        }
    }

    /**
     * Checks if the entity will collide with any entity from given array.
     * Information returned in separate horizontal and vertical flags 
     * to allow sliding along objects.
     * @param {PIXI.Sprite} entity - The entity to check.
     * @param {Number} deltaX - The change in x-coordinate.
     * @param {Number} deltaY - The change in y-coordinate.
     * @param {Array} entities - The entities to check against.
     * @returns {Object} An object with the horizontal and vertical collision flags.
     */
    #checkEntitiesCollision(entity, deltaX, deltaY, entities) {
        let willCollideHorizontal = false;
        let willCollideVertical = false;

        const {minX, minY} = entity.getBounds();

        for (let comparedEntity of entities) {
            const comparedEntityBounds = comparedEntity.getBounds();
            // if player is already colliding with bomb, let them leave
            if (checkCollision(minX, minY, entity.width, entity.height, comparedEntityBounds.x, comparedEntityBounds.y, comparedEntityBounds.width, comparedEntityBounds.height)) {
                return {willCollideHorizontal, willCollideVertical};
            }
            if (!willCollideHorizontal) {
                willCollideHorizontal = checkCollision(minX, minY, entity.width, entity.height, comparedEntityBounds.x, comparedEntityBounds.y, comparedEntityBounds.width, comparedEntityBounds.height, deltaX);
            }
            if (!willCollideVertical) {
                willCollideVertical = checkCollision(minX, minY, entity.width, entity.height, comparedEntityBounds.x, comparedEntityBounds.y, comparedEntityBounds.width, comparedEntityBounds.height, 0, deltaY);
            }
        }

        return {horizontal: willCollideHorizontal, vertical: willCollideVertical};
    }

    /**
     * Updates the bombs on the screen.
     */
    #updateBombs() {
        // check if a bomb should be placed
        if (this.bombPlaced) {
            // find the player's position (beware of negative scaling)
            const {minX: playerX, minY: playerY} = this.screenContent.player.getBounds();

            // put the bomb in the cell the player is most in
            const { x: cellX, y: cellY } = this.screenContent.arena.canvasToGrid(playerX, playerY);
            const { x, y } = this.screenContent.arena.gridToCanvas(cellX, cellY);

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
        const toRemove = [];
        for (let bomb of this.screenContent.bombs) {
            const bombTimePlaced = this.stats.time - bomb.time;

            // texture swapping
            const bombChangeTexture = Math.round(bombTimePlaced / DURATION_MS_BOMB_TEXTURE_CHANGE) % 2;
            const bombTextures = [this.textures.bomb, this.textures.bomb_ignited];
            bomb.bomb.texture = bombTextures[bombChangeTexture];

            // bomb is to be detonated
            if (bombTimePlaced >= DURATION_MS_BOMB) {
                this.app.stage.removeChild(bomb.bomb);

                this.#createExplosion(bomb.cellX, bomb.cellY);
                toRemove.push(bomb);
            }
        }
        // remove the bomb objects that are to be removed
        for (let bomb of toRemove) {
            this.screenContent.bombs.splice(this.screenContent.bombs.indexOf(bomb), 1);
        }
    }

    #playerGotHitState() {
        return this.gameSessionState.state === this.gameSessionState.GAME_SESSION_STATE_PLAYER_HIT;
    }

    /**
     * Updates the game entities.
     * @param {Object} delta - The delta object.
     */
    #updateEntities(delta) {
        this.#updatePlayerMovement(delta);
        this.#updateEnemies(delta);
        // TODO this.#updateEnemyMovement(delta);
        this.#updateBombs();
        this.#hitcheckEntities();
        if (this.#playerGotHitState()) {
            return;
        }
        this.#updateExplosions();
        this.#updateExitDoorLogic();
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

        this.#handleEntityGroupHitcheck(this.screenContent.breakableWalls, WALL_SCORE_VALUE);
    }

    #handleEntityGroupHitcheck(entities, scoreValue) {
        let entitiesHit = 0;
        let score = 0;
        const toRemove = [];
        for (let entity of entities) {
            const entityBounds = entity.getBounds();
            for (let explosionInstance of this.screenContent.explosions) {
                for (let explosion of explosionInstance.explosions) {
                    const explosionBounds = explosion.getBounds();
                    if (checkCollision(explosionBounds.x, explosionBounds.y, explosionBounds.width, explosionBounds.height, entityBounds.x, entityBounds.y, entityBounds.width, entityBounds.height)) {
                        this.app.stage.removeChild(entity);
                        entitiesHit += 1;
                        score += scoreValue;
                        toRemove.push(entity);
                        break;
                    }
                }
            }
        }
        // remove the entities that are to be removed
        for (let entity of toRemove) {
            entities.splice(entities.indexOf(entity), 1);
        }

        score = score * entitiesHit;
        this.stats.score += score;
    }

    /**
     * Updates the exit door on the screen.
     * The exit door is spawned when all enemies are defeated and all breakable walls are destroyed.
     * The exit door is removed when enemies are present or breakable walls are present.
     */
    #updateExitDoorLogic() {
        // door available
        if (this.screenContent.enemies.length === 0 && this.screenContent.breakableWalls.length === 0) {
            // if door not already spawned, spawn it (keep player on top)
            if (!this.screenContent.exitDoor) {
                this.screenContent.exitDoor = new PIXI.Sprite(this.textures.door);
                // put to center of the arena
                const { x, y } = this.screenContent.arena.gridToCanvas(Math.floor(this.screenContent.arena.colsCount / 2), 
                                                                       Math.floor(this.screenContent.arena.rowsCount / 2));
                this.#spawnEntity(this.screenContent.exitDoor, x, y);
                // keep player on top
                this.app.stage.removeChild(this.screenContent.player);
                this.app.stage.addChild(this.screenContent.player);
            }

            // check if doors completely contain player
            const playerBounds = this.screenContent.player.getBounds();
            const doorBounds = this.screenContent.exitDoor.getBounds();
            if (playerBounds.x >= doorBounds.x && playerBounds.x + playerBounds.width <= doorBounds.x + doorBounds.width &&
                playerBounds.y >= doorBounds.y && playerBounds.y + playerBounds.height <= doorBounds.y + doorBounds.height) {
                // player entered door
                // remove the config from the list
                this.levelsConfig.splice(this.level - 1, 1);
                this.level += 1;
                this.#cleanUpKeyInputs();
                this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_LEVEL_INFO_SCREEN);
            }

        }
        // door not available
        else {
            if (this.screenContent.exitDoor) {
                this.app.stage.removeChild(this.screenContent.exitDoor);
                this.screenContent.exitDoor = null;
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
     * Draws the info screen on the screen.
     * @param {String} text - The text to display.
     */
    #drawInfoScreen(text) {
        const { width: windowWidth, height: windowHeight } = this.app.screen;
        
        const background = new PIXI.Graphics();
        background.rect(0, 0, windowWidth, windowHeight);
        background.fill(HEX_COLOR_CODES.BLACK);
        this.app.stage.addChild(background);

        const infoScreenText = this.#getSizedText(text, windowWidth, windowHeight, SCALE_HEIGHT_PAUSE_SIGN_TO_SCREEN, SCALE_WIDTH_PAUSE_SIGN_TO_SCREEN);
        infoScreenText.x = (windowWidth - infoScreenText.width) / 2;
        infoScreenText.y = (windowHeight - infoScreenText.height) / 2;
        this.app.stage.addChild(infoScreenText);

        this.screenContent.infoScreenElems = [background, infoScreenText];
    }

    /**
     * Redraws the info screen on the screen.
     */
    #redrawInfoScreen() {
        const { width: windowWidth, height: windowHeight } = this.app.screen;
        // change background width and height
        this.screenContent.infoScreenElems[INDEX_SCREEN_CONTENT_INFO_SCREEN_BACKGROUND].width = windowWidth;
        this.screenContent.infoScreenElems[INDEX_SCREEN_CONTENT_INFO_SCREEN_BACKGROUND].height = windowHeight;

        // remove old text
        this.app.stage.removeChild(this.screenContent.infoScreenElems[INDEX_SCREEN_CONTENT_INFO_SCREEN_TEXT]);
        const text = this.screenContent.infoScreenElems[INDEX_SCREEN_CONTENT_INFO_SCREEN_TEXT].text;
        const infoScreenText = this.#getSizedText(text, windowWidth, windowHeight, SCALE_HEIGHT_PAUSE_SIGN_TO_SCREEN, SCALE_WIDTH_PAUSE_SIGN_TO_SCREEN);
        infoScreenText.x = (windowWidth - infoScreenText.width) / 2;
        infoScreenText.y = (windowHeight - infoScreenText.height) / 2;
        this.screenContent.infoScreenElems[INDEX_SCREEN_CONTENT_INFO_SCREEN_TEXT] = infoScreenText;
        this.app.stage.addChild(infoScreenText);
    }

    /**
     * Handles updating the game session when it is in progress.
     * Does not update when the screen is being resized.
     * @param {Object} delta - The delta object for time-based updates.
     */
    #handleGameSessionInProgressUpdate(delta) {
        // process entity updates when the screen is not being resized
        if (!this.basisChange) {
            // check if player finished last level
            if (!this.endless && this.levelsConfig.length === 0) {
                // TODO game over
            }



            this.stats.time = this.stats.time + delta.elapsedMS;

            this.#updateStats();
            this.#updateEntities(delta);

            // this.#handleLevelEnd();
            // this.#handleGameEnd();
        }
    }

    #handleGameSessionPlayerHitUpdate(delta) {
        if (this.keyInputs.left.release 
            || this.keyInputs.right.release 
            || this.keyInputs.up.release 
            || this.keyInputs.down.release
            || this.keyInputs.space.press
            || this.keyInputs.esc.press
            || this.keyInputs.pause.press) 
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

    /**
     * Handles updating the game session when it is in the level info screen.
     * @param {Object} delta - The delta object for time-based updates.
     */
    #handleGameSessionLevelInfoScreen(delta) {
        // if not already initialized
        if (!this.levelChangeInfo) {
            this.levelChangeInfo = {};
            this.levelChangeInfo.levelChangeTime = 0;

            const newLevelString = `Level: ${this.level}\nLives left: ${this.stats.lives}`;
            this.#drawInfoScreen(newLevelString);

            this.soundManager.playNewLevel();
        }

        // if its time to switch to the game session
        if (this.levelChangeInfo.levelChangeTime >= DURATION_MS_LEVEL_CHANGE) {
            this.levelChangeInfo = null;
            for (let elem of this.screenContent.infoScreenElems) {
                this.app.stage.removeChild(elem);
            }
            this.screenContent.infoScreenElems = [];

            this.#setUpKeyInputs();
            this.#prepareEntities();
            this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_IN_PROGRESS);
            return;
        }

        this.levelChangeInfo.levelChangeTime += delta.elapsedMS;
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

    /**
     * Handles updating the game session when the leave prompt is shown.
     */
    #handleGameSessionLeavePromptUpdate() {
        if (this.playerMoving) {
            this.screenContent.player.texture = this.textures.player;
            this.playerMoving = false;
        }

        if (this.screenContent.infoScreenElems.length === 0) {
            const leavePromptText = 'Are you sure you want to leave?\n\nPress ENTER to leave the game.\nPress ESC to return to the game.';
            this.#drawInfoScreen(leavePromptText);
        }

        if (this.leave === true) {
            this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_GAME_END);
        }
        if (this.leave === false) {
            for (let elem of this.screenContent.infoScreenElems) {
                this.app.stage.removeChild(elem);
            }
            this.screenContent.infoScreenElems = [];
            this.leave = null;
            this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_IN_PROGRESS);
        }
    }

    #handleGameSessionGameEndUpdate() {
        // left on user choice
        if (this.leave && this.leave === true) {
            this.ended = true;
            this.leave = null;
        }
        // TODO
    }

    /**
     * Starts the game session.
     */
    start() {
        this.#setUpKeyInputs();
        this.gameSessionState = new GameSessionState();

        this.#prepareLevelsConfig();
        console.log(MODULE_NAME_PREFIX, 'Levels config:', this.levelsConfig);

        this.screenContent.arena.draw(SCALE_WIDTH_ARENA_TO_SCREEN, SCALE_HEIGHT_ARENA_TO_SCREEN);
        this.#drawStats();
        // DEBUG add player sprite (now using bunny sprite)
        this.#prepareEntities();

        this.started = true;
        // TODO: add player and enemies
    }

    /**
     * Redraws the game session. Used when the screen is resized.
     */
    redraw() {
        this.basisChange = true;
        
        this.screenContent.arena.redraw(SCALE_WIDTH_ARENA_TO_SCREEN, SCALE_HEIGHT_ARENA_TO_SCREEN);
        for (let breakableWall of this.screenContent.breakableWalls) {
            this.#redrawEntity(breakableWall);
        }
        this.#drawStats();
        for (let enemy of this.screenContent.enemies) {
            enemy.redraw(this.prevScreenSize);
        }
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
        if (this.screenContent.exitDoor) {
            this.#redrawEntity(this.screenContent.exitDoor);
        }

        if (this.gameSessionState.state === this.gameSessionState.GAME_SESSION_STATE_LEVEL_INFO_SCREEN
            || this.gameSessionState.state === this.gameSessionState.GAME_SESSION_STATE_LEAVE_PROMPT) {
            this.#redrawInfoScreen();
        }

        this.prevWidth = this.app.screen.width;
        this.prevHeight = this.app.screen.height;
        this.prevScreenSize = {width: this.app.screen.width, height: this.app.screen.height};
        this.movementSpeed = this.app.screen.height * MOVEMENT_SPEED_SCALE_FACTOR_TO_HEIGHT;
        this.basisChange = false;
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

    /**
     * Cleans up the game session.
     */
    cleanUp() {
        this.#cleanUpKeyInputs();
        this.screenContent.arena.cleanUp();
        for (let elem of this.screenContent.hudElems) {
            this.app.stage.removeChild(elem);
        }
        
        for (let elem of this.screenContent.infoScreenElems) {
            this.app.stage.removeChild(elem);
        }
        
        if (this.screenContent.pauseSign) {
            this.app.stage.removeChild(this.screenContent.pauseSign);
        }
        
        if (this.screenContent.exitDoor) {
            this.app.stage.removeChild(this.screenContent.exitDoor);
        }
        
        for (let breakableWall of this.screenContent.breakableWalls) {
            this.app.stage.removeChild(breakableWall);
        }
        
        for (let bomb of this.screenContent.bombs) {
            this.app.stage.removeChild(bomb.bomb);
        }
        
        for (let explosionInstance of this.screenContent.explosions) {
            for (let explosion of explosionInstance.explosions) {
                this.app.stage.removeChild(explosion);
            }
        }
        
        for (let enemy of this.screenContent.enemies) {
            this.app.stage.removeChild(enemy.elem);
        }

        if (this.screenContent.player) {
            this.app.stage.removeChild(this.screenContent.player);
        }
        
        this.screenContent.nullable = true;
        this.levelsConfig = null;
        this.soundManager = null;
        this.textures = null;
        this.app = null;
        this.started = false;
        this.ended = false;
    }
}
