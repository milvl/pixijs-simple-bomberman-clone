// import * as PIXI from 'pixi.js';
import loadAssetsManifest from './loader.js';
import { GameState } from './game_states.js';
import { Game } from './game.js';

let module_name_prefix = 'app.js - ';

const WIDTH_SCALE_GAME_DIV = 0.7;
const HEIGHT_SCALE_GAME_DIV = 0.8;      //TODO - automatic scaling based on screen size

const SPRITES = {};
const AUDIO = {};
const KEY_INPUTS = {};

const manifest = {
    bundles: [
        {
            name: "sprites",
            assets: [
                { alias: "bunny", src: "https://pixijs.com/assets/bunny.png" },
                { alias: "bomb", src: "./img/bomb.png" }
            ]
        }
    ]
};

/**
 * Config for PIXI application
 */
const PIXI_INIT_CONFIG = { 
    width: window.innerWidth * WIDTH_SCALE_GAME_DIV, 
    height: window.innerHeight * HEIGHT_SCALE_GAME_DIV 
}

/**
 * Loads a manifest of asset bundles using PIXI Assets.
 * @param {Object} manifest - The manifest object containing bundles of assets.
 * @returns {Promise<Object>} A promise that resolves with the loaded assets.
 * @throws {Error} If there was an error loading the assets.
 */
async function prepareAssets() {
    try {
        const assets = await loadAssetsManifest(manifest);
        return assets;
    } catch (error) {
        console.error(module_name_prefix, 'Error initializing game assets:', error);
        throw error;  // Re-throw the error to ensure it's propagated
    }
}

/**
 * Resizes the canvas to fit the window.
 * @param {PIXI.Application} app - The PIXI application to resize.
 */
function resizeCanvas(app) {
    app.renderer.resize(window.innerWidth * WIDTH_SCALE_GAME_DIV, window.innerHeight * HEIGHT_SCALE_GAME_DIV);
    $('#game').css({
        width: window.innerWidth * WIDTH_SCALE_GAME_DIV,
        height: window.innerHeight * HEIGHT_SCALE_GAME_DIV
    });
}

/**
 * Prepares the game assets.
 * @returns {Promise} A promise that resolves when the game assets are prepared.
 * @throws {Error} If there was an error preparing the game assets.
 * @async
 */
async function prepareGameAssets() {
    console.log(module_name_prefix, 'Preparing game assets...');
    const assets = await prepareAssets();
    console.log(module_name_prefix, 'Assets:', assets);
    loadSprites(assets, SPRITES);
    // loadAudio(assets, AUDIO);

    console.log(module_name_prefix, 'Game assets prepared.');
    console.log(module_name_prefix, 'Sprites:', SPRITES);
    console.log(module_name_prefix, 'Audio:', AUDIO);
}

/**
 * Loads sprites from the assets object into the sprites object.
 * @param {Object} assets - The assets object containing the sprites.
 * @param {Object} sprites - The sprites object to load the sprites into.
 */
function loadSprites(assets, sprites) {
    console.log(module_name_prefix, 'Loading sprites:', assets);
    for (let sprite in assets.sprites) {
        sprites[sprite] = PIXI.Sprite.from(assets.sprites[sprite]);
    }
    console.log(module_name_prefix, 'Loaded sprites:', sprites);
}

/** 
 * Loads audio from the assets object into the audio object.
 * @param {Object} assets - The assets object containing the audio.
 * @param {Object} audio - The audio object to load the audio into.
 */
function loadAudio(assets, audio) {     // TODO - implement audio loading
    console.log(module_name_prefix, 'Loading audio:', assets);
    for (let sound in assets.audio) {
        audio[sound] = PIXI.sound.Sound.from(assets.audio[sound]);
    }
    console.log(module_name_prefix, 'Loaded audio:', audio);
}

/**
 * Keyboard input handler. (borrowed)
 * @param {string} value - The key value.
 * @returns {Object} The key object.
 */
function keyboard(value) {
    const key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    // functions to be defined by the user
    key.press = undefined;
    key.release = undefined;
    
    // key event handler definitions
    key.keyDownHandler = (event) => {
      if (event.key === key.value) {
        if (key.isUp && key.press) {
          key.press();
        }
        key.isDown = true;
        key.isUp = false;
        event.preventDefault();
      }
    };
    key.keyUpHandler = (event) => {
      if (event.key === key.value) {
        if (key.isDown && key.release) {
          key.release();
        }
        key.isDown = false;
        key.isUp = true;
        event.preventDefault();
      }
    };
  
    // attaching event listeners
    const downListener = key.keyDownHandler.bind(key);
    const upListener = key.keyUpHandler.bind(key);
    window.addEventListener("keydown", downListener, false);
    window.addEventListener("keyup", upListener, false);
    
    // detaching event listeners
    key.unsubscribe = () => {
      window.removeEventListener("keydown", downListener);
      window.removeEventListener("keyup", upListener);
    };
    
    return key;
}

/**
 * Setup function that prepares the data and configuration for the game.
 */
async function setup() {
    console.log('Setting up game...');

    // prepare game assets
    try {
        await prepareGameAssets();
    } catch (error) {
        console.error(module_name_prefix, 'Failed to load sprites:', error);;
    }

    // setup keyboard input
    KEY_INPUTS.left = keyboard("ArrowLeft");
    KEY_INPUTS.right = keyboard("ArrowRight");
    KEY_INPUTS.up = keyboard("ArrowUp");
    KEY_INPUTS.down = keyboard("ArrowDown");
    KEY_INPUTS.space = keyboard(" ");
    KEY_INPUTS.enter = keyboard("Enter");
    KEY_INPUTS.esc = keyboard("Escape");
    KEY_INPUTS.pause = keyboard("p");
}

export function debugPrintGameState() {
    game.gameState.printGameState();
}

export function debugPrintGame() {
    console.log(module_name_prefix, 'Game:', game);
}

////////////////////////////////////////////////// code execution starts here //////////////////////////////////////////////////
// create a new instance of a pixi application
export const app = new PIXI.Application();  // TODO remove export (debugging)
await app.init(PIXI_INIT_CONFIG);

// add the canvas to "game" div
$("#game").append(app.canvas);

// resize the canvas on window change
window.addEventListener('resize', () => resizeCanvas(app));

let canvasWidth = app.renderer.width;
let canvasHeight = app.renderer.height;

await setup();
// app.stage.addChild(SPRITES.bunny);

export const game = new Game(window, app, SPRITES, AUDIO, KEY_INPUTS);      // TODO remove export (debugging)
console.log(module_name_prefix, 'Game:', game);

// PIXI's ticker for the game loop
app.ticker.add((delta) => game.update(delta));

// exposed debug functions
window.app = app;
window.test = debugTest;
window.debugPrintGameState = debugPrintGameState;
window.debugPrintGame = debugPrintGame;
window.game = game;

/**
 * Debug function
 */
export function debugTest() {
    console.log('test success');
}