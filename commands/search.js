const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage'); // Ensure the path is correct

module.exports = {
  name: 'search',
  description: 'Search DuckDuckGo',
  author: 'Clarence Mangigo',
  role: 1,

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ');

    try {
      const apiUrl = `https://clarence-rest-apiv1.onrender.com/api/search?query=${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);
      const results = response.data;

      if (results && results.length > 0) {
        let searchMessage = `Here are some search results for: "${query}":\n\n`;

        results.forEach((result, index) => {
          searchMessage += `${index + 1}. ${result.title}\n${result.description}\nSource: ${result.source}\nLink: ${result.url}\n\n`;
        });

        // Send the search results in chunks if necessary
        await sendResponseInChunks(senderId, searchMessage, pageAccessToken);
      } else {
        console.error('Error: No results found in the response.');
        await sendMessage(senderId, { text: 'Sorry, no results were found for your query.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling Search API:', error);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};

// Function to send messages in chunks
async function sendResponseInChunks(senderId, text, pageAccessToken) {
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

// Function to split a message into chunks
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
