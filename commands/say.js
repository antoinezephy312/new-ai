const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "say",
  description: "Generate a voice message based on the prompt",
  role: 1,
  author: "developer",

  async execute(senderId, args, pageAccessToken, messageSender) { // Renamed parameter to `messageSender`
    const prompt = args.join(" ");

    if (!prompt) {
      return messageSender(senderId, {  // Use `messageSender` instead of `sendMessage`
        text: `Usage: say [your message]`
      }, pageAccessToken);
    }

    try {
      // Generate the full API URL with the prompt included
      const apiUrl = `https://joshweb.click/api/aivoice?q=${encodeURIComponent(prompt)}&id=8`;

      // Send the generated audio file
      await messageSender(senderId, {  // Again use `messageSender`
        attachment: {
          type: "audio",
          payload: {
            url: apiUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("Error generating voice message:", error);
      messageSender(senderId, {  // Use `messageSender` here too
        text: `Error generating voice message. Please try again or check your input.`
      }, pageAccessToken);
    }
  }
};
