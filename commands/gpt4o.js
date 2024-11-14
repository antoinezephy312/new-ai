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

    const apiUrl = `https://appjonellccapis.zapto.org/api/gpt4turbo?q=${encodeURIComponent(prompt)}&id=${senderId}`;

    try {
      const response = await axios.get(apiUrl);
      const rawResponse = response.data.response || '';

      // Extract JSON content and parse it
      const jsonStart = rawResponse.indexOf('{');
      const jsonEnd = rawResponse.lastIndexOf('}') + 1;
      const jsonString = rawResponse.substring(jsonStart, jsonEnd);
      const parsedData = JSON.parse(jsonString);
      
      const text = parsedData.prompt || 'No response received. Please try again later.';

      // Extract image URL from Markdown syntax
      const imageUrlMatch = rawResponse.match(/\!\[image\]\((.*?)\)/);
      const imageUrl = imageUrlMatch ? imageUrlMatch[1] : null;

      // Send the generated text response
      await sendMessage(senderId, { text }, pageAccessToken);

      // If there is an image URL, send it as an attachment
      if (imageUrl) {
        await sendMessage(senderId, {
          attachment: {
            type: 'image',
            payload: {
              url: imageUrl,
              is_reusable: true
            }
          }
        }, pageAccessToken);
      }

    } catch (error) {
      console.error('Error calling GPT-4 API with attachments:', error);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
