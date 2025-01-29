const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "fbdl",
  description: "Download Facebook videos",
  role: 0,
  author: "Clarence",

  async execute(bot, args, authToken, event) {
    if (!event?.sender?.id) {
      console.error("Invalid event object: Missing sender ID.");
      sendMessage(bot, { text: "Error: Missing sender ID." }, authToken);
      return;
    }

    const senderId = event.sender.id;
    const videoUrl = args[0];

    if (!videoUrl) {
      return sendMessage(bot, { text: "Please provide a Facebook video URL." }, authToken);
    }

    try {
      const apiUrl = `https://dataforge-api-production.up.railway.app/api/downloader?url=${encodeURIComponent(videoUrl)}`;
      const response = await axios.get(apiUrl);

      if (response.data.content.status && response.data.content.data.result.length > 0) {
        const hdVideo = response.data.content.data.result.find(v => v.quality === "HD");
        const sdVideo = response.data.content.data.result.find(v => v.quality === "SD");

        let message = "\uD83D\uDCF9 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐕𝐢𝐝𝐞𝐨 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝\n━━━━━━━━━━━━━━━━━━\n";
        message += hdVideo ? `🎥 HD: ${hdVideo.url}\n` : "❌ HD video not available\n";
        message += sdVideo ? `🎥 SD: ${sdVideo.url}\n` : "❌ SD video not available\n";

        sendMessage(bot, { text: message }, authToken);
      } else {
        sendMessage(bot, { text: "❌ Failed to retrieve video. Please check the URL and try again." }, authToken);
      }
    } catch (error) {
      console.error("Error in Facebook downloader command:", error);
      sendMessage(bot, { text: `Error: ${error.message || "Something went wrong."}` }, authToken);
    }
  }
};
