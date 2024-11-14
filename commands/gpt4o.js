const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'gpt4o',
  description: 'Conversational GPT-4 with attachments support',
  role: 1,
  author: 'Kiana',

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ');
    
    if (!prompt) {
      return sendMessage(senderId, { text: '🌟 Hello, is there any question? How Can I help You?' }, pageAccessToken);
    }

    const apiUrl = `https://rest-api-production-5054.up.railway.app/ai?prompt=${encodeURIComponent(prompt)}&uid=${senderId}`;

    try {
      const response = await axios.get(apiUrl);
      const text = response.data.message || 'No response received from GPT-4o. Please try again later.';
      const attachments = response.data.attachments || [];

      await sendMessage(senderId, { text }, pageAccessToken);

      if (attachments.length > 0) {
        const attachmentMessages = attachments.map(att => {
          if (att.type === 'image') {
            return {
              attachment: {
                type: 'image',
                payload: {
                  url: att.url,
                  is_reusable: true
                }
              }
            };
          }
          return null; // Handle other attachment types if needed
        }).filter(msg => msg !== null);

        for (let attachmentMessage of attachmentMessages) {
          await sendMessage(senderId, attachmentMessage, pageAccessToken);
        }
      }

    } catch (error) {
      console.error('Error calling GPT-4 API with attachments:', error);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
                                                   
