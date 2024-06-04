import * as PIXI from 'pixi.js';

let MODULE_NAME_PREFIX = 'loader.js - ';

/**
 * Loads a manifest of asset bundles using PIXI Assets.
 * @param {Object} manifest - The manifest object containing bundles of assets.
 * @returns {Promise<Object>} A promise that resolves with the loaded assets.
 */
async function loadAssetsManifest(manifest) {
    // console.log(module_name_prefix, 'Loading assets manifest:', pformat(manifest));
    try {
        await PIXI.Assets.init({ manifest: manifest });     //TODO NOTE: PIXI.Assets.init must be called only once

        // load each bundle in the manifest
        const bundles = {}
        for (let bundle of manifest.bundles) {
            bundles[bundle.name] = await PIXI.Assets.loadBundle(bundle.name);
        }
        // console.log(module_name_prefix, 'Bundles:', bundles);
        
        // load each asset in the bundle
        const allAssets = {};
        for (let manifestBundle of manifest.bundles) {
            const assets = {};
            for (let asset of manifestBundle.assets) {
                assets[asset.alias] = await PIXI.Assets.load(asset.alias);
            }
            allAssets[manifestBundle.name] = assets;
        }
        // console.log(module_name_prefix, 'All assets:', allAssets);

        return allAssets;
    } catch (error) {
        // console.error(module_name_prefix, ': Failed to load assets:', error);
        throw error; // re-throw to allow handling by the caller
    }
}

export default loadAssetsManifest;