// import * as PIXI from 'pixi.js';
import loadAssetsManifest from './loader.js';
import { GameState } from './game_states.js';
import { Game } from './game.js';
import { SoundManager } from './sound_manager.js';

let module_name_prefix = 'app.js - ';

const RATIO_WIDTH = 21;
const RATIO_HEIGHT = 11 * 1.2;      // 21:11 aspect ratio with hud taking up 20% of the height // TODO better way to calculate this
const GAME_WINDOW_SCALE = 0.8;

const TEXTURES = {};
const AUDIO = {};
const KEY_INPUTS = {};
const SOUND_MANAGER = new SoundManager();

const MANIFEST = {
    bundles: [
        {
            name: "textures",
            assets: [
                { alias: "bunny", src: "./img/bunny.png" },
                { alias: "player", src: "./img/player.png" },
                { alias: "player_walk01", src: "./img/player_walk01.png" },
                { alias: "player_walk02", src: "./img/player_walk02.png" },
                { alias: "player_walk03", src: "./img/player_walk03.png" },
                { alias: "bomb", src: "./img/bomb.png" },
                { alias: "bomb_ignited", src: "./img/bomb_ignited.png" },
                { alias: "explosion", src: "./img/explosion_whole.png" },
                { alias: "wall", src: "./img/wall.png" },
                { alias: "door", src: "./img/door.png" },
                { alias: "ghost1", src: "./img/ghost1.png" },
                { alias: "ghost2", src: "./img/ghost2.png" },
                { alias: "ghost3", src: "./img/ghost3.png" },
                { alias: "ghost4", src: "./img/ghost4.png" },
                { alias: "ghost5", src: "./img/ghost5.png" },
                { alias: "ghost6", src: "./img/ghost6.png" },
            ]
        },
        {
            name: "audio",
            assets: [
                { alias: "cursor", src: "./audio/cursor.ogg"},
                { alias: "cursor_submit", src: "./audio/cursor_submit.ogg"},
                { alias: "door_appeared", src: "./audio/door_appeared.ogg"},
                { alias: "explosion_sound", src: "./audio/explosion.ogg"},
                { alias: "new_level", src: "./audio/new_level.ogg"},
                { alias: "player_hit", src: "./audio/player_hit.ogg"},
            ]
        },
        {
            name: "fonts",
            assets: [
                { alias: "PixelFontTitle", src: "./fonts/Emulogic-zrEw.ttf"},
                { alias: "PixelFontText", src: "./fonts/PressStart2P-vaV7.ttf"}
            ]
        }
    ]
};

/**
 * Config for PIXI application
 */
const PIXI_INIT_CONFIG = { 
    width: getProperDimensions().width,
    height: getProperDimensions().height, 
}

/**
 * Loads a manifest of asset bundles using PIXI Assets.
 * @param {Object} manifest - The manifest object containing bundles of assets.
 * @returns {Promise<Object>} A promise that resolves with the loaded assets.
 * @throws {Error} If there was an error loading the assets.
 */
async function prepareAssets() {
    try {
        const assets = await loadAssetsManifest(MANIFEST);
        return assets;
    } catch (error) {
        console.error(module_name_prefix, 'Error initializing game assets:', error);
        throw error;  // Re-throw the error to ensure it's propagated
    }
}

/**
 * Returns the proper dimensions for the game window.
 * @returns {Object} The proper dimensions for the game window.
 * @throws {Error} If there was an error getting the proper dimensions.
 */
function getProperDimensions() {
    // find the limiting dimension
    const viewportAspectRatio = window.innerWidth / window.innerHeight;
    const gameAspectRatio = RATIO_WIDTH / RATIO_HEIGHT;

    let width = null;
    let height = null;

    // if the limiting dimension is the height
    if (viewportAspectRatio >= gameAspectRatio) {
        const scale_factor = window.innerHeight / RATIO_HEIGHT;
        height = window.innerHeight;
        width = RATIO_WIDTH * scale_factor;

        if (height >= window.screen.height * GAME_WINDOW_SCALE) {
            width *= GAME_WINDOW_SCALE;
            height *= GAME_WINDOW_SCALE;
        }
    }
    // if the limiting dimension is the width
    else {
        const scale_factor = window.innerWidth / RATIO_WIDTH;
        width = window.innerWidth;
        height = RATIO_HEIGHT * scale_factor;

        if (width >= window.screen.width * GAME_WINDOW_SCALE) {
            width *= GAME_WINDOW_SCALE;
            height *= GAME_WINDOW_SCALE;
        }
    }
    
    return { width, height };
}

/**
 * Resizes the canvas to fit the window.
 * @param {PIXI.Application} app - The PIXI application to resize.
 * @param {Object} windowChange - The window change object.
 */
function resizeCanvas(app, windowChange) {
    const { width, height } = getProperDimensions();

    // resize the canvas
    app.renderer.resize(width, height);
    $("#game").css("width", width);
    $("#game").css("height", height);

    windowChange.resized = true;
}

/**
 * Prepares the game assets.
 * @returns {Promise} A promise that resolves when the game assets are prepared.
 * @throws {Error} If there was an error preparing the game assets.
 * @async
 */
async function prepareGameAssets(textures, soundManager) {
    console.log(module_name_prefix, 'Preparing game assets...');
    const assets = await prepareAssets();
    console.log(module_name_prefix, 'Assets:', assets);
    loadTextures(assets, textures);
    soundManager.assignSounds(assets);

    console.log(module_name_prefix, 'Game assets prepared.');
    console.log(module_name_prefix, 'Textures:', TEXTURES);
    console.log(module_name_prefix, 'Audio:', AUDIO);
}

/**
 * Loads textures from the assets object into the texture object.
 * @param {Object} assets - The assets object containing the textures.
 * @param {Object} textures - The texture object to load the textures into.
 */
function loadTextures(assets, textures) {
    console.log(module_name_prefix, 'Loading textures:', assets);
    for (let texture in assets.textures) {
        textures[texture] = PIXI.Texture.from(texture);
    }
    console.log(module_name_prefix, 'Loaded textures:', textures);
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
        await prepareGameAssets(TEXTURES, SOUND_MANAGER);
    } catch (error) {
        console.error(module_name_prefix, 'Failed to load textures:', error);;
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

export function debugPrintScreen() {
    console.log(module_name_prefix, 'Screen:', app.screen);
    console.log(module_name_prefix, 'Canvas:', app.canvas);
    console.log(module_name_prefix, 'Renderer:', app.renderer);
    console.log(module_name_prefix, 'Stage:', app.stage);
}

////////////////////////////////////////////////// code execution starts here //////////////////////////////////////////////////
// prompt the user to click to start the game (audio context)

const windowChange = {
    resized: false
};

// create a new instance of a pixi application
export const app = new PIXI.Application();  // TODO remove export (debugging)
await app.init(PIXI_INIT_CONFIG);

// add the canvas to "game" div
$("#game").append(app.canvas);

// resize the canvas on window change
window.addEventListener('resize', () => resizeCanvas(app, windowChange));

await setup();

export const game = new Game(window, app, TEXTURES, SOUND_MANAGER, KEY_INPUTS, windowChange);      // TODO remove export (debugging)
console.log(module_name_prefix, 'Game:', game);

// PIXI's ticker for the game loop
app.ticker.add((delta) => game.update(delta));

// exposed debug functions
window.app = app;
window.test = debugTest;
window.debugPrintGameState = debugPrintGameState;
window.debugPrintGame = debugPrintGame;
window.game = game;
window.debugPrintScreen = debugPrintScreen;

/**
 * Debug function
 */
export function debugTest() {
    console.log('test success');
}