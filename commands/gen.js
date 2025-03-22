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
      // Upload the image to Facebook's servers
      const uploadResponse = await axios.post(
        `https://graph.facebook.com/v19.0/me/message_attachments?access_token=${pageAccessToken}`,
        {
          message: {
            attachment: {
              type: 'image',
              payload: {
                url: apiUrl,
                is_reusable: true
              }
            }
          }
        }
      );

      // Extract attachment ID from response
      const attachmentId = uploadResponse.data.attachment_id;

      // Send the image using the uploaded attachment ID
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
