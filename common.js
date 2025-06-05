/**
 * Common Functionality Module
 * 
 * This module contains functions that use both expressions and poses functionality.
 */

import { resetExpressions } from './expressions.js';
import { resetPose } from './poses.js';

// Reset all expressions and poses
export function resetAll(currentVrm) {
    resetExpressions(currentVrm);
    resetPose(currentVrm);
    
    return null; // Return null to indicate no active expression or pose
}