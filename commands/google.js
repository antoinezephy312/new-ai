const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'google',
  description: 'Ask a question to the Google Assistant',
  role: 1,
  author: 'Kiana',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return sendMessage(senderId, {
        text: 'Please Provide a Prompt'
      }, pageAccessToken);
    }

    const apiUrl = `https://clarence-rest-apiv1.onrender.com/api/gptChat?q=you%20will%20respond%20as%20google%20assistant,%20here%27s%20the%20user%27s%20message:${encodeURIComponent(prompt)}`;

    try {
      const response = await axios.get(apiUrl);
      const reply = response.data.message;

      if (reply) {
        const formattedResponse = `🌟 𝗚𝗼𝗼𝗴𝗹𝗲 𝗔𝘀𝘀𝗶𝘀𝘁𝗮𝗻𝘁:\n\n${reply}`;
        await sendMessage(senderId, { text: formattedResponse }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling Google Api:', error);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
