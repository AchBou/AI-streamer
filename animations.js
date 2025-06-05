/**
 * Animations Management Module
 * 
 * This module handles all animation-related functionality for VRM models.
 * It includes functions for loading and playing humanoid animations.
 * Based on the example from https://github.com/pixiv/three-vrm/tree/release/packages/three-vrm/examples/humanoidAnimation
 */

import * as THREE from 'three';

// Animation mixer and actions
let animationMixer = null;
let currentAnimationAction = null;
let animations = {};

/**
 * Initialize the animation system for a VRM model
 * @param {Object} vrm - The VRM model
 */
export function initializeAnimations(vrm) {
    if (!vrm) return;

    // Create a new animation mixer for the VRM model
    animationMixer = new THREE.AnimationMixer(vrm.scene);
    
    // Reset any existing animations
    currentAnimationAction = null;
    animations = {};
    
    // Create animations
    createWalkAnimation(vrm);
    createRunAnimation(vrm);
    createIdleAnimation(vrm);
    
    console.log('Animations initialized for VRM model');
}

/**
 * Update the animation system
 * @param {number} deltaTime - The time since the last frame
 */
export function updateAnimations(deltaTime) {
    if (animationMixer) {
        animationMixer.update(deltaTime);
    }
}

/**
 * Play an animation
 * @param {string} animationName - The name of the animation to play
 */
export function playAnimation(animationName) {
    if (!animationMixer || !animations[animationName]) return;
    
    // Stop the current animation if any
    if (currentAnimationAction) {
        currentAnimationAction.fadeOut(0.5);
    }
    
    // Play the new animation
    currentAnimationAction = animations[animationName];
    currentAnimationAction.reset().fadeIn(0.5).play();
    
    return animationName;
}

/**
 * Stop all animations
 */
export function stopAnimations() {
    if (!animationMixer) return;
    
    // Stop the current animation if any
    if (currentAnimationAction) {
        currentAnimationAction.fadeOut(0.5);
        currentAnimationAction = null;
    }
}

/**
 * Create a walk animation for the VRM model
 * @param {Object} vrm - The VRM model
 */
function createWalkAnimation(vrm) {
    if (!vrm || !vrm.humanoid || !animationMixer) return;
    
    // Create a walk animation clip
    const tracks = [];
    
    // Add tracks for leg movement
    const leftUpperLeg = vrm.humanoid.getNormalizedBoneNode('leftUpperLeg');
    const rightUpperLeg = vrm.humanoid.getNormalizedBoneNode('rightUpperLeg');
    const leftLowerLeg = vrm.humanoid.getNormalizedBoneNode('leftLowerLeg');
    const rightLowerLeg = vrm.humanoid.getNormalizedBoneNode('rightLowerLeg');
    
    if (leftUpperLeg && rightUpperLeg) {
        // Left leg forward, right leg backward
        const timeStep = 0.5; // Half a second for each step
        const walkCycle = 1.0; // One second for a complete walk cycle
        
        // Left upper leg rotation
        tracks.push(
            new THREE.QuaternionKeyframeTrack(
                `${leftUpperLeg.name}.quaternion`,
                [0, timeStep, walkCycle],
                [
                    // Start position (leg back)
                    0, 0, 0, 1,
                    // Middle position (leg forward)
                    Math.sin(-Math.PI / 8), 0, 0, Math.cos(-Math.PI / 8),
                    // End position (back to start)
                    0, 0, 0, 1
                ]
            )
        );
        
        // Right upper leg rotation (opposite of left)
        tracks.push(
            new THREE.QuaternionKeyframeTrack(
                `${rightUpperLeg.name}.quaternion`,
                [0, timeStep, walkCycle],
                [
                    // Start position (leg forward)
                    Math.sin(-Math.PI / 8), 0, 0, Math.cos(-Math.PI / 8),
                    // Middle position (leg back)
                    0, 0, 0, 1,
                    // End position (back to start)
                    Math.sin(-Math.PI / 8), 0, 0, Math.cos(-Math.PI / 8)
                ]
            )
        );
        
        // Add tracks for lower legs if available
        if (leftLowerLeg && rightLowerLeg) {
            // Left lower leg rotation
            tracks.push(
                new THREE.QuaternionKeyframeTrack(
                    `${leftLowerLeg.name}.quaternion`,
                    [0, timeStep, walkCycle],
                    [
                        // Start position (leg extended)
                        0, 0, 0, 1,
                        // Middle position (leg bent)
                        Math.sin(Math.PI / 6), 0, 0, Math.cos(Math.PI / 6),
                        // End position (back to start)
                        0, 0, 0, 1
                    ]
                )
            );
            
            // Right lower leg rotation
            tracks.push(
                new THREE.QuaternionKeyframeTrack(
                    `${rightLowerLeg.name}.quaternion`,
                    [0, timeStep, walkCycle],
                    [
                        // Start position (leg bent)
                        Math.sin(Math.PI / 6), 0, 0, Math.cos(Math.PI / 6),
                        // Middle position (leg extended)
                        0, 0, 0, 1,
                        // End position (back to start)
                        Math.sin(Math.PI / 6), 0, 0, Math.cos(Math.PI / 6)
                    ]
                )
            );
        }
        
        // Create the animation clip
        const walkClip = new THREE.AnimationClip('walk', walkCycle, tracks);
        
        // Create the animation action
        animations.walk = animationMixer.clipAction(walkClip);
        animations.walk.setLoop(THREE.LoopRepeat);
    }
}

/**
 * Create a run animation for the VRM model
 * @param {Object} vrm - The VRM model
 */
