import * as PIXI from 'pixi.js';
import { sound } from '@pixi/sound';

const MODULE_NAME_PREFIX = 'sound_manager.js - ';

/**
 * SoundManager class
 */
export class SoundManager {
    constructor() {
        this.sounds = null;
        this.loaded = false;
        this.muted = false;
    }

    /**
     * Loads sounds.
     */
    assignSounds(assets) {
        this.sounds = assets.audio;
        this.loaded = true;
    }

    /**
     * Plays a sound.
     * @param {string} sound - The sound to play.
     * @param {number} volume[=1.0] - The volume to play the sound at. [0.0, 1.0]
     * @throws {Error} If sounds are not loaded.
     * @throws {Error} If the sound is not found.
     */
    #playSound(sound, volume = 1.0) {
        // sanity check
        if (!this.loaded) {
            console.error(MODULE_NAME_PREFIX + 'Sounds not loaded');
            throw new Error('Sounds not loaded');
        }
        if (this.muted) {
            return;
        }
        volume = Math.min(1.0, Math.max(0.0, volume));

        const soundObj = this.sounds[sound];
        if (soundObj) {
            soundObj.volume = volume;
            soundObj.play();
        }
        else {
            console.error(MODULE_NAME_PREFIX + 'Sound not found: ' + sound);
        }
    }

    /**
     * Plays bomb sound.
     */
    playExplosion() {
        this.#playSound('explosion_sound', 0.2);
    }

    /**
     * Plays the cursor select switch sound.
     */
    playCursor() {
        this.#playSound('cursor');
    }

    /**
     * Plays the cursor submit sound.
     */
    playCursorSubmit() {
        this.#playSound('cursor_submit');
    }

    /**
     * Plays the sound of new level.
     */
    playNewLevel() {
        this.#playSound('new_level');
    }

    /**
     * Plays the sound of player hit.
     */
    playPlayerHit() {
        this.#playSound('player_hit');
    }

    /**
     * @param {boolean} value - The sound enabled value.
     */
    set soundEnabled(value) {
        this.muted = !value;
        let soundStatus = value ? 'enabled' : 'disabled';
        console.log(MODULE_NAME_PREFIX + 'Sound is ' + soundStatus);
    }
}