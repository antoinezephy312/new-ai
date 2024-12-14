const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'imgur',
  description: 'Enhance Photo by replying your image.',
  author: 'Clarence Mangigo',

  async execute(bot, args, authToken, event) {
    if (!event?.sender?.id) {
      console.error('Invalid event object: Missing sender ID.');
      sendMessage(bot, { text: 'Error: Missing sender ID.' }, authToken);
      return;
    }

    const senderId = event.sender.id;
    try {
      const imageUrl = await extractImageUrl(event, authToken);

      if (!imageUrl) {
        return sendMessage(bot, {
          text: `𝗣𝗹𝗲𝗮𝘀𝗲 𝘀𝗲𝗻𝗱 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝗳𝗶𝗿𝘀𝘁 𝗼𝗿 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝘄𝗶𝘁𝗵 "𝗿𝗲𝗺𝗶𝗻𝗶" 𝘁𝗼 𝗿𝗲𝗺𝗼𝘃𝗲 𝗶𝘁𝘀 𝗯𝗮𝗰𝗸𝗴𝗿𝗼𝘂𝗻𝗱.`
        }, authToken);
      }

      await sendMessage(bot, { text: '⌛ 𝗘𝗻𝗵𝗮𝗻𝗰𝗶𝗻𝗴 𝗜𝗺𝗮𝗴𝗲, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁...' }, authToken);

      const removeBgUrl = `https://kaiz-apis.gleeze.com/api/imgur?url=${encodeURIComponent(imageUrl)}`;

      const response = await axios.get(removeBgUrl);
      const result = response.data;

      // If the upload is successful, the result contains the image URL
      if (result?.uploaded?.status === 'success') {
        const imageLink = result.uploaded?.data?.link;  // Assuming the response format contains 'data.link' for the image
        await sendMessage(bot, {
          text: `𝗜𝗺𝗮𝗴𝗲 𝗘𝗻𝗵𝗮𝗻𝗰𝗲𝗱:`,
          attachment: {
            type: 'image',
            payload: { url: imageLink }
          }
        }, authToken);
      } else {
        console.error('Error enhancing image:', result?.uploaded?.error?.data?.error || 'Unknown error');
        await sendMessage(bot, { text: 'Error: Unable to enhance image at the moment. Please try again later.' }, authToken);
      }

    } catch (error) {
      console.error('Error removing background:', error);
      sendMessage(bot, {
        text: 'An error occurred while processing the image. Please try again later.'
      }, authToken);
    }
  }
};

async function extractImageUrl(event, authToken) {
  try {
    if (event.message.reply_to?.mid) {
      return await getRepliedImage(event.message.reply_to.mid, authToken);
    } else if (event.message?.attachments?.[0]?.type === 'image') {
      return event.message.attachments[0].payload.url;
    }
  } catch (error) {
    console.error('Failed to extract image URL:', error);
  }
  return '';
}

async function getRepliedImage(mid, authToken) {
  try {
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: authToken }
    });
    return data?.data[0]?.image_data?.url || '';
  } catch (error) {
    throw new Error('Failed to retrieve replied image.');
  }
}
