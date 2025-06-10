/**
 * Animation Loader Module
 * 
 * This module provides functions for loading animations by name using a mapping
 * between animation names and their file paths.
 */

import { loadMixamoAnimation } from './loadMixamoAnimation.js';
import animationMap from './animationMap.json';

/**
 * Load an animation by name
 * @param {string} animationName - The name of the animation to load
 * @param {Object} vrm - The VRM model
 * @param {THREE.AnimationMixer} mixer - The animation mixer
 * @param {THREE.AnimationAction} currentAction - The current animation action
 * @returns {Promise<{clip: THREE.AnimationClip, action: THREE.AnimationAction}>} - The loaded animation clip and action
 * @throws {Error} - If the animation name is not found in the mapping
 */
export async function loadAnimationByName(animationName, vrm, mixer, currentAction) {
    // Check if the animation name exists in the mapping
    if (!animationMap[animationName]) {
        throw new Error(`Animation "${animationName}" not found in animation mapping`);
    }

    // Get the animation file path from the mapping
    const animationPath = `./${animationMap[animationName]}`;

    // Load the animation
    const clip = await loadMixamoAnimation(animationPath, vrm);

    // Create a new animation action
    const newAction = mixer.clipAction(clip);
    newAction.reset().play();

    // Crossfade from the current action if it exists
    if (currentAction && currentAction !== newAction) {
        currentAction.crossFadeTo(newAction, 0.5, false);
    }

    return { clip, action: newAction };
}

/**
 * Get all available animation names
 * @returns {string[]} - Array of animation names
 */
export function getAvailableAnimations() {
    return Object.keys(animationMap);
}

/**
 * Add a new animation to the mapping
 * @param {string} name - The name of the animation
 * @param {string} path - The path to the animation file (relative to the project root)
 */
export function addAnimation(name, path) {
    animationMap[name] = path;
}