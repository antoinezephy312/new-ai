const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'wiki',
  description: 'Fetch a summary from Wikipedia for a given topic',
  author: 'Clarence',
  role: 1,

  async execute(senderId, args, pageAccessToken) {
    const query = args.join(' ').trim();

    if (!query) {
      await sendMessage(senderId, { text: 'Please provide a topic to search on Wikipedia.' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
      const response = await axios.get(apiUrl);
      const { title, extract, description, thumbnail, content_urls } = response.data;

      if (title && extract) {
        // Construct the message
        let message = `📚 *${title}*:\n\n${extract}`;

        // Include the description if available
        if (description) {
          message += `\n\n📝 Description: ${description}`;
        }

        // Include an image if available
        if (thumbnail && thumbnail.source) {
          message += `\n\n🌐 Image: ${thumbnail.source}`;
        }

        // Add the link to the full Wikipedia page
        message += `\n\n🔗 Read more: ${content_urls.desktop.page}`;

        // Send the summary message
        await sendMessage(senderId, { text: message }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: 'No information found for the specified topic.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error fetching Wikipedia summary:', error);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
