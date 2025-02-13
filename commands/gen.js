const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'gen',
  description: 'Generate an image based on a prompt.',
  role: 1,
  author: 'Jay Mar',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a prompt.\n\nUsage:\nExample: gen cat'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const apiUrl = `https://dataforge-api-production.up.railway.app/api/ideogramturbo?prompt=${encodeURIComponent(prompt)}`;

    try {
      // Fetch the image from the API
      const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

      // Convert image to a Buffer and encode as base64
      const base64Image = Buffer.from(response.data, 'binary').toString('base64');

      // Upload the image to an image hosting service (optional)
      // If the API already returns a usable URL, this step is unnecessary

      // Send the image to Messenger
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            url: apiUrl, // Ensure this is a valid public URL
            is_reusable: true
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error generating image:', error);
      await sendMessage(senderId, {
        text: 'An error occurred while generating the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
