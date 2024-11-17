const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "ytsearch",
  description: "Search for YouTube videos",
  role: 1,
  author: "Clarence",

  async execute(senderId, args, pageAccessToken) {
    try {
      const searchQuery = args.join(" ");
      if (!searchQuery) {
        return sendMessage(senderId, { text: "Usage: ytsearch <search text>" }, pageAccessToken);
      }

      const response = await axios.get(`https://markdevs69v2-679r.onrender.com/new/api/youtube?q=${encodeURIComponent(searchQuery)}`);
      const videos = response.data.response;

      if (!videos || videos.length === 0) {
        return sendMessage(senderId, { text: "No videos found for the given search query." }, pageAccessToken);
      }

      // Get the first video from the search results
      const videoData = videos[0];

      const message = `🎥 YouTube Search Result:\n\n📹 Title: ${videoData.title}\n🕒 Duration: ${videoData.duration.timestamp}\n👤 Channel: ${videoData.author.name}\n🔗 Channel URL: ${videoData.author.url}\n👁️ Views: ${videoData.views.toLocaleString()}\n\n🔗 Watch Video: ${videoData.url}`;

      sendMessage(senderId, { text: message }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      sendMessage(senderId, { text: "An error occurred while processing the request." }, pageAccessToken);
    }
  }
};
