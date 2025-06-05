/**
 * Expressions Management Module
 * 
 * This module handles all expression-related functionality for VRM models.
 * It includes functions for setting and resetting facial expressions.
 */

// Export the functions that will be used in other files
export function setExpression(currentVrm, expressionName, weight = 1.0) {
    if (!currentVrm || !currentVrm.expressionManager) return;

    // Reset all expressions first
    resetExpressions(currentVrm);

    // Set the new expression
    if (expressionName !== 'neutral') {
        // Different versions of VRM might have different ways to set expressions
        if (typeof currentVrm.expressionManager.setValue === 'function') {
            // Standard method
            currentVrm.expressionManager.setValue(expressionName, weight);
        } else if (typeof currentVrm.expressionManager.setWeight === 'function') {
            // Some versions might use setWeight instead
            currentVrm.expressionManager.setWeight(expressionName, weight);
        }

        return expressionName;
    } else {
        // For neutral, we just reset
        return null;
    }
}

// Reset all expressions
export function resetExpressions(currentVrm) {
    if (!currentVrm || !currentVrm.expressionManager) return;

    currentVrm.expressionManager.resetValues();
}