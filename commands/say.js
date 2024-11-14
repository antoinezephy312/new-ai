const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage'); // Ensure the path is correct

module.exports = {
  name: 'say',
  description: 'Generate a voice message based on your prompt',
  author: 'Clarence',
  role: 1,
  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');

    // Check if the prompt is provided
    if (!prompt) {
      return await sendMessage(senderId, {
        text: `Usage: say [your message]`
      }, pageAccessToken);
    }

    try {
      // Make a request to the voice generation API
      const apiUrl = 'https://joshweb.click/api/aivoice';
      const response = await axios.get(apiUrl, {
        params: {
          q: prompt,
          id: 8
        },
        responseType: 'arraybuffer'  // Expect the response as raw binary data (audio)
      });

      // Convert the audio buffer to a URL or handle it as needed
      const audioUrl = `data:audio/mp3;base64,${Buffer.from(response.data, 'binary').toString('base64')}`;

      // Send the voice message as an audio attachment
      await sendMessage(senderId, {
        attachment: {
          type: 'audio',
          payload: {
            url: audioUrl
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error generating voice message:', error);
      await sendMessage(senderId, {
        text: `Error generating voice message. Please try again later.`
      }, pageAccessToken);
    }
  }
};
