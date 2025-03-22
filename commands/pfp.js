const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'pfp',
  description: 'Fetch a Facebook profile picture by UID.',
  role: 1,
  author: 'Jay Mar',

  async execute(senderId, args, pageAccessToken) {
    if (!args || args.length === 0) {
      await sendMessage(senderId, {
        text: 'Please provide a Facebook UID.\n\nUsage:\nExample: pfp 100027752014260'
      }, pageAccessToken);
      return;
    }

    const uid = args[0];
    const apiUrl = `https://kaiz-apis.gleeze.com/api/facebookpfp?uid=${encodeURIComponent(uid)}`;

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
      console.error('Error fetching profile picture:', error.response?.data || error.message);
      await sendMessage(senderId, {
        text: 'An error occurred while fetching the profile picture. Please try again later.'
      }, pageAccessToken);
    }
  }
};
