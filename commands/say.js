const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage'); // Ensure the path is correct

module.exports = {
  name: "say",
  description: "Generate a voice message based on the provided text",
  role: 1,
  author: "developer",

  async execute(senderId, args, pageAccessToken) {
    const message = args.join(" ");

    if (!message) {
      return sendMessage(senderId, {
        text: `Usage: say [text you want to convert into voice]`
      }, pageAccessToken);
    }

    try {
      // Making a request to the voice API with the text and fixed id=8
      const res = await axios.get('https://joshweb.click/api/aivoice', {
        params: { q: message, id: 8 }
      });

      if (!res || !res.data || !res.data.url) {
        throw new Error("Error generating voice message.");
      }

      // Send the voice message as an audio attachment
      await sendMessage(senderId, {
        attachment: {
          type: "audio",
          payload: {
            url: res.data.url
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("Error generating voice message:", error);
      await sendMessage(senderId, {
        text: `Error generating voice message. Please try again later.`
      }, pageAccessToken);
    }
  }
};
