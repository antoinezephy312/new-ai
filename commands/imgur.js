const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imgur',
  description: 'Upload an image to Imgur by replying to it.',
  author: 'French Clarence Mangigo',
  role: 1,

  async execute(bot, args, authToken, event) {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
  console.error("Replied message or attachments missing:", event.messageReply);
  await sendMessage(senderId, { text: "Please reply to an image with the command to upload it to Imgur." }, pageAccessToken);
  return;
}


    const attachments = event.message.reply_to.attachments.filter(att => att.type === 'image');

    if (attachments.length === 0) {
      await sendMessage(bot, {
        text: 'No images detected in the replied message. Please reply to an image.'
      }, authToken);
      return;
    }

    const uploadPromises = attachments.map(async attachment => {
      try {
        const response = await axios.get('https://kaiz-apis.gleeze.com/api/imgur', {
          params: { url: attachment.payload.url }
        });
        return response.data.uploaded.image;
      } catch (error) {
        console.error('Error uploading image to Imgur:', error);
        return null;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const uploadedImages = results.filter(url => url !== null);

      const successCount = uploadedImages.length;
      const failCount = attachments.length - successCount;

      const responseMessage = `Uploaded successfully ${successCount} image(s)\nFailed to upload: ${failCount}\nImage link(s):\n${uploadedImages.join("\n")}`;

      await sendMessage(bot, { text: responseMessage }, authToken);
    } catch (error) {
      console.error('Error processing Imgur uploads:', error);
      await sendMessage(bot, {
        text: 'An error occurred while uploading images to Imgur. Please try again later.'
      }, authToken);
    }
  }
};
