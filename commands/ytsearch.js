const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "video",
  description: "Extract and download YouTube videos",
  role: 1,
  author: "Kaizenji",

  async execute(senderId, args, pageAccessToken) {
    try {
      const searchQuery = args.join(" ");
      if (!searchQuery) {
        return sendMessage(senderId, { text: "Usage: video <search text>" }, pageAccessToken);
      }

      // Fetch video data from API
      const response = await axios.get(`https://kaiz-apis.gleeze.com/api/video?query=${encodeURIComponent(searchQuery)}`);
      const videoData = response.data;

      if (!videoData.download_url) {
        return sendMessage(senderId, { text: "No video found for the given search query." }, pageAccessToken);
      }

      const message = `📹 **YouTube Video Found:**\n\n🎵 **Title:** ${videoData.title}\n⏱ **Duration:** ${videoData.duration}\n\nClick below to watch/download:`;

      // Send video details message
      await sendMessage(senderId, { text: message }, pageAccessToken);

      // Send video thumbnail
      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: { url: videoData.thumbnail }
        }
      }, pageAccessToken);

      // Send the video as a link (since direct video uploads might fail)
      await sendMessage(senderId, {
        text: `🎥 **Download Video:**\n[Click Here](${videoData.download_url})`
      }, pageAccessToken);

    } catch (error) {
      console.error("Error:", error);
      sendMessage(senderId, { text: "An error occurred while processing the request." }, pageAccessToken);
    }
  }
};
