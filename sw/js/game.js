import { GameState, GAME_STATES } from "./game_states.js";
// import { MainMenuDrawingManager } from "./drawing_manager.js";

const module_name_prefix = 'game.js - ';

const DEFAULT_SETTINGS = {
    lives: 3,
    volume: true,
    endless: false
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
    options_values: [
        DEFAULT_SETTINGS.lives,
        DEFAULT_SETTINGS.volume,
        DEFAULT_SETTINGS.endless,
        undefined,
    ],
    selected: 0,
    submited: null,
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
     * @param {Object} sprites - The sprites object.
     * @param {Object} audio - The audio object.
     * @param {Object} key_inputs - The key inputs object.
     */
    constructor(window, app, sprites, audio, key_inputs) {
        this.window = window;
        this.app = app;
        this.sprites = sprites;
        this.audio = audio;
        this.key_inputs = key_inputs;
        this.settings = DEFAULT_SETTINGS;
        this.gameState = new GameState(this.window);
        this.screenContent = null;
        this.drawingManager = null;
    }

    /**
     * Binds the arrow keys to functions to operate the menu.
     * @param {Function} enterCallback - The callback function to call when the enter key is pressed.
     */
    #setupOptionsKeys(enterCallback) {
        this.key_inputs.up.press = () => {
            if (!this.key_inputs.down.isDown) {
                this.screenContent.selected = mod(this.screenContent.selected - 1, this.screenContent.options.length);
                this.screenContent.updated = true;
            }
        }
        this.key_inputs.down.press = () => {
            if (!this.key_inputs.up.isDown) {
                this.screenContent.selected = mod(this.screenContent.selected + 1, this.screenContent.options.length);
                this.screenContent.updated = true;
            }
        }
        this.key_inputs.enter.press = enterCallback;
    }

    /**
     * Unbinds the arrow keys from functions.
     */
    #unsetOptionsKeys() {
        this.key_inputs.up.press = undefined;
        this.key_inputs.down.press = undefined;
        this.key_inputs.enter.press = undefined;
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
        this.screenContent = { ...DEFAULT_MAIN_MENU_CONTENT };

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
                        console.error(module_name_prefix, 'Invalid option selected.');
                        break;
                }
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
            // this.drawingManager = new MainMenuDrawingManager(this.app, this.sprites, this.screenContent);
            // this.drawingManager.draw();
        }

        let switchTo = null;

        if (this.screenContent.updated) {
            // if selected option was submited, switch to the corresponding state
            if (this.screenContent.submited != null) {
                console.log(module_name_prefix, 'Switching to:', this.screenContent.options[this.screenContent.submited]);
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
                        console.error(module_name_prefix, 'Invalid option submited.');
                        break;
                }
                if (switchTo != null) {
                    this.#cleanUpMenu();
                    // this.drawingManager.cleanUp(); TODO - implement cleanUp function
                    // this.drawingManager = null;
                    this.gameState.switchState(switchTo);
                    switchTo = null;
                }
            }
            // otherwise, draw the main menu updated content
            else {
                // this.#drawMainMenu(this.screenContent);
                console.log(module_name_prefix, 'Selected:', this.screenContent.options[this.screenContent.selected]);
                this.screenContent.updated = false;
            }
        }
    }

    /**
     * Returns the text for the on/off toggle.
     * @param {String} prefix - The prefix for the text.
     */
    #onOffToggleText(prefix, value) {
        return prefix + (value ? 'On' : 'Off');
    }

    /**
     * Returns the settings content.
     * @returns {Object} The settings content.
     */
    #getSettingsContent() {
        let content = { ...DEFAULT_SETTINGS_CONTENT };
        content.options_values[0] = this.settings.lives;
        content.options_values[1] = this.settings.volume;
        content.options_values[2] = this.settings.endless;
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
                        // TODO - upgrade to typing the number of lives
                        this.screenContent.options_values[this.screenContent.selected] = mod(this.screenContent.options_values[this.screenContent.selected] + 1, DEFAULT_SETTINGS.lives + 1);
                        this.settings.lives = this.screenContent.options_values[this.screenContent.selected];
                        break;
                    case 1:
                        this.screenContent.options_values[this.screenContent.selected] = !this.screenContent.options_values[this.screenContent.selected];
                        this.settings.volume = this.screenContent.options_values[this.screenContent.selected];
                        break;
                    case 2:
                        this.screenContent.options_values[this.screenContent.selected] = !this.screenContent.options_values[this.screenContent.selected];
                        this.settings.endless = this.screenContent.options_values[this.screenContent.selected];
                        break;
                    case 3:
                        this.screenContent.submited = this.screenContent.selected;
                        break;
                    default:
                        console.error(module_name_prefix, 'Invalid option selected.');
                        break;
                }
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
        }

        let switchToMainMenu = false;

        if (this.screenContent.updated) {
            // if selected option was submited, switch to the corresponding state
            if (this.screenContent.submited != null) {
                console.log(module_name_prefix, 'Switching to:', this.screenContent.options[this.screenContent.submited]);
                switch (this.screenContent.submited) {
                    case 3:
                        switchToMainMenu = true;
                        break;
                    default:
                        console.error(module_name_prefix, 'Invalid option submited.');
                        break;
                }
                if (switchToMainMenu) {
                    this.#cleanUpMenu();
                    this.gameState.switchState(GAME_STATES.MAIN_MENU);
                    switchToMainMenu = false;
                }
            }
            // otherwise, draw the settings updated content
            else {
                // this.drawSettings(this.screenContent); to be implemented
                console.log(module_name_prefix, 'Selected:', this.screenContent.options[this.screenContent.selected]);
                this.screenContent.updated = false;
            }
        }
    }

    /**
     * Handles updating the game.
     */
    update() {
        switch (this.gameState.state) {
            case GAME_STATES.MAIN_MENU:
                this.#handleMainMenuUpdate();
                break;
            case GAME_STATES.GAME_SESSION:
                console.error(module_name_prefix, 'Game session to be implemented.');
                throw new Error('Game session to be implemented.');
                break;
            case GAME_STATES.GAME_OVER:
                console.error(module_name_prefix, 'Game over to be implemented.');
                throw new Error('Game over to be implemented.');
                break;
            case GAME_STATES.SETTINGS:
                this.#handleSettingsUpdate();
                break;
            case GAME_STATES.LEADERBOARDS:
                console.error(module_name_prefix, 'Leaderboards to be implemented.');
                throw new Error('Leaderboards to be implemented.');
            default:
                console.error(module_name_prefix, 'Invalid game state.');
                break;
        }
    }

    


}