import $ from 'jquery';
import * as PIXI from 'pixi.js';
import { GameState, GAME_STATES } from "./game_states.js";
import { MainMenuDrawingManager, SettingsDrawingManager, EndGameDrawingManager, LeaderboardsDrawingManager } from "./drawing_manager_menus.js";
import { GameSessionManager } from "./game_session.js";

const MODULE_NAME_PREFIX = 'game.js - ';

const ARENA_ROWS = 11;
const ARENA_COLS = 21;

const DEFAULT_SETTINGS = {
    lives: 3,
    volume: true,
    endless: false,
};

const DEFAULT_MAIN_MENU_CONTENT = {
    updated: true,
    title: 'KIV/UUR - Bomberman Clone',
    options: [
        'Start Game',
        'Settings',
        'Leaderboards',
    ],
    selected: 0,
    submited: null,
};

const DEFAULT_SETTINGS_CONTENT = {
    updated: true,
    title: 'Settings',
    options: [
        'Lives: ',
        'Volume: ',
        'Endless Mode: ',
        'Back',
    ],
    optionsValues: [
        DEFAULT_SETTINGS.lives,
        DEFAULT_SETTINGS.volume,
        DEFAULT_SETTINGS.endless,
        undefined,
    ],
    selected: 0,
    submited: null,
};

const DEFAULT_GAME_END_CONTENT = {
    updated: true,
    title: '-----------\n | Game End | \n  -----------  \n\n\n Enter your name:',
    options: [
        { letter: 'A', index: 0 },
        { letter: 'A', index: 0 },
        { letter: 'A', index: 0 },
    ],
    infoTip: 'User arrow keys to select letters and press enter to submit.',
    selected: 0,
    submited: null,
};

const AVAILIBLE_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const DEFAULT_LEADERBOARDS_CONTENT = {
    updated: false,
    ready: false,
    title: 'Leaderboards',
    options: [
        'Mode: ',
        'Lives: ',
    ],
    optionsValues: [
        'Normal',
        3,
    ],
    header: [
        'Rank',
        'Name',
        'Level',
        'Score',
        'Time',
    ],
};

/**
 * Returns the modulo of two numbers.
 * @param {Number} n - The dividend.
 * @param {Number} m - The divisor.
 * @returns {Number} The modulo of the two numbers.
 */
function mod(n, m) {
    return ((n % m) + m) % m;
}

/**
 * Represents a game.
 */
export class Game {
    /**
     * Creates a new Game object.
     * @param {Window} window - The window object.
     * @param {PIXI.Application} app - The PIXI application.
     * @param {Object} textures - The textures object.
     * @param {SoundManager} soundManager - The sound manager object.
     * @param {Object} keyInputs - The key inputs object.
     * @param {Object} windowChange - The window change object.
     * @returns {Game} The new Game object.
     */
    constructor(window, app, textures, soundManager, keyInputs, windowChange) {
        this.window = window;
        this.app = app;
        this.textures = textures;
        this.soundManager = soundManager;
        this.keyInputs = keyInputs;
        this.windowChange = windowChange;

        this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        this.gameState = new GameState(this.window);
        this.screenContent = null;
        this.recievedStats = null;
        this.drawingManager = null;
        this.screenWidth = this.app.screen.width;
        this.screenHeight = this.app.screen.height;
    }

