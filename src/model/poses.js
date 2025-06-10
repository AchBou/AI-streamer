/**
 * Poses Management Module
 * 
 * This module handles all pose-related functionality for VRM models.
 * It includes functions for setting and resetting various body poses.
 */

// Set pose on the VRM model
export function setPose(currentVrm, poseName) {
    if (!currentVrm) return;

    // Reset current pose if any
    resetPose(currentVrm);

    // Set the new pose based on poseName
    switch (poseName) {
        case 'tpose':
            setTPose(currentVrm);
            break;
        case 'wave':
            setWavePose(currentVrm);
            break;
        case 'bow':
            setBowPose(currentVrm);
            break;
        case 'jump':
            setJumpPose(currentVrm);
            break;
        case 'dance':
            setDancePose(currentVrm);
            break;
    }

    return poseName;
}

// Reset current pose
export function resetPose(currentVrm) {
    if (!currentVrm) return;

    // Reset all humanoid bones to default pose
    if (currentVrm.humanoid) {
        const humanoid = currentVrm.humanoid;

        // Reset each bone to identity rotation
        humanoid.resetNormalizedPose();
    }
}

// Set T-Pose
export function setTPose(currentVrm) {
    if (!currentVrm || !currentVrm.humanoid) return;

    // T-pose is already the default pose in VRM
    // Make sure all rotations are reset
    resetPose(currentVrm);

    // Set arms slightly out to make a T shape
    const leftArm = currentVrm.humanoid.getNormalizedBoneNode('leftUpperArm');
    const rightArm = currentVrm.humanoid.getNormalizedBoneNode('rightUpperArm');

    if (leftArm) {
        leftArm.rotation.z = Math.PI / 2;
        leftArm.updateMatrix();
    }

    if (rightArm) {
        rightArm.rotation.z = -Math.PI / 2;
        rightArm.updateMatrix();
    }
}

// Set Wave Pose
export function setWavePose(currentVrm) {
    if (!currentVrm || !currentVrm.humanoid) return;

    // Get the right arm bones
    const rightUpperArm = currentVrm.humanoid.getNormalizedBoneNode('rightUpperArm');
    const rightLowerArm = currentVrm.humanoid.getNormalizedBoneNode('rightLowerArm');
    const rightHand = currentVrm.humanoid.getNormalizedBoneNode('rightHand');

    if (rightUpperArm && rightLowerArm && rightHand) {
        // Position for waving
        rightUpperArm.rotation.set(0, 0, -Math.PI / 2);
        rightUpperArm.rotation.y = -Math.PI / 4;
        rightLowerArm.rotation.set(0, 0, Math.PI / 4);
        rightHand.rotation.set(0, 0, 0);

        // Update matrices
        rightUpperArm.updateMatrix();
        rightLowerArm.updateMatrix();
        rightHand.updateMatrix();
    }
}

// Set Bow Pose
export function setBowPose(currentVrm) {
    if (!currentVrm || !currentVrm.humanoid) return;

    // Get the spine and neck bones
    const spine = currentVrm.humanoid.getNormalizedBoneNode('spine');
    const neck = currentVrm.humanoid.getNormalizedBoneNode('neck');

    if (spine && neck) {
        // Position for bowing
        spine.rotation.x = Math.PI / 6;
        neck.rotation.x = Math.PI / 6;

        // Update matrices
        spine.updateMatrix();
        neck.updateMatrix();
    }
}

// Set Jump Pose
export function setJumpPose(currentVrm) {
    if (!currentVrm || !currentVrm.humanoid) return;

    // Get the leg bones
    const leftUpperLeg = currentVrm.humanoid.getNormalizedBoneNode('leftUpperLeg');
    const rightUpperLeg = currentVrm.humanoid.getNormalizedBoneNode('rightUpperLeg');
    const leftLowerLeg = currentVrm.humanoid.getNormalizedBoneNode('leftLowerLeg');
    const rightLowerLeg = currentVrm.humanoid.getNormalizedBoneNode('rightLowerLeg');

    if (leftUpperLeg && rightUpperLeg && leftLowerLeg && rightLowerLeg) {
        // Position for jumping
        leftUpperLeg.rotation.x = -Math.PI / 6;
        rightUpperLeg.rotation.x = -Math.PI / 6;
        leftLowerLeg.rotation.x = Math.PI / 3;
        rightLowerLeg.rotation.x = Math.PI / 3;

        // Update matrices
        leftUpperLeg.updateMatrix();
        rightUpperLeg.updateMatrix();
        leftLowerLeg.updateMatrix();
        rightLowerLeg.updateMatrix();
    }
}

// Set Dance Pose
export function setDancePose(currentVrm) {
    if (!currentVrm || !currentVrm.humanoid) return;

    // Get various bones for a dance pose
    const leftUpperArm = currentVrm.humanoid.getNormalizedBoneNode('leftUpperArm');
    const rightUpperArm = currentVrm.humanoid.getNormalizedBoneNode('rightUpperArm');
    const leftLowerArm = currentVrm.humanoid.getNormalizedBoneNode('leftLowerArm');
    const rightLowerArm = currentVrm.humanoid.getNormalizedBoneNode('rightLowerArm');
    const hips = currentVrm.humanoid.getNormalizedBoneNode('hips');

    if (leftUpperArm && rightUpperArm && leftLowerArm && rightLowerArm && hips) {
        // Position for a simple dance pose
        leftUpperArm.rotation.set(0, 0, Math.PI / 2);
        rightUpperArm.rotation.set(0, 0, -Math.PI / 2);
        leftLowerArm.rotation.set(0, 0, -Math.PI / 4);
        rightLowerArm.rotation.set(0, 0, Math.PI / 4);
        hips.rotation.y = Math.PI / 16;

        // Update matrices
        leftUpperArm.updateMatrix();
        rightUpperArm.updateMatrix();
        leftLowerArm.updateMatrix();
        rightLowerArm.updateMatrix();
        hips.updateMatrix();
    }
}