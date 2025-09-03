import * as PIXI from 'pixi.js';
import { Entity } from './entity.js';
import { DURATIONS } from '/js/constants/durations.js';

const MODULE_NAME_PREFIX = 'bomb.js - ';

export class Bomb extends Entity {
    #DURATION_MS_BOMB = DURATIONS.MS_BOMB;
    #DURATION_MS_BOMB_TEXTURE_CHANGE = DURATIONS.MS_BOMB_TEXTURE_CHANGE;

    /**
     * Represents a bomb in the arena.
     * @param app {PIXI.Application} - The PIXI application.
     * @param arena {Arena} - The arena where the bomb will be spawned.
     * @param texture {PIXI.Sprite} - The graphic element that represents the bomb.
     * @param scaleToWall {number} - The scale factor to apply to the bomb.
     * @param bombTextures {Array} - The textures to show when the bomb is exploding.
     */
    constructor(app, arena, texture, scaleToWall, bombTextures) {
        super(app, arena, texture, scaleToWall);
        this.bombTextures = bombTextures;
        this.currentBombTextureIndex = 0;
        this.bombTime = 0;
        this.bombSpriteChangeTime = 0;
        this._isExploding = false;
    }

    get isExploding() {
        return this._isExploding;
    }

    /**
     * Updates the bomb in the arena.
     * @param {object} updateData - The update data.
     * @returns {object} The updated bomb data.
     */
    update(updateData) {
        const { deltaTimeMS: deltaTimeMS } = updateData;
        this.bombTime += deltaTimeMS;
        this.bombSpriteChangeTime += deltaTimeMS;

        // bomb explosion
        if (this.bombTime >= this.#DURATION_MS_BOMB) {
            this._isExploding = true;
            return;
        }

        // bomb texture change
        if (this.bombSpriteChangeTime >= this.#DURATION_MS_BOMB_TEXTURE_CHANGE) {
            this.elem.texture = this.bombTextures[this.currentBombTextureIndex];
            this.currentBombTextureIndex = (this.currentBombTextureIndex + 1) % this.bombTextures.length;
            this.bombSpriteChangeTime = 0;
        }

        const res = {
            x: this.elem.x,
            y: this.elem.y,
            time: this.bombTime,
        }
    }
}