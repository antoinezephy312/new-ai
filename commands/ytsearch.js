const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "video",
  description: "Extract and send YouTube videos",
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

      const message = `📹 **YouTube Video Found:**\n\n🎵 **Title:** ${videoData.title}\n⏱ **Duration:** ${videoData.duration}\n\n⬇️ Downloading... Please wait.`;

      // Send initial message
      await sendMessage(senderId, { text: message }, pageAccessToken);

      // Send the video file
      await sendMessage(senderId, {
        attachment: {
          type: "video",
          payload: {
            url: videoData.download_url,
            is_reusable: true
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("Error:", error);
      sendMessage(senderId, { text: "An error occurred while processing the request." }, pageAccessToken);
    }
  }
};
