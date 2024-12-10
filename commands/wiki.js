const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

// Function to convert regular text to bold Unicode text
function toBoldUnicode(text) {
  return text.split('').map(char => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      // Uppercase letter
      return String.fromCharCode(code + 0x1D400 - 65);
    } else if (code >= 97 && code <= 122) {
      // Lowercase letter
      return String.fromCharCode(code + 0x1D41A - 97);
    }
    // Return as is if not a letter
    return char;
  }).join('');
}

module.exports = {
  name: 'wikipedia',
  description: 'Fetch a summary from Wikipedia for a given topic',
  author: 'Clarence',
  role: 1,

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ').trim();

    if (!query) {
      await sendMessage(senderId, { text: '⚠️ Please provide a topic to search on Wikipedia.' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);
      const { title, extract, description, thumbnail, content_urls } = response.data;

      if (title && extract) {
        // Convert title to bold Unicode format
        const styledTitle = toBoldUnicode(title);

        // Start constructing the message with bold title
        let message = `🌟 ${styledTitle}\n\n`;

        // Add description if available
        if (description) {
          message += `📝 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${description}\n\n`;
        }

        // Add summary text with line breaks for readability
        message += `📚 𝗦𝘂𝗺𝗺𝗮𝗿𝘆:\n${extract}\n\n`;

        // Include the image if available
        if (thumbnail && thumbnail.source) {
          message += `🖼️ 𝗜𝗺𝗮𝗴𝗲: ${thumbnail.source}\n\n`;
        }

        // Add the link to the full Wikipedia page with an emoji
        message += `🔗 *Read more*: [Wikipedia Page](${content_urls.desktop.page})`;

        // Send the formatted message
        await sendMessage(senderId, { text: message }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: '⚠️ No information found for the specified topic.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error fetching Wikipedia summary:', error);
      await sendMessage(senderId, { text: '⚠️ Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
