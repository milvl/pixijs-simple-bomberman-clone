// import * as PIXI from 'pixi.js';
import loadAssetsManifest from './loader.js';

let module_name_prefix = 'app.js - ';

const WIDTH_SCALE_GAME_DIV = 0.7;
const HEIGHT_SCALE_GAME_DIV = 0.8;      //TODO - automatic scaling based on screen size

const SPRITES = {};
const AUDIO = {};

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
    width: screen.width * WIDTH_SCALE_GAME_DIV, 
    height: screen.height * HEIGHT_SCALE_GAME_DIV 
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
function loadAudio(assets, audio) {
    console.log(module_name_prefix, 'Loading audio:', assets);
    for (let sound in assets.audio) {
        audio[sound] = PIXI.sound.Sound.from(assets.audio[sound]);
    }
    console.log(module_name_prefix, 'Loaded audio:', audio);
}

/**
 * Setup function
 */
async function setup() {
    console.log('Setting up game...');
    try {
        const assets = await prepareAssets();
        console.log(module_name_prefix, 'Assets:', assets);

        loadSprites(assets, SPRITES);
        // loadAudio(assets, AUDIO);

    } catch (error) {
        console.error(module_name_prefix, 'Failed to load sprites:', error);
        // alert('Failed to load sprites:', error);
    }
}

////////////////////////////////////////////////// code execution starts here //////////////////////////////////////////////////
// create a new instance of a pixi application
const app = new PIXI.Application();
await app.init(PIXI_INIT_CONFIG);

// add the canvas to "game" div
$("#game").append(app.canvas);

await setup();
app.stage.addChild(SPRITES.bunny);

/**
 * Debug function
 */
function test() {
    console.log('test success');
}