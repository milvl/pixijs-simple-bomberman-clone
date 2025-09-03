import * as PIXI from 'pixi.js';
import { HEX_COLOR_CODES } from "./constants/color_codes.js";
import { GameSessionState } from "./game_session_states.js";
import { LEVELS } from "./levels_config.js";
import { DURATIONS } from "./constants/durations.js";
import { Arena } from "./graphic_elements/arena.js";
import { Enemy } from "./graphic_elements/enemy.js";
import { Player } from "./graphic_elements/player.js";
import { Bomb } from "./graphic_elements/bomb.js";
import { Explosion } from "./graphic_elements/explosion.js";
import { BreakableWall } from "./graphic_elements/breakable_wall.js";
import { SCORES } from "./constants/scores.js";
import { ENDLESS_MODE_SETTINGS } from "./constants/endless_mode_settings.js";
import { Entity } from './graphic_elements/entity.js';

const MODULE_NAME_PREFIX = 'game_session.js - ';

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

const EASTER_EGG_TIME = 359990000; // 59 minutes 59 seconds

const WALL_SCORE_VALUE = SCORES.BREAKABLE_WALL;
const ENEMY_SCORE_VALUE = SCORES.ENEMY;

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
            level: 1,
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
        this.playerMovementTextures = [this.textures.player_walk01, /*this.textures.player_walk02,*/ this.textures.player_walk03];
        this.enemyTextures = [this.textures.ghost01, this.textures.ghost02, this.textures.ghost03, this.textures.ghost04, this.textures.ghost05, this.textures.ghost06];
        this.bombTextures = [this.textures.bomb_ignited, this.textures.bomb];
        this.playerHitScreenInfo = null;
        this.levelChangeInfo = null;
        this.enemiesSpriteTimer = null;
        
        // settings
        this.gameSessionState = null;
        this.livesLeft = settings.lives;
        this.levelsConfig = null;

        // flags
        this.started = false;
        this.ended = false;
        this.bombToBePlaced = false;
        this.livesLeftScreenInfo = null;
        this.userLeave = null;
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
    #setUpKeyInputs(state) {
        // player movement is handled on each frame update (to combat desync)

        // spacebar for bomb
        const spaceFunc = () => {
            if (this.started 
                && this.gameSessionState.state === this.gameSessionState.GAME_SESSION_STATE_IN_PROGRESS
                && this.screenContent.bombs.length < 1) 
            {
                this.bombToBePlaced = true;
            }
        }

        // keys for pausing the game
        const pauseFunc = () => {
            this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_PAUSED);
            this.#setUpKeyInputs(this.gameSessionState.state);
        }

        const unpauseFunc = () => {
            this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_IN_PROGRESS);
            this.#setUpKeyInputs(this.gameSessionState.state);
            this.#handleGameSessionPausedUpdate(true);
        }

        // keys for leaving the game session
        const bringUpLeavePromptFunc = () => {
            this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_LEAVE_PROMPT);
            this.#setUpKeyInputs(this.gameSessionState.state);
        }

        const backToGameFunc = () => {
            this.userLeave = false;
        }

        const leaveFunc = () => {
            this.userLeave = true;
        }

        if (this.started) {
            this.#cleanUpKeyInputs();
            switch (state) {
                case this.gameSessionState.GAME_SESSION_STATE_IN_PROGRESS:
                    this.keyInputs.space.press = spaceFunc;
                    this.keyInputs.pause.press = pauseFunc;
                    this.keyInputs.pauseUpper.press = pauseFunc;
                    this.keyInputs.esc.press = bringUpLeavePromptFunc;
                    break;
                
                case this.gameSessionState.GAME_SESSION_STATE_PAUSED:
                    this.keyInputs.pause.press = unpauseFunc;
                    this.keyInputs.pauseUpper.press = unpauseFunc;
                    break;
                
                case this.gameSessionState.GAME_SESSION_STATE_LEAVE_PROMPT:
                    this.keyInputs.enter.press = leaveFunc;
                    this.keyInputs.esc.press = backToGameFunc;
                    break;
                
                case this.gameSessionState.GAME_SESSION_STATE_GAME_END:
                    case this.gameSessionState.GAME_SESSION_STATE_PLAYER_HIT:
                    case this.gameSessionState.GAME_SESSION_STATE_LEVEL_INFO_SCREEN:
                    // no key inputs
                    break;
                
                default:
                    throw new Error(`${MODULE_NAME_PREFIX}Invalid game session state: ${state}`);
            }
        }
    }

    /**
     * Cleans up the key inputs for the game session.
     */
    #cleanUpKeyInputs() {
        this.keyInputs.space.press = null;
        this.keyInputs.esc.press = null;
        this.keyInputs.pause.press = null;
        this.keyInputs.pauseUpper.press = null;
        this.keyInputs.enter.press = null;
        this.keyInputs.up.press = null;
        this.keyInputs.down.press = null;
        this.keyInputs.left.press = null;
        this.keyInputs.right.press = null;
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
        this.app.stage.addChild(time);

        // draw text for score
        const score_text = `Score:\n${this.stats.score}`;
        const score = this.#getSizedText(score_text, hud_width, hud_height, SCALE_HEIGHT_HUD_TEXT_TO_HUD, SCALE_WIDTH_HUD_TEXT_TO_HUD);
        score.x = (hud_width * SCALE_WIDTH_OFFSET_SCORE_TEXT_TO_HUD) - (score.width / 2);
        score.y = (hud_height - (hud_height * SCALE_HEIGHT_HUD_TEXT_TO_HUD)) / 2;
        this.screenContent.hudElems.push(score);
        this.app.stage.addChild(score);

        // draw text for lives
        const lives_text = `Lives:\n${this.stats.lives}`;
        const lives = this.#getSizedText(lives_text, hud_width, hud_height, SCALE_HEIGHT_HUD_TEXT_TO_HUD, SCALE_WIDTH_HUD_TEXT_TO_HUD);
        lives.x = (hud_width * SCALE_WIDTH_OFFSET_LIVES_TEXT_TO_HUD) - (lives.width / 2);
        lives.y = (hud_height - (hud_height * SCALE_HEIGHT_HUD_TEXT_TO_HUD)) / 2;
        this.screenContent.hudElems.push(lives);
        this.app.stage.addChild(lives);
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

    /**
     * Prepares the entities for the game session.
     */
    #prepareEntities() {
        // clear any existing entities
        if (this.screenContent.player) {
            this.screenContent.player.remove();
        }
        for (let bomb of this.screenContent.bombs) {
            bomb.remove();
        }
        this.screenContent.bombs = [];
        for (let explosionObject of this.screenContent.explosions) {
            explosionObject.remove();
        }
        this.screenContent.explosions = [];

        for (let enemy of this.screenContent.enemies) {
            enemy.remove();
        }
        this.screenContent.enemies = [];

        for (let wall of this.screenContent.breakableWalls) {
            wall.remove();
        }
        this.screenContent.breakableWalls = [];

        this.enemiesSpriteTimer = 0;

        // prepare entities for normal mode
        if (!this.endless) {
            const levelConfig = this.levelsConfig[0];

            // breakable walls
            for (let wall of levelConfig.breakableWalls) {
                const { gridX, gridY } = wall;
                const { x, y } = this.screenContent.arena.gridToCanvas(gridX, gridY);
                let breakableWall = new BreakableWall(this.app, this.screenContent.arena, this.textures.break_wall);
                breakableWall.spawn(x, y);
                this.screenContent.breakableWalls.push(breakableWall);
            }

            // enemies
            for (let enemy of levelConfig.enemies) {
                const { gridX, gridY } = enemy;
                const { x, y } = this.screenContent.arena.gridToCanvas(gridX, gridY);
                const enemyObj = new Enemy(this.app, this.screenContent.arena, this.textures.ghost01, SCALE_ENEMY_TO_WALL, this.enemyTextures, enemy.difficulty);
                enemyObj.spawn(x, y);
                this.screenContent.enemies.push(enemyObj);
            }
            
            // player
            const { gridX, gridY } = levelConfig.player;
            const { x, y } = this.screenContent.arena.gridToCanvas(gridX, gridY);
            this.screenContent.player = new Player(this.app, this.screenContent.arena, this.textures.player, SCALE_PLAYER_TO_WALL, this.playerMovementTextures);
            this.screenContent.player.spawn(x, y);
        }
        // prepare entities for endless mode
        else {
            // player always in the middle
            const { x, y } = this.screenContent.arena.gridToCanvas(Math.floor(this.screenContent.arena.colsCount / 2), Math.floor(this.screenContent.arena.rowsCount / 2));
            this.screenContent.player = new Player(this.app, this.screenContent.arena, this.textures.player, SCALE_PLAYER_TO_WALL, this.playerMovementTextures);
            this.screenContent.player.spawn(x, y);

            // put breakable walls inside the player's position and one around the player
            // this is to ensure that randomly spawned enemies/breakable walls will not be able to reach the player immediately
            // they will be removed when the random enemies/breakable walls are spawned
            const toRemove = [];
            const { x: playerGridX, y: playerGridY } = this.screenContent.arena.canvasToGrid(x, y);
            for (let i = -2; i <= 2; i++) {
                for (let j = -2; j <= 2; j++) {
                    const { x: wallX, y: wallY } = this.screenContent.arena.gridToCanvas(playerGridX + i, playerGridY + j);
                    let breakableWall = new BreakableWall(this.app, this.screenContent.arena, this.textures.break_wall);
                    breakableWall.spawn(wallX, wallY);
                    this.screenContent.breakableWalls.push(breakableWall);
                    toRemove.push(breakableWall);
                }
            }

            // randomize breakable walls count and enemy count
            const breakableWallsCount = Math.floor(Math.random() * ENDLESS_MODE_SETTINGS.MAX_BREAKABLE_WALLS) + 1;
            const enemiesCount = Math.floor(Math.random() * ENDLESS_MODE_SETTINGS.MAX_ENEMIES) + 1;

            // randomize breakable walls
            for (let i = 0; i < breakableWallsCount; i++) {
                let gridX = Math.floor(Math.random() * this.screenContent.arena.colsCount);
                let gridY = Math.floor(Math.random() * this.screenContent.arena.rowsCount);
                let placed = false;
                while (!placed) {
                    let foundSpace = true;
                    for (let wall of this.screenContent.breakableWalls) {
                        let { gridX: placedWallGridX, gridY: placedWallGridY } = wall.gridPosition;
                        if (gridX === placedWallGridX && gridY === placedWallGridY || this.screenContent.arena.grid[gridY][gridX].type === Arena.GRID_CELL_TYPE.WALL) {
                            gridX = Math.floor(Math.random() * this.screenContent.arena.colsCount);
                            gridY = Math.floor(Math.random() * this.screenContent.arena.rowsCount);
                            foundSpace = false;
                            break;
                        }
                    }
                    if (!foundSpace) {
                        continue;
                    }

                    const { x: wallX, y: wallY } = this.screenContent.arena.gridToCanvas(gridX, gridY);
                    let breakableWall = new BreakableWall(this.app, this.screenContent.arena, this.textures.break_wall);
                    breakableWall.spawn(wallX, wallY);
                    this.screenContent.breakableWalls.push(breakableWall);
                    placed = true;
                }
                
            }

            // randomize enemies
            for (let i = 0; i < enemiesCount; i++) {
                let gridX = Math.floor(Math.random() * this.screenContent.arena.colsCount);
                let gridY = Math.floor(Math.random() * this.screenContent.arena.rowsCount);
                let placed = false;
                while (!placed) {
                    let foundSpace = true;
                    for (let wall of this.screenContent.breakableWalls) {
                        let { gridX: placedWallGridX, gridY: placedWallGridY } = wall.gridPosition;
                        if (gridX === placedWallGridX && gridY === placedWallGridY || this.screenContent.arena.grid[gridY][gridX].type === Arena.GRID_CELL_TYPE.WALL) {
                            gridX = Math.floor(Math.random() * this.screenContent.arena.colsCount);
                            gridY = Math.floor(Math.random() * this.screenContent.arena.rowsCount);
                            foundSpace = false;
                            break;
                        }
                    }
                    if (!foundSpace) {
                        continue;
                    }

                    const { x: enemyX, y: enemyY } = this.screenContent.arena.gridToCanvas(gridX, gridY);
                    const enemyObj = new Enemy(this.app, this.screenContent.arena, this.textures.ghost01, SCALE_ENEMY_TO_WALL, this.enemyTextures);
                    enemyObj.spawn(enemyX, enemyY);
                    this.screenContent.enemies.push(enemyObj);
                    placed = true;
                
                }
            }

            // remove the breakable walls that were placed around the player
            for (let wall of toRemove) {
                wall.remove();
                this.screenContent.breakableWalls.splice(this.screenContent.breakableWalls.indexOf(wall), 1);
            }

            // debug breakable wall
            // let breakableWall = new BreakableWall(this.app, this.screenContent.arena, this.textures.break_wall);
            // const { x: wallX, y: wallY } = this.screenContent.arena.gridToCanvas(1, 1);
            // breakableWall.spawn(wallX, wallY);
            // this.screenContent.breakableWalls.push(breakableWall);
        }
    }

    /**
     * Updates the enemy sprites.
     * @param {Object} delta - The delta object.
     * @param {Array} obstacles - The obstacles to check against.
     * @param {Array} bombs - The bombs to check against.
     * @param {Array} entitiesToCheckHitBy - The explosion instances to check against.
     * @returns {Object} The updated enemy data.
     */
    #updateEnemies(delta, obstacles, bombs, entitiesToCheckHitBy) {
        const updateData = {
            deltaX: null,
            deltaY: null,
            deltaTimeMS: delta.elapsedMS,
            playerGridPosition: this.screenContent.player.gridPosition,
            obstacles: obstacles,
            bombs: bombs,
            entitiesToCheckHitBy: entitiesToCheckHitBy,
        }

        const toRemove = [];
        for (let enemy of this.screenContent.enemies) {
            const updateResponse = enemy.update(updateData);
            if (updateResponse.hit) {
                toRemove.push(enemy);
            }
        }
        // remove the enemies that are to be removed
        for (let enemy of toRemove) {
            enemy.remove();
            this.screenContent.enemies.splice(this.screenContent.enemies.indexOf(enemy), 1);
        }

        return { enemiesHit: toRemove.length };
    }

    /**
     * Updates the stats on the screen.
     */
    #updateStats() {
        this.screenContent.hudElems[INDEX_SCREEN_CONTENT_HUD_TEXT_TIME].text = `Time:\n${parseTime(this.stats.time)}`;
        this.screenContent.hudElems[INDEX_SCREEN_CONTENT_HUD_TEXT_SCORE].text = `Score:\n${this.stats.score}`;
        this.screenContent.hudElems[INDEX_SCREEN_CONTENT_HUD_TEXT_LIVES].text = `Lives:\n${this.stats.lives}`;
    }

    /**
     * Updates the player movement based on key inputs.
     * @param {Object} delta - The delta object.
     * @param {Array} obstacles - The obstacles to check against.
     * @param {Array} bombs - The bombs to check against.
     * @param {Array} entitiesToCheckHitBy - The entities to hit check against.
     * @returns {Boolean} True if the player got hit, false otherwise.
     */
    #updatePlayer(delta, obstacles, bombs, entitiesToCheckHitBy) {
        const playerUpdateData = {
            deltaTimeMS: delta.elapsedMS,
            keyInputs: this.keyInputs,
            obstacles: obstacles,
            bombs: bombs,
            entitiesToCheckHitBy: entitiesToCheckHitBy,
        }
        
        const res = this.screenContent.player.update(playerUpdateData);
        return res;
    }

    /**
     * Updates the breakable walls on the screen.
     * @param {Array} entitiesToCheckHitBy - The entities for breakable walls to check hit by.
     * @returns {Object} The updated breakable wall data.
     */
    #updateBreakableWalls(entitiesToCheckHitBy) {
        const updateData = {
            entitiesToCheckHitBy: entitiesToCheckHitBy,
        }

        const toRemove = [];
        for (let wall of this.screenContent.breakableWalls) {
            const updateResponse = wall.update(updateData);
            if (updateResponse.hit) {
                toRemove.push(wall);
            }
        }

        // remove the breakable walls that are to be removed
        for (let wall of toRemove) {
            wall.remove();
            this.screenContent.breakableWalls.splice(this.screenContent.breakableWalls.indexOf(wall), 1);
        }

        return { brokenWalls: toRemove.length };
    }

    /**
     * Places a bomb on the screen.
     * The bomb is placed where the player is most in.
     */
    #placeBomb() {
        // find the player's position (beware of negative scaling)
        const {minX: playerX, minY: playerY} = this.screenContent.player.elem.getBounds();

        // put the bomb in the cell the player is most in
        const { x: cellX, y: cellY } = this.screenContent.arena.canvasToGrid(playerX, playerY);
        const { x, y } = this.screenContent.arena.gridToCanvas(cellX, cellY);

        const bombObject = new Bomb(this.app, this.screenContent.arena, this.textures.bomb, SCALE_BOMB_TO_WALL, this.bombTextures);
        bombObject.spawn(x, y);
        console.log(MODULE_NAME_PREFIX, `Bomb placed at [${x}, ${y}], grid: [${cellX}, ${cellY}]`);
        
        // add the bomb to the list of bombs
        this.screenContent.bombs.push(bombObject);
    }

    /**
     * Updates the bombs on the screen.
     * @param {Object} delta - The delta object.
     */
    #updateBombs(delta) {
        // check if a bomb should be placed
        if (this.bombToBePlaced) {
            this.#placeBomb();
            this.bombToBePlaced = false;
        }

        // update each bomb
        const toRemove = [];
        for (let bomb of this.screenContent.bombs) {
            bomb.update({deltaTimeMS: delta.elapsedMS});

            // bomb is to be detonated
            if (bomb.isExploding) {
                bomb.remove();

                this.#createExplosion(bomb.elem.x, bomb.elem.y);
                toRemove.push(bomb);
            }
        }
        // remove the bomb objects that are to be removed
        for (let bomb of toRemove) {
            this.screenContent.bombs.splice(this.screenContent.bombs.indexOf(bomb), 1);
        }
    }

    /**
     * Creates an explosion on the screen.
     * @param {Number} x - The x-coordinate of the bomb.
     * @param {Number} y - The y-coordinate of the bomb. 
     */
    #createExplosion(x, y) {
        const { x: gridX, y: gridY } = this.screenContent.arena.canvasToGrid(x, y);
        const explosion = new Explosion(this.app, this.screenContent.arena, this.textures.explosion, SCALE_EXPLOSION_TO_WALL);
        explosion.spawn(gridX, gridY);
        console.log(MODULE_NAME_PREFIX, `Explosion created at [${x}, ${y}], grid: [${gridX}, ${gridY}]`);
        this.screenContent.explosions.push(explosion);
        this.soundManager.playExplosion();
    }

    /**
     * Updates the explosions on the screen.
     * @param {Object} delta - The delta object.
     */
    #updateExplosions(delta) {
        const toRemove = [];
        for (let explosionObject of this.screenContent.explosions) {
            if (explosionObject.isFinished) {
                toRemove.push(explosionObject);
            }
        }
        // remove the explosion objects that are to be removed
        for (let explosionObject of toRemove) {
            this.screenContent.explosions.splice(this.screenContent.explosions.indexOf(explosionObject), 1);
        }

        // update each explosion
        for (let explosionObject of this.screenContent.explosions) {
            explosionObject.update({deltaTimeMS: delta.elapsedMS});
        }
    }

    /**
     * Gets the obstacles on the screen.
     * @returns {Array} The obstacles on the screen.
     */
    #getObstacles() {
        const obstacles = [];  
        this.screenContent.breakableWalls.forEach(wall => {
            obstacles.push(wall);
        });

        return obstacles;
    }

    /**
     * Gets the entities to check hit by on the screen.
     * Their hitboxes are scaled down to 70% of their original size.
     * This is to give the player a bit of leeway when dodging enemies.
     * @returns {Array} The entities to check hit by on the screen.
     */
    #getCustomEnemyHitcheckObjects() {
        const objects = [];
        for (let enemy of this.screenContent.enemies) {
            const realBounds = enemy.elem.getBounds();
            // coyote time similar adjustment
            const scale = 0.5;
            const minX = realBounds.minX + ((realBounds.width - realBounds.width * scale) / 2);
            const minY = realBounds.minY + ((realBounds.height - realBounds.height * scale) / 2);
            const width = realBounds.width * scale;
            const height = realBounds.height * scale;

            const hitBounds = {
                getBounds: () => {
                    return {minX: minX, minY: minY, x: minX, y: minY, width: width, height: height};
                }
            }

            objects.push({elem: hitBounds});
        }

        return objects;
    }

    /**
     * Updates the game entities.
     * @param {Object} delta - The delta object.
     * @returns {Object} The update response.
     */
    #updateEntities(delta) {
        let updateResponse = {};
        const obstacles = this.#getObstacles();
        const bombs = this.screenContent.bombs;
        const explosionInstances = this.screenContent.explosions.map(explosion => explosion.explosionInstances).flat();
        const enemies = this.#getCustomEnemyHitcheckObjects();
        let enemiesHit = 0;
        let brokenWalls = 0;

        // uodate player
        updateResponse = this.#updatePlayer(delta, obstacles, bombs, [...enemies, ...explosionInstances]);
        if (updateResponse.hit) {
            this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_PLAYER_HIT);
            this.soundManager.playPlayerHit();
            return;
        }

        // update enemies
        updateResponse = this.#updateEnemies(delta, obstacles, bombs, explosionInstances);
        if (updateResponse.enemiesHit) {
            enemiesHit += updateResponse.enemiesHit;
        }

        // update breakable walls
        updateResponse = this.#updateBreakableWalls(explosionInstances);
        if (updateResponse.brokenWalls) {
            brokenWalls += updateResponse.brokenWalls;
        }

        this.#updateBombs(delta);
        this.#updateExplosions(delta);
        this.#updateExitDoorLogic();

        return { enemiesHit: enemiesHit, brokenWalls: brokenWalls };
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
                this.screenContent.player.moveToTop();
            }

            // check if doors completely contain player
            const playerBounds = this.screenContent.player.elem.getBounds();
            const doorBounds = this.screenContent.exitDoor.getBounds();
            if (playerBounds.x >= doorBounds.x && playerBounds.x + playerBounds.width <= doorBounds.x + doorBounds.width &&
                playerBounds.y >= doorBounds.y && playerBounds.y + playerBounds.height <= doorBounds.y + doorBounds.height) {
                // player entered door

                if (!this.endless) {
                    // remove the config from the list
                    this.levelsConfig.splice(0, 1);
                    if (this.levelsConfig.length === 0) {
                        this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_GAME_END);
                        this.#cleanUpKeyInputs();
                        return;
                    }
                }
                this.stats.level += 1;
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
     * Updates the game score.
     * @param {Object} scoreUpdate - The score update object.
     */
    #updateScore(scoreUpdate) {
        if (!scoreUpdate) {
            return;
        }
        let multiplier = 0;
        let result = 0;

        if (scoreUpdate.enemiesHit) {
            result += ENEMY_SCORE_VALUE * scoreUpdate.enemiesHit;
            multiplier += scoreUpdate.enemiesHit;
        }
        if (scoreUpdate.brokenWalls) {
            result += WALL_SCORE_VALUE * scoreUpdate.brokenWalls;
            multiplier += scoreUpdate.brokenWalls;
        }
        
        const addition = result * multiplier;
        if (addition > 0) {
            this.soundManager.playPlayerScored();
            this.stats.score += result * multiplier;
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
        let scoreUpdateResponse = {};

        // process entity updates when the screen is not being resized
        if (!this.basisChange) {
            this.stats.time = this.stats.time + delta.elapsedMS;

            this.#updateStats();
            scoreUpdateResponse = this.#updateEntities(delta);
            this.#updateScore(scoreUpdateResponse);
        }
    }

    /**
     * Handles updating the game session when the player is hit.
     * @param {Object} delta Delta object for time-based updates.
     */
    #handleGameSessionPlayerHitUpdate(delta) {
        if (this.keyInputs.space.press
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
            this.screenContent.player.moveToTop();
        
            this.playerHitScreenInfo = {};
            this.playerHitScreenInfo.playerHitTime = 0;
            this.playerHitScreenInfo.playerHitBlinkTime = 0;
        }

        // blink the player sprite
        if (this.playerHitScreenInfo.playerHitBlinkTime >= DURATIONS.MS_PLAYER_HIT_BLINK) {
            if (this.screenContent.player.visible) {
                this.screenContent.player.visible = false;
            }
            else {
                this.screenContent.player.visible = true;

            }
            this.playerHitScreenInfo.playerHitBlinkTime = 0;
        }

        // player hit timer check
        if (this.playerHitScreenInfo.playerHitTime >= DURATIONS.MS_PLAYER_HIT) {
            this.playerHitScreenInfo = null;
            this.stats.lives -= 1;

            // check if player has no more lives
            if (this.stats.lives < 0) {
                this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_GAME_END);
                return;
            }
            else {
                // reset timers
                this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_LEVEL_INFO_SCREEN);
                return;
            }
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

            const newLevelString = `Level: ${this.stats.level}\nLives left: ${this.stats.lives}`;
            this.#drawInfoScreen(newLevelString);

            this.soundManager.playNewLevel();
        }

        // if its time to switch to the game session
        if (this.levelChangeInfo.levelChangeTime >= DURATIONS.MS_LEVEL_CHANGE) {
            this.levelChangeInfo = null;
            for (let elem of this.screenContent.infoScreenElems) {
                this.app.stage.removeChild(elem);
            }
            this.screenContent.infoScreenElems = [];

            this.#prepareEntities();
            this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_IN_PROGRESS);
            this.#setUpKeyInputs(this.gameSessionState.state);
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
        if (this.screenContent.infoScreenElems.length === 0) {
            const leavePromptText = 'Are you sure you want to leave?\n\nPress ENTER to leave the game.\nPress ESC to return to the game.';
            this.#drawInfoScreen(leavePromptText);
        }

        if (this.userLeave === true) {
            this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_GAME_END);
            this.#cleanUpKeyInputs();
            // dont set up key inputs here, because the game session will be cleaned up
        }
        if (this.userLeave === false) {
            for (let elem of this.screenContent.infoScreenElems) {
                this.app.stage.removeChild(elem);
            }
            this.screenContent.infoScreenElems = [];
            this.userLeave = null;
            this.gameSessionState.switchToGameState(this.gameSessionState.GAME_SESSION_STATE_IN_PROGRESS);
            this.#setUpKeyInputs(this.gameSessionState.state);
        }
    }

    /**
     * Handles updating the game session when the game ends.
     * this.ended and this.userLeave are read by higher module (game.js)
     * to determine how the game session ended.
     */
    #handleGameSessionGameEndUpdate() {
        // left by player defeat or levels completed
        if (!this.userLeave) {
            this.userLeave = false;
        }

        // otherwise left on user choice        

        this.ended = true;
    }

    /**
     * Starts the game session.
     */
    start() {
        this.gameSessionState = new GameSessionState();

        this.#prepareLevelsConfig();
        console.log(MODULE_NAME_PREFIX, 'Levels config:', this.levelsConfig);

        this.screenContent.arena.draw(SCALE_WIDTH_ARENA_TO_SCREEN, SCALE_HEIGHT_ARENA_TO_SCREEN);
        this.#drawStats();
        this.#prepareEntities();

        this.started = true;
        this.#setUpKeyInputs(this.gameSessionState.state);
    }

    /**
     * Redraws the game session. Used when the screen is resized.
     */
    redraw() {
        this.basisChange = true;
        
        this.screenContent.arena.redraw(SCALE_WIDTH_ARENA_TO_SCREEN, SCALE_HEIGHT_ARENA_TO_SCREEN);
        for (let breakableWall of this.screenContent.breakableWalls) {
            breakableWall.redraw(this.prevScreenSize);
        }
        this.#drawStats();
        for (let enemy of this.screenContent.enemies) {
            enemy.redraw(this.prevScreenSize);
        }
        this.screenContent.player.redraw(this.prevScreenSize);
        for (let bomb of this.screenContent.bombs) {
            bomb.redraw(this.prevScreenSize);
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
            breakableWall.remove();
        }
        
        for (let bomb of this.screenContent.bombs) {
            bomb.remove();
        }
        
        for (let explosion of this.screenContent.explosions) {
            explosion.remove();
        }
        
        for (let enemy of this.screenContent.enemies) {
            enemy.remove();
        }

        if (this.screenContent.player) {
            this.screenContent.player.remove();
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