function createRunAnimation(vrm) {
    if (!vrm || !vrm.humanoid || !animationMixer) return;
    
    // Create a run animation clip
    const tracks = [];
    
    // Add tracks for leg movement
    const leftUpperLeg = vrm.humanoid.getNormalizedBoneNode('leftUpperLeg');
    const rightUpperLeg = vrm.humanoid.getNormalizedBoneNode('rightUpperLeg');
    const leftLowerLeg = vrm.humanoid.getNormalizedBoneNode('leftLowerLeg');
    const rightLowerLeg = vrm.humanoid.getNormalizedBoneNode('rightLowerLeg');
    
    if (leftUpperLeg && rightUpperLeg) {
        // Left leg forward, right leg backward
        const timeStep = 0.25; // Quarter a second for each step (faster than walk)
        const runCycle = 0.5; // Half a second for a complete run cycle
        
        // Left upper leg rotation
        tracks.push(
            new THREE.QuaternionKeyframeTrack(
                `${leftUpperLeg.name}.quaternion`,
                [0, timeStep, runCycle],
                [
                    // Start position (leg back)
                    Math.sin(Math.PI / 6), 0, 0, Math.cos(Math.PI / 6),
                    // Middle position (leg forward)
                    Math.sin(-Math.PI / 4), 0, 0, Math.cos(-Math.PI / 4),
                    // End position (back to start)
                    Math.sin(Math.PI / 6), 0, 0, Math.cos(Math.PI / 6)
                ]
            )
        );
        
        // Right upper leg rotation (opposite of left)
        tracks.push(
            new THREE.QuaternionKeyframeTrack(
                `${rightUpperLeg.name}.quaternion`,
                [0, timeStep, runCycle],
                [
                    // Start position (leg forward)
                    Math.sin(-Math.PI / 4), 0, 0, Math.cos(-Math.PI / 4),
                    // Middle position (leg back)
                    Math.sin(Math.PI / 6), 0, 0, Math.cos(Math.PI / 6),
                    // End position (back to start)
                    Math.sin(-Math.PI / 4), 0, 0, Math.cos(-Math.PI / 4)
                ]
            )
        );
        
        // Add tracks for lower legs if available
        if (leftLowerLeg && rightLowerLeg) {
            // Left lower leg rotation
            tracks.push(
                new THREE.QuaternionKeyframeTrack(
                    `${leftLowerLeg.name}.quaternion`,
                    [0, timeStep, runCycle],
                    [
                        // Start position (leg extended)
                        0, 0, 0, 1,
                        // Middle position (leg bent)
                        Math.sin(Math.PI / 3), 0, 0, Math.cos(Math.PI / 3),
                        // End position (back to start)
                        0, 0, 0, 1
                    ]
                )
            );
            
            // Right lower leg rotation
            tracks.push(
                new THREE.QuaternionKeyframeTrack(
                    `${rightLowerLeg.name}.quaternion`,
                    [0, timeStep, runCycle],
                    [
                        // Start position (leg bent)
                        Math.sin(Math.PI / 3), 0, 0, Math.cos(Math.PI / 3),
                        // Middle position (leg extended)
                        0, 0, 0, 1,
                        // End position (back to start)
                        Math.sin(Math.PI / 3), 0, 0, Math.cos(Math.PI / 3)
                    ]
                )
            );
        }
        
        // Create the animation clip
        const runClip = new THREE.AnimationClip('run', runCycle, tracks);
        
        // Create the animation action
        animations.run = animationMixer.clipAction(runClip);
        animations.run.setLoop(THREE.LoopRepeat);
    }
}

/**
 * Create an idle animation for the VRM model
 * @param {Object} vrm - The VRM model
 */
function createIdleAnimation(vrm) {
    if (!vrm || !vrm.humanoid || !animationMixer) return;
    
    // Create an idle animation clip
    const tracks = [];
    
    // Add tracks for subtle body movement
    const spine = vrm.humanoid.getNormalizedBoneNode('spine');
    const neck = vrm.humanoid.getNormalizedBoneNode('neck');
    
    if (spine && neck) {
        // Subtle spine movement
        const idleCycle = 3.0; // Three seconds for a complete idle cycle
        
        // Spine rotation
        tracks.push(
            new THREE.QuaternionKeyframeTrack(
                `${spine.name}.quaternion`,
                [0, idleCycle / 2, idleCycle],
                [
                    // Start position
                    0, 0, 0, 1,
                    // Middle position (slight lean)
                    Math.sin(Math.PI / 60), 0, 0, Math.cos(Math.PI / 60),
                    // End position (back to start)
                    0, 0, 0, 1
                ]
            )
        );
        
        // Neck rotation
        tracks.push(
            new THREE.QuaternionKeyframeTrack(
                `${neck.name}.quaternion`,
                [0, idleCycle / 4, idleCycle / 2, idleCycle * 3 / 4, idleCycle],
                [
                    // Start position
                    0, 0, 0, 1,
                    // Look slightly right
                    0, Math.sin(Math.PI / 30), 0, Math.cos(Math.PI / 30),
                    // Back to center
                    0, 0, 0, 1,
                    // Look slightly left
                    0, Math.sin(-Math.PI / 30), 0, Math.cos(Math.PI / 30),
                    // End position (back to start)
                    0, 0, 0, 1
                ]
            )
        );
        
        // Create the animation clip
        const idleClip = new THREE.AnimationClip('idle', idleCycle, tracks);
        
        // Create the animation action
        animations.idle = animationMixer.clipAction(idleClip);
        animations.idle.setLoop(THREE.LoopRepeat);
    }
}