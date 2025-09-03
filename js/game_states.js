const MODULE_NAME_PREFIX = 'game_states.js - ';

export const GAME_STATES = {
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
    // GAME_END: {'id': 2, 'name': 'GAME_END'},
    SETTINGS: {'id': 3, 'name': 'SETTINGS'},
    LEADERBOARDS: {'id': 4, 'name': 'LEADERBOARDS'}
};

/**
 * Represents the game state.
 */
export class GameState {
    /**
     * Creates a new GameState object.
     * @param {Window} window - The window object.
     */
    constructor(window) {
        this._state = GAME_STATES.NONE;
        this.window = window;

        this.initState();
    }

    /**
     * Gets the game state.
     * @returns {Number} The game state.
     */
    get state() {
        return this._state;
    }

    /**
     * Gets the game state.
     * @returns {Number} The game state.
     */
    set state(state) {
        this._state = state;
    }

    /**
     * Sets up the scene based on the current game state.
     */
    initState() {
        switch (this._state) {
            case GAME_STATES.NONE:
                this._state = GAME_STATES.MAIN_MENU;
                console.log(MODULE_NAME_PREFIX + "Game state set to MAIN_MENU");
                break;
            default:
                console.error(MODULE_NAME_PREFIX + "Invalid game state for setup: " + this._state);
                throw new Error("Invalid game state for setup: " + this._state);
        }
    }

    /**
     * Prints the current game state to the console.
     */
    printGameState() {
        let currentState = null;
        switch (this._state) {
            case GAME_STATES.NONE:
                currentState = GAME_STATES_MAP.NONE;
                break;
            case GAME_STATES.MAIN_MENU:
                currentState = GAME_STATES_MAP.MAIN_MENU;
                break;
            case GAME_STATES.GAME_SESSION:
                currentState = GAME_STATES_MAP.GAME_SESSION;
                break;
            case GAME_STATES.GAME_END:
                currentState = GAME_STATES_MAP.GAME_END;
                break;
            case GAME_STATES.SETTINGS:
                currentState = GAME_STATES_MAP.SETTINGS;
                break;
            case GAME_STATES.LEADERBOARDS:
                currentState = GAME_STATES_MAP.LEADERBOARDS;
                break;
            default:
                currentState = "Invalid game state: " + this._state;
                break;
        }

        console.log(MODULE_NAME_PREFIX + "Current game state: " + JSON.stringify(currentState));
    }

    /**
     * Sets the game state.
     * @param {Number} state - The game state to set.
     */
    switchState(state) {
        if (this._state === GAME_STATES.NONE) {
            throw new Error("Logic Error: Current game state is NONE");
        }
        if (state === this._state) {
            throw new Error("Logic Error: Switch called with same state");
        }

        // swithing to state:
        switch (state) {
            case GAME_STATES.NONE:
                throw new Error("Logic Error: Cannot set game state to NONE");
            
            case GAME_STATES.MAIN_MENU:
                this._state = GAME_STATES.MAIN_MENU;
                console.log(MODULE_NAME_PREFIX + "Game state set to MAIN_MENU");
                break;
            
            case GAME_STATES.GAME_SESSION:
                if (this._state !== GAME_STATES.MAIN_MENU) {
                    throw new Error("Logic Error: Cannot set game state to GAME_SESSION from " + this._state);
                }
                this._state = GAME_STATES.GAME_SESSION;
                console.log(MODULE_NAME_PREFIX + "Game state set to GAME_SESSION");
                break;
            
            case GAME_STATES.GAME_END:
                if (this._state !== GAME_STATES.GAME_SESSION) {
                    throw new Error("Logic Error: Cannot set game state to GAME_END from " + this._state);
                }
                this._state = GAME_STATES.GAME_END;
                console.log(MODULE_NAME_PREFIX + "Game state set to GAME_END");
                break;
            
            case GAME_STATES.SETTINGS:
                if (this._state !== GAME_STATES.MAIN_MENU) {
                    throw new Error("Logic Error: Cannot set game state to SETTINGS from " + this._state);
                }
                this._state = GAME_STATES.SETTINGS;
                console.log(MODULE_NAME_PREFIX + "Game state set to SETTINGS");
                break;
            
            case GAME_STATES.LEADERBOARDS:
                if (this._state !== GAME_STATES.MAIN_MENU /*&& this._state !== GAME_STATES.GAME_END*/) {
                    throw new Error("Logic Error: Cannot set game state to LEADERBOARDS from " + this._state);
                }
                this._state = GAME_STATES.LEADERBOARDS;
                console.log(MODULE_NAME_PREFIX + "Game state set to LEADERBOARDS");
                break;
            
            // should never happen
            default:
                throw new Error("Logic Error: Invalid game state: " + state);
        }
    }
}