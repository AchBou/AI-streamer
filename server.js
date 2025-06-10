/**
 * OpenAI API Server
 * 
 * This server provides a secure way to interact with the OpenAI API
 * without exposing API keys in client-side code.
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');


// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // Serve static files from dist directory

// Load server config
let serverConfig;
try {
    // Load the JSON config file
    serverConfig = require('./config/server.config.json');
} catch (error) {
    console.error('Error loading server config:', error);
    // Default config if file can't be loaded
    serverConfig = {
        openai: {
            model: 'gpt-3.5-turbo',
            maxTokens: 150,
            temperature: 0.7
        },
        bot: {
            systemPrompt: "You are a friendly and helpful AI streamer assistant. Keep your responses concise, entertaining, and engaging."
        },
        response: {
            threshold: 0.7,
            cooldownPeriod: 10000
        },
        filtering: {
            ignoreCommands: true,
            ignoreUsers: []
        },
        animationTriggers: {
            greeting: ['hello', 'hi', 'hey', 'greetings'],
            celebration: ['congrats', 'congratulations', 'amazing', 'wow'],
            sad: ['sad', 'sorry', 'unfortunate'],
            laugh: ['lol', 'haha', 'funny', 'joke']
        }
    };
}

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Track last response time for cooldown
let lastResponseTime = 0;

/**
 * Check if a message should be ignored based on configuration
 */
function shouldIgnoreMessage(username, message) {
    // Check if user is in ignore list
    if (serverConfig.filtering.ignoreUsers && serverConfig.filtering.ignoreUsers.includes(username.toLowerCase())) {
        return true;
    }

    // Check if message is a command and commands should be ignored
    return serverConfig.filtering.ignoreCommands && message.startsWith('!');

}

/**
 * Check if a message contains any animation triggers
 */
function checkAnimationTriggers(message) {
    if (!serverConfig.animationTriggers) return null;

    const lowerMessage = message.toLowerCase();

    // Check each animation trigger category
    for (const [animationType, triggers] of Object.entries(serverConfig.animationTriggers)) {
        // Check if message contains any trigger words for this animation
        if (triggers.some(trigger => lowerMessage.includes(trigger))) {
            return animationType;
        }
    }

    return null;
}

// API endpoint for generating responses
app.post('/api/generate-response', async (req, res) => {
    try {
        const { username, message } = req.body;

        if (!username || !message) {
            return res.status(400).json({ error: 'Username and message are required' });
        }

        // Check cooldown period
        const now = Date.now();
        if (now - lastResponseTime < serverConfig.response.cooldownPeriod) {
            return res.json({ 
                response: null,
                reason: 'cooldown',
                animationType: checkAnimationTriggers(message)
            });
        }

        // Check if message should be ignored
        if (shouldIgnoreMessage(username, message)) {
            return res.json({ 
                response: null,
                reason: 'ignored',
                animationType: checkAnimationTriggers(message)
            });
        }

        // Check response threshold (random chance to respond)
        if (Math.random() > serverConfig.response.threshold) {
            return res.json({ 
                response: null,
                reason: 'threshold',
                animationType: checkAnimationTriggers(message)
            });
        }

        // Send request to OpenAI API
        const completion = await openai.chat.completions.create({
            model: serverConfig.openai.model,
            messages: [
                { role: 'system', content: serverConfig.bot.systemPrompt },
                { role: 'user', content: `${username}: ${message}` }
            ],
            max_tokens: serverConfig.openai.maxTokens,
            temperature: serverConfig.openai.temperature
        });

        // Update last response time
        lastResponseTime = now;

        // Return the generated response
        return res.json({
            response: completion.choices[0].message.content.trim(),
            animationType: checkAnimationTriggers(message)
        });
    } catch (error) {
        console.error('Error generating response:', error);
        return res.status(500).json({ error: 'Failed to generate response' });
    }
});

// API endpoint for checking animation triggers
app.post('/api/check-animation', (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const animationType = checkAnimationTriggers(message);
        return res.json({ animationType });
    } catch (error) {
        console.error('Error checking animation triggers:', error);
        return res.status(500).json({ error: 'Failed to check animation triggers' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`OpenAI API server is ready to handle requests`);
});
