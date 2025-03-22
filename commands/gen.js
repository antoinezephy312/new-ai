const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'gen',
  description: 'Generate an image based on a prompt.',
  role: 1,
  author: 'FRENCH MANGIGO',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a prompt.\n\nUsage:\nExample: gen cat'
      }, pageAccessToken);
      return;
    }

    const prompt = args.join(' ');
    const apiUrl = `https://api.zetsu.xyz/api/dalle-3?prompt=${encodeURIComponent(prompt)}`;

    try {
      // Step 1: Fetch the image from the API
      const response = await axios.get(apiUrl, { responseType: 'json' });

      if (!response.data || !response.data.url) {
        throw new Error('Invalid API response');
      }

      const imageUrl = response.data.url; // Assuming the API response contains "url"

      // Step 2: Upload the image to Facebook's servers
      const uploadResponse = await axios.post(
        `https://graph.facebook.com/v19.0/me/message_attachments?access_token=${pageAccessToken}`,
        {
          message: {
            attachment: {
              type: 'image',
              payload: {
                url: imageUrl,
                is_reusable: true
              }
            }
          }
        }
      );

      // Step 3: Extract attachment ID from response
      const attachmentId = uploadResponse.data.attachment_id;

      // Step 4: Send the image using the uploaded attachment ID
      await sendMessage(senderId, {
        attachment: {
          type: 'image',
          payload: {
            attachment_id: attachmentId
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error('Error generating image:', error.response?.data || error.message);
      await sendMessage(senderId, {
        text: 'An error occurred while generating the image. Please try again later.'
      }, pageAccessToken);
    }
  }
};
