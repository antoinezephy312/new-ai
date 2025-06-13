const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'blackbox',
  description: 'Ask a question to the Blackbox AI',
  role: 1,
  author: 'Kiana',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();

    if (!prompt) {
      return sendMessage(senderId, {
        text: 'Hello! I am Blackbox Ai, how can I help you?'
      }, pageAccessToken);
    }

    const apiUrl = 'https://kaiz-apis.gleeze.com/api/blackbox';
    const params = {
      ask: prompt,
      uid: senderId,
      webSearch: 'off',
      apikey: '8499a47e-19b0-40a2-84c9-a3f1ec2d929d'
    };

    try {
      const response = await axios.get(apiUrl, { params });
      const reply = response.data.response?.trim();

      if (reply && reply.length > 0) {
        const formattedResponse = `💻📦 𝗕𝗹𝗮𝗰𝗸𝗯𝗼𝘅 𝗔𝗜 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲:\n\n${reply}`;
        const maxLength = 2000;

        if (formattedResponse.length > maxLength) {
          const chunks = [];
          let remainingText = formattedResponse;

          while (remainingText.length > 0) {
            chunks.push(remainingText.substring(0, maxLength));
            remainingText = remainingText.substring(maxLength);
          }

          for (const chunk of chunks) {
            await sendMessage(senderId, { text: chunk }, pageAccessToken);
          }
        } else {
          await sendMessage(senderId, { text: formattedResponse }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: 'Sorry, I didn’t understand that. Can you try rephrasing?' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling Blackbox API:', error);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
