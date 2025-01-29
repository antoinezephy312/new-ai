const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "fbdl",
  description: "Download Facebook videos",
  role: 1,
  author: "Clarence",

  async execute(bot, args, authToken, event) {
    if (!event?.sender?.id) {
      console.error("Invalid event object: Missing sender ID.");
      sendMessage(bot, { text: "Error: Missing sender ID." }, authToken);
      return;
    }

    const senderId = event.sender.id;
    const fbUrl = args.join(" ");

    if (!fbUrl) {
      return sendMessage(bot, { text: "Please provide a valid Facebook video URL." }, authToken);
    }

    try {
      const apiUrl = `https://dataforge-api-production.up.railway.app/api/downloader?url=${encodeURIComponent(fbUrl)}`;
      const response = await axios.get(apiUrl);
      
      if (!response.data?.content?.status || !response.data?.content?.data?.result?.length) {
        return sendMessage(bot, { text: "Failed to fetch video. Please check the URL and try again." }, authToken);
      }
      
      const videos = response.data.content.data.result;
      let message = "🎥 Facebook Video Download\n━━━━━━━━━━━━━━━━━━\n";
      
      videos.forEach((video, index) => {
        message += `📌 Quality: ${video.quality}\n🔗 [Download Here](${video.url})\n\n`;
      });
      
      sendMessage(bot, { text: message }, authToken);
    } catch (error) {
      console.error("Error in fbdl command:", error);
      sendMessage(bot, { text: `Error: ${error.message || "Something went wrong."}` }, authToken);
    }
  }
};
