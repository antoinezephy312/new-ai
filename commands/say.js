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
        params: { q: message, id: 8 },
        responseType: 'arraybuffer' // Specify that the response is audio data
      });

      if (!res || !res.data) {
        throw new Error("Error generating voice message.");
      }

      // Convert the arraybuffer response to a Buffer and send it as audio
      const audioBuffer = Buffer.from(res.data, 'binary');

      // Send the audio message as an audio attachment
      await sendMessage(senderId, {
        attachment: {
          type: "audio",
          payload: {
            data: audioBuffer.toString('base64'),
            is_reusable: true
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
