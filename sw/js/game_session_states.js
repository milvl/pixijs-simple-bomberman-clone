const MODULE_NAME_PREFIX = 'game_session_states.js - ';

/**
 * Represents the game session state.
 */
export class GameSessionState {
    GAME_SESSION_STATE_IN_PROGRESS = 0;
    GAME_SESSION_STATE_LIVES_LEFT = 1;
    GAME_SESSION_STATE_PAUSED = 2;
    GAME_SESSION_STATE_LEAVE_PROMPT = 3;
    GAME_SESSION_STATE_LEVEL_CLEARED = 4;
    GAME_SESSION_STATE_GAME_END = 5;

    constructor() {
        this.gameState = this.GAME_SESSION_STATE_IN_PROGRESS;
    }

    /**
     * Attempts to switch to a new game state.
     * @param {Number} gameState 
     */
    switchToGameState(gameState) {
        switch (this.state) {
            case this.GAME_SESSION_STATE_IN_PROGRESS:
                switch (gameState) {
                    case this.GAME_SESSION_STATE_LIVES_LEFT:
                    case this.GAME_SESSION_STATE_PAUSED:
                    case this.GAME_SESSION_STATE_LEAVE_PROMPT:
                    case this.GAME_SESSION_STATE_LEVEL_CLEARED:
                    case this.GAME_SESSION_STATE_GAME_END:
                        this.gameState = gameState;
                        break;
                    default:
                        console.error(`${MODULE_NAME_PREFIX}Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(gameState)}`);
                        throw new Error(`Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(gameState)}`);
                }
                break;
            
            case this.GAME_SESSION_STATE_LIVES_LEFT:
                if (gameState === this.GAME_SESSION_STATE_IN_PROGRESS) {
                    this.gameState = gameState;
                }
                else {
                    console.error(`${MODULE_NAME_PREFIX}Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(gameState)}`);
                    throw new Error(`Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(gameState)}`);
                }
                break;
            
            case this.GAME_SESSION_STATE_PAUSED:
                if (gameState === this.GAME_SESSION_STATE_IN_PROGRESS) {
                    this.gameState = gameState;
                }
                else {
                    console.error(`${MODULE_NAME_PREFIX}Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(gameState)}`);
                    throw new Error(`Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(gameState)}`);
                }
                break;
            
            case this.GAME_SESSION_STATE_LEAVE_PROMPT:
                if (gameState === this.GAME_SESSION_STATE_IN_PROGRESS) {
                    this.gameState = gameState;
                }
                else {
                    console.error(`${MODULE_NAME_PREFIX}Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(gameState)}`);
                    throw new Error(`Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(gameState)}`);
                }    
                break;
            
            case this.GAME_SESSION_STATE_LEVEL_CLEARED:
                if (gameState === this.GAME_SESSION_STATE_IN_PROGRESS) {
                    this.gameState = gameState;
                }
                else {
                    console.error(`${MODULE_NAME_PREFIX}Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(gameState)}`);
                    throw new Error(`Invalid game state from ${this.getStateName(this.state)} to ${this.getStateName(gameState)}`);
                }
                break;

            default:
                console.error(`${MODULE_NAME_PREFIX}Invalid game state for setup: ${gameState}`);
                throw new Error(`Invalid game state for setup: ${gameState}`);

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
            case this.GAME_SESSION_STATE_LIVES_LEFT:
                return 'Lives Left';
            case this.GAME_SESSION_STATE_PAUSED:
                return 'Paused';
            case this.GAME_SESSION_STATE_LEAVE_PROMPT:
                return 'Leave Prompt';
            case this.GAME_SESSION_STATE_LEVEL_CLEARED:
                return 'Level Cleared';
            case this.GAME_SESSION_STATE_GAME_END:
                return 'Game End';
            default:
                return 'Unknown';
        }
    }
}