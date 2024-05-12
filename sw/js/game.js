import { GameState } from "./game_states.js";

const module_name_prefix = 'game.js - ';

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

        this.initGame();
    }

    /**
     * Initializes the game.
     */
    initGame() {
        this.gameState = new GameState(this.window, this.app, this.sprites, this.audio);
        this.app.stage.addChild(this.sprites.bomb);
    }

    /**
     * Handles updating the game.
     */
    update() {
        // this.gameState.update();
        // if (this.key_inputs.right.isDown) {
        //     this.sprites.bomb.x += 5;
        // }
        // if (this.key_inputs.left.isDown) {
        //     this.sprites.bomb.x -= 5;
        // }
        // if (this.key_inputs.up.isDown) {
        //     this.sprites.bomb.y -= 5;
        // }
        // if (this.key_inputs.down.isDown) {
        //     this.sprites.bomb.y += 5;
        // }
        
    }

    


}