const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'checkgrammar',
  description: 'Fix grammar issues in seconds.',
  role: 1,
  author: 'Kiana',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return sendMessage(senderId, {
        text: 'Hello I am Grammarly'
      }, pageAccessToken);
    }

    const apiUrl = `https://api.joshweb.click/ai/neural-chat-7b?q=you%20are%20now,%20a%20grammar%20checker%20ai,%20your%20work%20is%20to%20correct%20the%20grammar.%20Here%27s%20the%20user%27s%20message: ${encodeURIComponent(prompt)}&uid=${senderId}`;

    try {
      const response = await axios.get(apiUrl);
      const reply = response.data.result;

      if (reply) {
        const formattedResponse = `✍️✨ 𝗚𝗿𝗮𝗺𝗺𝗮𝗿𝗹𝘆 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲:\n\n${reply}`;
        await sendMessage(senderId, { text: formattedResponse }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling Grammarly Api:', error);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
