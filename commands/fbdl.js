const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const { sendMessage } = require("../handles/sendMessage");
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
      const tempFilePath = path.join(tempDir, `${senderId}.mp4`);

      // Download video
      const videoResponse = await axios({
        url: videoDownloadUrl,
        method: "GET",
        responseType: "stream",
      });

      const writer = fs.createWriteStream(tempFilePath);

      // Pipe the video stream to the file
      videoResponse.data.pipe(writer);

      writer.on("finish", async () => {
        // Prepare form data for sending the video file
        const form = new FormData();
        form.append("recipient", JSON.stringify({ id: senderId }));
        form.append("message", JSON.stringify({ attachment: "file" }));
        form.append("filedata", fs.createReadStream(tempFilePath));

        // Send the message with the attachment
        try {
          const uploadUrl = `https://graph.facebook.com/v12.0/me/messages?access_token=${authToken}`;
          const uploadResponse = await axios.post(uploadUrl, form, {
            headers: form.getHeaders(),
          });
          console.log("Message sent successfully:", uploadResponse.data);
        } catch (err) {
          console.error("Error sending message with attachment:", err);
          sendMessage(bot, { text: "Failed to send the video." }, authToken);
        }

        // Clean up file after sending
        try {
          fs.unlinkSync(tempFilePath);
        } catch (err) {
          console.error("Error deleting temporary file:", err);
        }
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
