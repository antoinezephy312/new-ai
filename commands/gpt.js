const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'gpt',
  description: 'Ask a question to GPT model',
  role: 1,
  author: 'Kiana',
  
  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(' ').trim();
    
    if (!prompt) {
      return sendMessage(senderId, { text: ' Hello there! How can I Help you today?' }, pageAccessToken);
    }

    const apiUrl = `https://rest-api-production-5054.up.railway.app/gpt4om?prompt=${encodeURIComponent(prompt)}&uid=${senderId}`;

    try {
      const response = await axios.get(apiUrl);
      const text = response.data.message || 'Sorry, no valid response was received from GPT-4 API.';
      const maxMessageLength = 2000;

      const formattedResponse = 
`🌟 𝗚𝗣𝗧-𝗠𝗢𝗗𝗘𝗟\n\n${text}`;

      if (formattedResponse.length > maxMessageLength) {
        const messages = splitMessageIntoChunks(formattedResponse, maxMessageLength);
        for (const message of messages) {
          await sendMessage(senderId, { text: message }, pageAccessToken);
        }
      } else {
        await sendMessage(senderId, { text: formattedResponse }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling GPT-4 API:', error);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
