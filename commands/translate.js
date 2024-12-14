const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'translate',
  description: 'Translate text to a specified language',
  author: 'Clarence',
  role: 1,
  async execute(senderId, args, pageAccessToken) {
    if (args.length < 2) {
      // Notify user if the command format is incorrect
      return sendMessage(
        senderId,
        {
          text: 'Please use the command like this:\n\n`translate <language-code> <text>`\nExample: `translate es Hello, how are you?`',
        },
        pageAccessToken
      );
    }

    // Extract target language and text to translate
    const lang = args[0];
    const translateThis = args.slice(1).join(' ');

    try {
      const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(lang)}&dt=t&q=${encodeURIComponent(translateThis)}`;
      const response = await axios.get(apiUrl);

      // The translation is in the first element of the returned array
      const translatedText = response.data[0][0][0];

      // Prepare the response message
      const responseMessage = `🌐 **Translation**:\n\n**Original**: ${translateThis}\n**Translated** (${lang}): ${translatedText}`;

      // Split and send if the message exceeds the limit
      await sendResponseInChunks(senderId, responseMessage, pageAccessToken, sendMessage);
    } catch (error) {
      console.error('Error calling Translate API:', error);
      await sendMessage(
        senderId,
        { text: 'Sorry, there was an error processing your request.' },
        pageAccessToken
      );
    }
  },
};

// Utility functions for splitting long messages into chunks
async function sendResponseInChunks(senderId, text, pageAccessToken, sendMessage) {
  const maxMessageLength = 2000;
  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    for (const message of messages) {
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  let chunk = '';
  const words = message.split(' ');

  for (const word of words) {
    if ((chunk + word).length > chunkSize) {
      chunks.push(chunk.trim());
      chunk = '';
    }
    chunk += `${word} `;
  }

  if (chunk) {
    chunks.push(chunk.trim());
  }

  return chunks;
}
