const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { sendMessage } = require("../handles/sendMessage");
const { exec } = require("child_process");
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

module.exports = {
  name: "fbdl",
  description: "Download Facebook videos",
  role: 1,
  author: "Kiana",

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
      const { data } = await axios.get(apiUrl);
      
      if (!data.content || !data.content.status || !data.content.data.result.length) {
        return sendMessage(bot, { text: "Failed to retrieve video." }, authToken);
      }

      const videoHD = data.content.data.result.find((vid) => vid.quality === "HD") || data.content.data.result[0];
      const videoDownloadUrl = videoHD.url;
      const tempFilePath = path.join(__dirname, "../temp", `${senderId}.mp4`);

      const videoResponse = await axios({
        url: videoDownloadUrl,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(tempFilePath);
      videoResponse.data.pipe(writer);

      writer.on("finish", async () => {
        await sendMessage(bot, { attachment: fs.createReadStream(tempFilePath) }, authToken);
        fs.unlinkSync(tempFilePath);
      });

      writer.on("error", (err) => {
        console.error("Error writing video file:", err);
        sendMessage(bot, { text: "Failed to process the video." }, authToken);
      });
    } catch (error) {
      console.error("Error in fbdl command:", error);
      sendMessage(bot, { text: `Error: ${error.message || "Something went wrong."}` }, authToken);
    }
  },
};