    /**
     * Binds the arrow keys to functions to operate the menu.
     * @param {Function} enterCallback - The callback function to call when the enter key is pressed.
     */
    #setupOptionsKeys(enterCallback) {
        this.keyInputs.up.press = () => {
            if (!this.keyInputs.down.isDown) {
                this.screenContent.selected = mod(this.screenContent.selected - 1, this.screenContent.options.length);
                this.soundManager.playCursor();
                this.screenContent.updated = true;
            }
        }
        this.keyInputs.down.press = () => {
            if (!this.keyInputs.up.isDown) {
                this.screenContent.selected = mod(this.screenContent.selected + 1, this.screenContent.options.length);
                this.soundManager.playCursor();
                this.screenContent.updated = true;
            }
        }
        this.keyInputs.enter.press = enterCallback;
    }

    /**
     * Unbinds the arrow keys from functions.
     */
    #unsetOptionsKeys() {
        this.keyInputs.up.press = undefined;
        this.keyInputs.down.press = undefined;
        this.keyInputs.enter.press = undefined;
        this.keyInputs.left.press = undefined;
        this.keyInputs.right.press = undefined;
    }

    /**
     * Cleans up menu binds and content.
     */
    #cleanUpMenu() {
        this.#unsetOptionsKeys();
        this.screenContent = null;
    }

    /**
     * Initializes the main menu.
     */
    #initMainMenu() {
        // copy the default content
        this.screenContent = { ...DEFAULT_MAIN_MENU_CONTENT }

        // bind key inputs to functions to update the content
        let enterCallback = () => {
            if (this.screenContent.selected != null) {
                switch (this.screenContent.selected) {
                    case 0:
                        this.screenContent.submited = this.screenContent.selected;
                        break;
                    case 1:
                        this.screenContent.submited = this.screenContent.selected;
                        break;
                    case 2:
                        this.screenContent.submited = this.screenContent.selected;
                        break;
                    default:
                        console.error(MODULE_NAME_PREFIX, 'Invalid option selected.');
                        break;
                }
                this.soundManager.playCursorSubmit();
                this.screenContent.updated = true;
            }
        };
        this.#setupOptionsKeys(enterCallback);
    }

    /**
     * Handles updating the main menu.
     */
    #handleMainMenuUpdate() {
        if (this.screenContent == null) {
            this.#initMainMenu();
            this.drawingManager = new MainMenuDrawingManager(this.app, this.textures, this.screenContent);
            this.drawingManager.draw();
        }

        let switchTo = null;

        if (this.screenContent.updated) {
            // if selected option was submited, switch to the corresponding state
            if (this.screenContent.submited != null) {
                console.log(MODULE_NAME_PREFIX, 'Switching to:', this.screenContent.options[this.screenContent.submited]);
                switch (this.screenContent.submited) {
                    case 0:
                        switchTo = GAME_STATES.GAME_SESSION;
                        break;
                    case 1:
                        switchTo = GAME_STATES.SETTINGS;
                        break;
                    case 2:
                        switchTo = GAME_STATES.LEADERBOARDS;
                        break;
                    default:
                        console.error(MODULE_NAME_PREFIX, 'Invalid option submited.');
                        break;
                }
                if (switchTo != null) {
                    this.#cleanUpMenu();
                    this.drawingManager.cleanUp();
                    this.drawingManager = null;
                    this.gameState.switchState(switchTo);
                    switchTo = null;
                }
            }
            // otherwise, draw the main menu updated content
            else {
                this.drawingManager.redraw();
                console.log(MODULE_NAME_PREFIX, 'Selected:', this.screenContent.options[this.screenContent.selected]);
                this.screenContent.updated = false;
            }
        }
    }

    /**
     * Initializes the game session.
     */
    #initGameSession() {
        this.screenContent = {};
        this.drawingManager = new GameSessionManager(this.app, this.settings, this.screenContent, this.textures, this.soundManager, this.keyInputs, ARENA_ROWS, ARENA_COLS);
        this.drawingManager.start();
    }

    #handleGameSessionUpdate(delta) {
        if (this.screenContent === null) {
            this.#initGameSession();
        }
        if (this.drawingManager.ended === true) {
            this.drawingManager.cleanUp();

            // user left the game
            if (this.drawingManager.userLeave === true) {
                this.drawingManager = null;
                if (this.screenContent.nullable === true) {
                    this.screenContent = null;
                }

                this.gameState.switchState(GAME_STATES.MAIN_MENU);
            }
            // game ended with a win or loss
            else {
                this.recievedStats = this.drawingManager.stats;
                this.recievedStats.lives = this.settings.lives;
                this.recievedStats.mode = this.settings.endless ? 'endless' : 'normal';
                this.drawingManager = null;
                if (this.screenContent.nullable === true) {
                    this.screenContent = null;
                }

                this.gameState.switchState(GAME_STATES.GAME_END);
            }
        }
        else {
            this.drawingManager.update(delta);
        }
    }

    /**
     * Returns the settings content.
     * @returns {Object} The settings content.
     */
    #getSettingsContent() {
        let content = { ...DEFAULT_SETTINGS_CONTENT };
        content.optionsValues[0] = this.settings.lives;
        content.optionsValues[1] = this.settings.volume;
        content.optionsValues[2] = this.settings.endless;
        return content;
    }

    /**
     * Initializes the settings.
     */
    #initSettings() {
        this.screenContent = this.#getSettingsContent();

        // bind key inputs to functions to update the content
        let enterCallback = () => {
            if (this.screenContent.selected != null) {
                switch (this.screenContent.selected) {
                    case 0:
                        this.screenContent.optionsValues[this.screenContent.selected] = mod(this.screenContent.optionsValues[this.screenContent.selected] + 1, DEFAULT_SETTINGS.lives + 1);
                        this.settings.lives = this.screenContent.optionsValues[this.screenContent.selected];
                        break;
                    case 1:
                        this.screenContent.optionsValues[this.screenContent.selected] = !this.screenContent.optionsValues[this.screenContent.selected];
                        this.settings.volume = this.screenContent.optionsValues[this.screenContent.selected];
                        this.soundManager.soundEnabled = this.settings.volume;
                        break;
                    case 2:
                        this.screenContent.optionsValues[this.screenContent.selected] = !this.screenContent.optionsValues[this.screenContent.selected];
                        this.settings.endless = this.screenContent.optionsValues[this.screenContent.selected];
                        break;
                    case 3:
                        this.screenContent.submited = this.screenContent.selected;
                        break;
                    default:
                        console.error(MODULE_NAME_PREFIX, 'Invalid option selected.');
                        break;
                }
                this.soundManager.playCursorSubmit();
                this.screenContent.updated = true;
            }
        };
        this.#setupOptionsKeys(enterCallback);
    }

    /**
     * Handles updating the settings.
     */
    #handleSettingsUpdate() {
        if (this.screenContent === null) {
            this.#initSettings();
            this.drawingManager = new SettingsDrawingManager(this.app, this.textures, this.screenContent);
        }

        let switchToMainMenu = false;

        if (this.screenContent.updated) {
            // if selected option was submited, switch to the corresponding state
            if (this.screenContent.submited != null) {
                console.log(MODULE_NAME_PREFIX, 'Switching to:', this.screenContent.options[this.screenContent.submited]);
                switch (this.screenContent.submited) {
                    case 3:
                        switchToMainMenu = true;
                        break;
                    default:
                        console.error(MODULE_NAME_PREFIX, 'Invalid option submited.');
                        break;
                }
                if (switchToMainMenu) {
                    this.#cleanUpMenu();
                    this.drawingManager.cleanUp();
                    this.gameState.switchState(GAME_STATES.MAIN_MENU);
                    switchToMainMenu = false;
                }
            }
            // otherwise, draw the settings updated content
            else {
                this.drawingManager.redraw();
                console.log(MODULE_NAME_PREFIX, 'Selected:', this.screenContent.options[this.screenContent.selected]);
                this.screenContent.updated = false;
            }
        }
    }

    /**
     * Sets up the keys for the leaderboards screen.
     */
    #setupLeaderboardsKeys() {
        const changeModeFunc = () => {
            this.screenContent.optionsValues[0] = this.screenContent.optionsValues[0] === 'Normal' ? 'Endless' : 'Normal';
            this.soundManager.playCursor();
            this.screenContent.updated = true;
        }
        
        this.keyInputs.up.press = () => {
            if (!this.keyInputs.down.isDown) {
                changeModeFunc();
            }
        }

        this.keyInputs.down.press = () => {
            if (!this.keyInputs.up.isDown) {
                changeModeFunc();
            }
        }

        const changeLivesFunc = (delta) => {
            this.screenContent.optionsValues[1] = mod(this.screenContent.optionsValues[1] + delta, 4);
            this.soundManager.playCursor();
            this.screenContent.updated = true;
        }

        this.keyInputs.left.press = () => {
            changeLivesFunc(-1);
        }

        this.keyInputs.right.press = () => {
            changeLivesFunc(1);
        }

        const returnToMainMenuFunc = () => {
            this.#cleanUpMenu();
            this.drawingManager.cleanUp();
            this.drawingManager = null;
            this.screenContent = null;
            this.gameState.switchState(GAME_STATES.MAIN_MENU);
            this.soundManager.playCursorSubmit();
        }

        this.keyInputs.enter.press = () => {
            returnToMainMenuFunc();
        }

        this.keyInputs.esc.press = () => {
            returnToMainMenuFunc();
        }
    }

    /**
     * Initializes the leaderboards.
     */
    #initLeaderboards() {
        this.screenContent = JSON.parse(JSON.stringify(DEFAULT_LEADERBOARDS_CONTENT));
        $.ajax({
            url: "/api/scores",
            type: "GET",
            success: (response) => {
                console.log(MODULE_NAME_PREFIX, 'Leaderboards:', response);
                this.screenContent.leaderboards = response;
                this.screenContent.ready = true;
            },
            error: (xhr, status, error) => {
                console.error(MODULE_NAME_PREFIX, 'Error:', error);
            }
        });

        this.#setupLeaderboardsKeys();
    }

    /**
     * Handles updating the leaderboards.
     */
    #handleLeaderboardsUpdate() {
        if (this.screenContent === null) {
            this.#initLeaderboards();
        }
        if (this.drawingManager === null) {
            this.drawingManager = new LeaderboardsDrawingManager(this.app, this.textures, this.screenContent);
            
            // if the leaderboards are not ready, draw the wait screen
            if (!this.screenContent.ready) {
                this.drawingManager.drawWait();
            }
        }

        // if the leaderboards are ready, draw them
        if (this.screenContent.ready && !this.screenContent.updated) {
            this.drawingManager.draw();
            this.screenContent.updated = false;
        }

        // if the leaderboards are ready and updated, redraw them
        if (this.screenContent.ready && this.screenContent.updated) {
            this.drawingManager.redraw();
            this.screenContent.updated = false;
        }
    }

    /**
     * Sets up the keys for the game end screen.
     */
    #setupGameEndKeys() {
        this.keyInputs.up.press = () => {
            if (!this.keyInputs.down.isDown) {
                this.screenContent.options[this.screenContent.selected].index = mod(this.screenContent.options[this.screenContent.selected].index + 1, AVAILIBLE_CHARSET.length);
                this.screenContent.options[this.screenContent.selected].letter = AVAILIBLE_CHARSET[this.screenContent.options[this.screenContent.selected].index];
                this.soundManager.playCursor();
                this.screenContent.updated = true;
            }
        }
        this.keyInputs.down.press = () => {
            if (!this.keyInputs.up.isDown) {
                this.screenContent.options[this.screenContent.selected].index = mod(this.screenContent.options[this.screenContent.selected].index - 1, AVAILIBLE_CHARSET.length);
                this.screenContent.options[this.screenContent.selected].letter = AVAILIBLE_CHARSET[this.screenContent.options[this.screenContent.selected].index];
                this.soundManager.playCursor();
                this.screenContent.updated = true;
            }
        }
        this.keyInputs.left.press = () => {
            this.screenContent.selected = mod(this.screenContent.selected - 1, this.screenContent.options.length);
            this.soundManager.playCursor();
            this.screenContent.updated = true;
        }
        this.keyInputs.right.press = () => {
            this.screenContent.selected = mod(this.screenContent.selected + 1, this.screenContent.options.length);
            this.soundManager.playCursor();
            this.screenContent.updated = true;
        }
        this.keyInputs.enter.press = () => {
            // get the name from the selected letters
            let name = '';
            for (let i = 0; i < this.screenContent.options.length; i++) {
                name += this.screenContent.options[i].letter;
            }
            this.screenContent.submited = name;
            console.log(MODULE_NAME_PREFIX, 'Submited name:', this.screenContent.submited);
            
            // prepare the post object
            const post = {
                name: this.screenContent.submited,
                score: this.recievedStats.score,
                time: this.recievedStats.time,
                lives: this.recievedStats.lives,
                mode: this.recievedStats.mode,
            };
            
            // submit the stats to the server
            console.log(MODULE_NAME_PREFIX, 'Submitting:', post);
            $.ajax({
                // current url
                url: "/api/submit_score", 
                type: "POST",
                data: JSON.stringify(post),
                contentType: "application/json",
                success: function(response) {
                    console.log(MODULE_NAME_PREFIX, 'Response:', response);
                },
                error: function(xhr, status, error) {
                    console.error(MODULE_NAME_PREFIX, 'Error:', error);
                }
            });
            
            this.#cleanUpMenu();
            this.drawingManager.cleanUp();
            this.gameState.switchState(GAME_STATES.MAIN_MENU);
        }
    }

    /**
     * Handles the game end screen.
     */
    #handleGameEndScreen() {
        if (this.screenContent === null) {
            // create copy of the default content
            this.screenContent = JSON.parse(JSON.stringify(DEFAULT_GAME_END_CONTENT));
            this.#setupGameEndKeys();
        }

        if (this.drawingManager === null) {
            this.drawingManager = new EndGameDrawingManager(this.app, this.textures, this.screenContent);
            this.drawingManager.draw();
        }

        if (this.screenContent.updated) {
            this.drawingManager.redraw();
            console.log(MODULE_NAME_PREFIX, 'Selected index:', this.screenContent.selected);
            this.screenContent.options.forEach((option, index) => {
                console.log(MODULE_NAME_PREFIX, `Option ${index}: ${option.letter}`);
            });
            this.screenContent.updated = false;
        }
    }

    /**
     * Handles updating the game.
     */
    update(delta) {
        if (this.windowChange.resized) {
            this.drawingManager.redraw();
            this.windowChange.resized = false;
        }

        switch (this.gameState.state) {
            case GAME_STATES.MAIN_MENU:
                this.#handleMainMenuUpdate();
                break;
            case GAME_STATES.GAME_SESSION:
                this.#handleGameSessionUpdate(delta);
                break;
            case GAME_STATES.SETTINGS:
                this.#handleSettingsUpdate();
                break;
            case GAME_STATES.LEADERBOARDS:
                this.#handleLeaderboardsUpdate();
                break;
            case GAME_STATES.GAME_END:
                this.#handleGameEndScreen();
                break;
            default:
                console.error(MODULE_NAME_PREFIX, 'Invalid game state.');
                break;
        }
    }
}
