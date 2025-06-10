/**
 * GPT Service
 * 
 * This module provides functionality for interacting with the server-side GPT API.
 * It handles sending requests to the server and processing responses.
 */

import gptConfig from '../../config/gpt.config.json';


// Server API URL
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Track last response time for cooldown
let lastResponseTime = 0;

/**
 * Generate a response to a chat message using GPT
 * @param {string} username - The username of the message sender
 * @param {string} message - The message content
 * @returns {Promise<string|null>} - The generated response or null if no response
 */
export async function generateResponse(username, message) {
    // Cooldown check
    const now = Date.now();
    if (now - lastResponseTime < gptConfig.cooldownPeriod) {
        console.log('Response cooldown active, skipping message');
        return null;
    }

    try {
        // Send request to our server API
        const response = await fetch(`${API_URL}/generate-response`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, message })
        });

        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();

        // If we got a response, update the last response time
        if (data.response) {
            lastResponseTime = now;
        } else {
            console.log(`No response generated. Reason: ${data.reason}`);
        }

        // Return the generated response
        return data.response;
    } catch (error) {
        console.error('Error generating response from server:', error);
        return null;
    }
}

/**
 * Check if a message contains any animation triggers
 * @param {string} message - The message content
 * @returns {string|null} - The animation type to trigger, or null if none
 */
export function checkAnimationTriggers(message) {
    const lowerMessage = message.toLowerCase();

    // Check each animation trigger category
    for (const [animationType, triggers] of Object.entries(gptConfig.animationTriggers)) {
        // Check if message contains any trigger words for this animation
        if (triggers.some(trigger => lowerMessage.includes(trigger))) {
            return animationType;
        }
    }

    return null;
}
