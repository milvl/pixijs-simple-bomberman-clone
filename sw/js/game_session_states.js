const MODULE_NAME_PREFIX = 'game_session_states.js - ';

/**
 * Represents the game session state.
 */
export class GameSessionState {
    GAME_SESSION_STATE_IN_PROGRESS = 0;
    GAME_SESSION_STATE_PLAYER_HIT = 1;
    GAME_SESSION_STATE_LEVEL_INFO_SCREEN = 2;
    GAME_SESSION_STATE_PAUSED = 3;
    GAME_SESSION_STATE_LEAVE_PROMPT = 4;
    GAME_SESSION_STATE_GAME_END = 5;

    constructor() {
        this.gameState = this.GAME_SESSION_STATE_IN_PROGRESS;
    }

    /**
     * Attempts to switch to a new game state.
     * @param {Number} newState 
     */
    switchToGameState(newState) {
        switch (this.state) {
            case this.GAME_SESSION_STATE_IN_PROGRESS:
                switch (newState) {
                    case this.GAME_SESSION_STATE_PLAYER_HIT:
                    case this.GAME_SESSION_STATE_PAUSED:
                    case this.GAME_SESSION_STATE_LEAVE_PROMPT:
                    case this.GAME_SESSION_STATE_LEVEL_INFO_SCREEN:
                    case this.GAME_SESSION_STATE_GAME_END:
                        this.gameState = newState;
                        console.log(`${MODULE_NAME_PREFIX}Switched to ${this.getStateName(this.state)}`);
                        break;
                    default:
                        console.error(`${MODULE_NAME_PREFIX}Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(newState)}`);
                        throw new Error(`Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(newState)}`);
                }
                break;

            case this.GAME_SESSION_STATE_PLAYER_HIT:
                if (newState === this.GAME_SESSION_STATE_LEVEL_INFO_SCREEN || newState === this.GAME_SESSION_STATE_GAME_END) {
                    this.gameState = newState;
                    console.log(`${MODULE_NAME_PREFIX}Switched to ${this.getStateName(this.state)}`);
                }
                else {
                    console.error(`${MODULE_NAME_PREFIX}Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(newState)}`);
                    throw new Error(`Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(newState)}`);
                }
                break;
            
            case this.GAME_SESSION_STATE_LEVEL_INFO_SCREEN:
                if (newState === this.GAME_SESSION_STATE_IN_PROGRESS) {
                    this.gameState = newState;
                    console.log(`${MODULE_NAME_PREFIX}Switched to ${this.getStateName(this.state)}`);
                }
                else {
                    console.error(`${MODULE_NAME_PREFIX}Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(newState)}`);
                    throw new Error(`Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(newState)}`);
                }
                break;
            
            case this.GAME_SESSION_STATE_PAUSED:
                if (newState === this.GAME_SESSION_STATE_IN_PROGRESS) {
                    this.gameState = newState;
                    console.log(`${MODULE_NAME_PREFIX}Switched to ${this.getStateName(this.state)}`);
                }
                else {
                    console.error(`${MODULE_NAME_PREFIX}Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(newState)}`);
                    throw new Error(`Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(newState)}`);
                }
                break;
            
            case this.GAME_SESSION_STATE_LEAVE_PROMPT:
                if (newState === this.GAME_SESSION_STATE_IN_PROGRESS || newState === this.GAME_SESSION_STATE_GAME_END) {
                    this.gameState = newState;
                    console.log(`${MODULE_NAME_PREFIX}Switched to ${this.getStateName(this.state)}`);
                }
                else {
                    console.error(`${MODULE_NAME_PREFIX}Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(newState)}`);
                    throw new Error(`Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(newState)}`);
                }    
                break;

            default:
                console.error(`${MODULE_NAME_PREFIX}Invalid game state for setup: ${newState}`);
                throw new Error(`Invalid game state for setup: ${newState}`);

        }
    }

    get state() {
        return this.gameState;
    }

    /**
     * Returns the name of the game state.
     * @param {Number} state - The game state.
     * @returns {String} The name of the game state.
     */
    getStateName(state) {
        switch (state) {
            case this.GAME_SESSION_STATE_IN_PROGRESS:
                return 'In Progress';
            case this.GAME_SESSION_STATE_PLAYER_HIT:
                return 'Player Hit';
            case this.GAME_SESSION_STATE_LEVEL_INFO_SCREEN:
                return 'Level Info Screen';
            case this.GAME_SESSION_STATE_PAUSED:
                return 'Paused';
            case this.GAME_SESSION_STATE_LEAVE_PROMPT:
                return 'Leave Prompt';
            case this.GAME_SESSION_STATE_GAME_END:
                return 'Game End';
            default:
                return 'Unknown';
        }
    }
}