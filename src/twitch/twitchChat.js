/**
 * Twitch Chat Integration
 * 
 * This module handles connecting to Twitch chat and displaying messages in the UI.
 * It uses the tmi.js library to connect to Twitch's IRC servers.
 * It also integrates with GPT for generating responses to messages.
 */

import tmi from 'tmi.js';
import { loadAnimation } from '../core';
import { generateResponse, checkAnimationTriggers } from '../gpt/gptService.js';

// DOM elements
let chatContainer;
let chatMessages;
let chatToggle;
let isMinimized = false;

// Maximum number of messages to display
const MAX_MESSAGES = 50;

// Animation control
let wavingTimeout = null;

/**
 * Initialize the Twitch chat integration
 * @param {Object} options - Configuration options
 * @param {string} options.channel - The Twitch channel to connect to
 * @param {boolean} options.anonymous - Whether to connect anonymously (default: true)
 */
export function initTwitchChat(options = {}) {
    // Default options
    const config = {
        channel: options.channel || 'twitchpresents', // Default to a popular channel if none specified
        anonymous: options.anonymous !== undefined ? options.anonymous : true
    };

    // Get DOM elements
    chatContainer = document.getElementById('twitch-chat-container');
    chatMessages = document.getElementById('twitch-chat-messages');
    chatToggle = document.getElementById('twitch-chat-toggle');

    // Set up toggle button
    chatToggle.addEventListener('click', toggleChatVisibility);

    // Create TMI client options
    const clientOptions = {
        connection: {
            reconnect: true,
            secure: true
        },
        channels: [config.channel]
    };

    // If anonymous, don't include identity
    if (!config.anonymous) {
        // Note: For non-anonymous usage, you would need to provide
        // OAuth credentials, which is not recommended for client-side code
        console.warn('Non-anonymous Twitch chat connections require OAuth tokens');
        console.warn('Consider using anonymous mode or implementing a server-side proxy');
    }

    // Create TMI client
    const client = new tmi.Client(clientOptions);

    // Register event handlers
    client.on('message', onMessageReceived);
    client.on('connected', onConnected);
    client.on('disconnected', onDisconnected);

    // Connect to Twitch
    client.connect().catch(error => {
        console.error('Error connecting to Twitch chat:', error);
        addSystemMessage('Failed to connect to Twitch chat. Please try again later.');
    });

    // Return the client for potential external use
    return client;
}

/**
 * Handle received chat messages
 * @param {string} channel - The channel the message was sent in
 * @param {Object} tags - Message tags containing metadata
 * @param {string} message - The message content
 * @param {boolean} self - Whether the message was sent by the client
 */
async function onMessageReceived(channel, tags, message, self) {
    // Ignore messages from self
    if (self) return;

    // Get username
    const username = tags['display-name'] || tags.username;

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';

    // Create username element with color
    const usernameElement = document.createElement('span');
    usernameElement.className = 'chat-username';
    usernameElement.textContent = username;

    // Use the user's color if available, or generate one
    if (tags.color) {
        usernameElement.style.color = tags.color;
    } else {
        // Generate a color based on the username
        const hash = username.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);
        const hue = Math.abs(hash % 360);
        usernameElement.style.color = `hsl(${hue}, 70%, 60%)`;
    }

    // Create message text
    const messageText = document.createTextNode(`: ${message}`);

    // Assemble message
    messageElement.appendChild(usernameElement);
    messageElement.appendChild(messageText);

    // Add to chat container
    chatMessages.appendChild(messageElement);

    // Limit the number of messages
    limitMessages();

    // Auto-scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Check for animation triggers in the message
    const animationType = checkAnimationTriggers(message);
    if (animationType) {
        console.log(`Animation trigger detected: ${animationType}`);

        // Clear any existing timeout
        if (wavingTimeout) {
            clearTimeout(wavingTimeout);
            wavingTimeout = null;
        }

        // Map animation type to actual animation name
        let animationName;
        switch (animationType) {
            case 'greeting':
                animationName = 'waving';
                break;
            case 'celebration':
                animationName = 'dance';
                break;
            case 'sad':
                animationName = 'sad';
                break;
            case 'laugh':
                animationName = 'laugh';
                break;
            default:
                animationName = 'dance';
        }

        // Start the animation
        loadAnimation(animationName);

        // Set timeout to return to dancing after 3 seconds
        wavingTimeout = setTimeout(() => {
            console.log('Returning to dancing animation');
            loadAnimation('dance');
            wavingTimeout = null;
        }, 3000);
    }

    // Generate a response using GPT
    try {
        const response = await generateResponse(username, message);

        // If we got a response, display it in the chat
        if (response) {
            console.log(`GPT response: ${response}`);

            // Create bot message element
            const botMessageElement = document.createElement('div');
            botMessageElement.className = 'chat-message bot-message';

            // Create bot username element
            const botUsernameElement = document.createElement('span');
            botUsernameElement.className = 'chat-username bot-username';
            botUsernameElement.textContent = 'AiStreamer';
            botUsernameElement.style.color = '#FF5733'; // Distinctive color for the bot

            // Create bot message text
            const botMessageText = document.createTextNode(`: ${response}`);

            // Assemble bot message
            botMessageElement.appendChild(botUsernameElement);
            botMessageElement.appendChild(botMessageText);

            // Add to chat container
            chatMessages.appendChild(botMessageElement);

            // Limit the number of messages
            limitMessages();

            // Auto-scroll to bottom
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    } catch (error) {
        console.error('Error generating GPT response:', error);
    }
}

/**
 * Add a system message to the chat
 * @param {string} message - The system message to display
 */
function addSystemMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message system-message';
    messageElement.textContent = message;
    messageElement.style.fontStyle = 'italic';
    messageElement.style.opacity = '0.8';

    chatMessages.appendChild(messageElement);
    limitMessages();
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Handle successful connection to Twitch
 * @param {string} address - The server address connected to
 * @param {number} port - The port connected to
 */
function onConnected(address, port) {
    console.log(`Connected to Twitch chat: ${address}:${port}`);
    addSystemMessage('Connected to Twitch chat!');
}

/**
 * Handle disconnection from Twitch
 * @param {string} reason - The reason for disconnection
 */
function onDisconnected(reason) {
    console.log(`Disconnected from Twitch chat: ${reason}`);
    addSystemMessage(`Disconnected from Twitch chat: ${reason}`);
}

/**
 * Toggle the visibility of the chat container
 */
function toggleChatVisibility() {
    isMinimized = !isMinimized;

    if (isMinimized) {
        chatMessages.style.display = 'none';
        chatToggle.textContent = '+';
        chatContainer.style.height = 'auto';
    } else {
        chatMessages.style.display = 'flex';
        chatToggle.textContent = '-';
        chatContainer.style.height = '';
    }
}

/**
 * Limit the number of messages to prevent memory issues
 */
function limitMessages() {
    while (chatMessages.children.length > MAX_MESSAGES) {
        chatMessages.removeChild(chatMessages.firstChild);
    }
}
