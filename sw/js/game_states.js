const module_name_prefix = 'game_states.js - ';

const GAME_STATES = {
    NONE: -1,
    MAIN_MENU: 0,
    GAME_SESSION: 1,
    GAME_END: 2,
    SETTINGS: 3,
    LEADERBOARDS: 4
};

const GAME_STATES_MAP = {
    NONE: {'id': -1, 'name': 'NONE'},
    MAIN_MENU: {'id': 0, 'name': 'MAIN_MENU'},
    GAME_SESSION: {'id': 1, 'name': 'GAME_SESSION'},
    GAME_END: {'id': 2, 'name': 'GAME_END'},
    SETTINGS: {'id': 3, 'name': 'SETTINGS'},
    LEADERBOARDS: {'id': 4, 'name': 'LEADERBOARDS'}
};

export class GameState {
    /**
     * Creates a new GameState object.
     * @param {Window} window - The window object.
     * @param {PIXI.Application} app - The PIXI application.
     * @param {Object} sprites - The sprites object.
     * @param {Object} audio - The audio object.
     */
    constructor(window, app, sprites, audio) {
        this.state = GAME_STATES.NONE;
        this.window = window;
        this.app = app;
        this.sprites = sprites;
        this.audio = audio;

        this.initScene();
    }

    /**
     * Sets up the scene based on the current game state.
     */
    initScene() {
        switch (this.state) {
            case GAME_STATES.NONE:
                // drawMainMenu();
                this.state = GAME_STATES.MAIN_MENU;
                console.log(module_name_prefix + "Game state set to MAIN_MENU");
                break;
            default:
                console.error(module_name_prefix + "Invalid game state for setup: " + this.state);
                throw new Error("Invalid game state for setup: " + this.state);
        }
    }

    /**
     * Prints the current game state to the console.
     */
    printGameState() {
        let current_state = undefined;
        switch (this.state) {
            case GAME_STATES.NONE:
                current_state = GAME_STATES_MAP.NONE;
                break;
            case GAME_STATES.MAIN_MENU:
                current_state = GAME_STATES_MAP.MAIN_MENU;
                break;
            case GAME_STATES.GAME_SESSION:
                current_state = GAME_STATES_MAP.GAME_SESSION;
                break;
            case GAME_STATES.GAME_END:
                current_state = GAME_STATES_MAP.GAME_END;
                break;
            case GAME_STATES.SETTINGS:
                current_state = GAME_STATES_MAP.SETTINGS;
                break;
            case GAME_STATES.LEADERBOARDS:
                current_state = GAME_STATES_MAP.LEADERBOARDS;
                break;
            default:
                console.error(module_name_prefix + "Invalid game state: " + this.state);
                break;
        }

        console.log(module_name_prefix + "Current game state: " + JSON.stringify(current_state));
    }

    render() {
        console.log("GameState.render() called");
    }
}