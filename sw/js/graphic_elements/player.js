// import * as PIXI from 'pixi.js';
import { Entity } from './entity.js';
import { DURATIONS } from '/js/constants/durations.js';
import { MOVEMENT_SPEEDS } from '/js/constants/movement_speeds.js';

const MODULE_NAME_PREFIX = 'player.js - ';

export class Player extends Entity {
    #MOVEMENT_SPEED_SCALE_FACTOR_TO_SCREEN_HEIGHT = MOVEMENT_SPEEDS.PLAYER_SCALE_FACTOR_TO_SCREEN_HEIGHT;
    #DURATION_MS_MOVEMENT_SPRITE_CHANGE_PLAYER = DURATIONS.MS_MOVEMENT_SPRITE_CHANGE_PLAYER;

    /**
     * Represents the player in the arena.
     * @param app {PIXI.Application} - The PIXI application.
     * @param arena {Arena} - The arena where the player will be spawned.
     * @param idleTexture {PIXI.Texture} - The texture to show when the player is not moving.
     * @param scaleToWall {number} - The scale factor to apply to the player.
     * @param movementTextures {Array} - The textures to show when the player is moving.
     */
    constructor(app, arena, idleTexture, scaleToWall, movementTextures) {
        super(app, arena, idleTexture, scaleToWall);
        this._isMoving = false;
        this.idleTexture = idleTexture;
        this.movementTextures = movementTextures;
        this.currentPlayerTextureIndex = 0;
        this.movementSpeed = this.app.screen.height * this.#MOVEMENT_SPEED_SCALE_FACTOR_TO_SCREEN_HEIGHT;
        this.movementTime = 0;
    }

    /**
     * Gets if the player is moving.
     * @returns {boolean} If the player is moving.
     */
    get isMoving() {
        return this._isMoving;
    }

    /**
     * Sets if the player is moving.
     * @param value {boolean} - If the player is moving.
     */
    set isMoving(value) {
        this._isMoving = value;
    }

    /**
     * Updates the player in the arena.
     * @param updateData {object} - The update data.
     * @param updateData.deltaTimeMS {number} - The time elapsed since the last update.
     * @param updateData.keyInputs {object} - The key inputs.
     * @returns {object} The updated player data.
     */
    update(updateData) {
        const { deltaTimeMS: deltaTimeMS, keyInputs: keyInputs } = updateData;
        // movement
        const distance = this.movementSpeed * (deltaTimeMS / 1000); // convert ms to seconds
        let deltaX = 0;
        let deltaY = 0;

        if (keyInputs.left.isDown) {
            deltaX -= distance;
            if (this.elem.scale.x > 0) {
                this.elem.scale.x *= -1;
                this.elem.x += this.elem.width;
            }
            this.isMoving = true;
            this.elem.texture = this.movementTextures[this.currentPlayerTextureIndex];
        }
        if (keyInputs.right.isDown) {
            deltaX += distance;
            if (this.elem.scale.x < 0) {
                this.elem.scale.x *= -1;
                this.elem.x -= this.elem.width;
            }
            this.isMoving = true;
            this.elem.texture = this.movementTextures[this.currentPlayerTextureIndex];
        }
        if (keyInputs.up.isDown) {
            deltaY -= distance;
            this.isMoving = true;
            this.elem.texture = this.movementTextures[this.currentPlayerTextureIndex];
        }
        if (keyInputs.down.isDown) {
            deltaY += distance;
            this.isMoving = true;
            this.elem.texture = this.movementTextures[this.currentPlayerTextureIndex];
        }
        if (deltaX === 0 && deltaY === 0) {
            this.isMoving = false;
        }
        updateData.deltaX = deltaX;
        updateData.deltaY = deltaY;

        // texture swapping
        if (this.isMoving) {
            this.movementTime += deltaTimeMS;

            if (this.movementTime >= this.#DURATION_MS_MOVEMENT_SPRITE_CHANGE_PLAYER) {
                this.currentPlayerTextureIndex = (this.currentPlayerTextureIndex + 1) % this.movementTextures.length;
                this.elem.texture = this.movementTextures[this.currentPlayerTextureIndex];
                this.movementTime = 0;
            }

        } else {
            this.movementTime = 0;
            this.elem.texture = this.idleTexture;
        }

        const res = super.update(updateData);
        res.isMoving = this.isMoving;
        res.movementSpeed = this.movementSpeed;
        return res;
    }

    /**
     * Redraws the player in the arena.
     * @param prevScreenSize {object} - The previous screen size.
     */
    redraw(prevScreenSize) {
        super.redraw(prevScreenSize);
        this.movementSpeed = this.app.screen.height * this.#MOVEMENT_SPEED_SCALE_FACTOR_TO_SCREEN_HEIGHT;
    }
}