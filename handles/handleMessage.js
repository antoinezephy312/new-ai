const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { sendMessage } = require('./sendMessage');
const config = require('../config.json');

const commands = new Map();

// Load commands
const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`../commands/${file}`);
  commands.set(command.name.toLowerCase(), command);
  console.log(`Loaded command: ${command.name}`);
}

async function handleMessage(event, pageAccessToken) {
  if (!event?.sender?.id) {
    console.error('Invalid event object: Missing sender ID.');
    return;
  }

  const senderId = event.sender.id;

  // Check if the received message has text
  if (event.message?.text) {
    const messageText = event.message.text.trim().toLowerCase();
    console.log(`Received message: ${messageText}`);

    // Check for "hi" or similar greetings
    if (["hi", "hello", "get started", "hey"].includes(messageText)) {
      return sendIntroduction(senderId, pageAccessToken);
    }

    // Extract command and arguments
    const words = messageText.split(' ');
    const commandName = words.shift().toLowerCase();
    const args = words;

    console.log(`Parsed command: ${commandName} with arguments: ${args}`);

    // Execute command if exists
    if (commands.has(commandName)) {
      const command = commands.get(commandName);

      if (command.role === 0 && !config.adminId.includes(senderId)) {
        sendMessage(senderId, { text: 'You are not authorized to use this command.' }, pageAccessToken);
        return;
      }

      try {
        await command.execute(senderId, args, pageAccessToken, event);
      } catch (error) {
        console.error(`Error executing command "${commandName}":`, error);
        sendMessage(senderId, { text: 'There was an error executing that command.' }, pageAccessToken);
      }
    } else {
      // Default "AI" command if message is unrecognized
      const defaultCommand = commands.get('ai');
      if (defaultCommand) {
        try {
          await defaultCommand.execute(senderId, [messageText], pageAccessToken, event);
        } catch (error) {
          console.error('Error executing default "ai" command:', error);
          sendMessage(senderId, { text: 'There was an error processing your request.' }, pageAccessToken);
        }
      } else {
        sendMessage(senderId, { text: "Sorry, I couldn't understand that. Please try again." }, pageAccessToken);
      }
    }
  } else {
    console.error('Message or text is not present in the event.');
  }
}

// Function to send the introduction message with buttons
async function sendIntroduction(senderId, pageAccessToken) {
  const introductionMessage = {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: "Hello! I am Kiro, your assistant.\n\nType 'help' for available commands.",
        buttons: [
          {
            type: "postback",
            title: "help",
            payload: "HELP"
          },
          {
            type: "postback",
            title: "about",
            payload: "about"
          }
        ]
      }
    }
  };

  try {
    await sendMessage(senderId, introductionMessage, pageAccessToken);
    console.log('Introduction message sent successfully.');
  } catch (error) {
    console.error('Failed to send introduction message:', error);
  }
}

module.exports = { handleMessage };
