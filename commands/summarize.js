const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage'); // Ensure the path is correct

module.exports = {
  name: 'summarize',
  description: 'Summarize a given text.',
  author: 'Kaizenji',
  role: 0,
  async execute(senderId, args, pageAccessToken) {
    try {
      if (args.length === 0) {
        return await sendMessage(senderId, { text: "Please provide text to summarize. Example: summarize Love is a beautiful feeling..." }, pageAccessToken);
      }

      const text = encodeURIComponent(args.join(" "));
      const apiUrl = `https://kaiz-apis.gleeze.com/api/summarizer?text=${text}`;

      const response = await axios.get(apiUrl);
      const { summary, keywords } = response.data;

      const message = `📝 **Summary:**\n${summary}\n\n🔑 **Keywords:** ${keywords.join(", ")}`;

      await sendMessage(senderId, { text: message }, pageAccessToken);
    } catch (error) {
      console.error('Error executing summarize command:', error);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
