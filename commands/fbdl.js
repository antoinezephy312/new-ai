const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

console.log("sendMessage function:", sendMessage);

module.exports = {
  name: "fbdl",
  description: "Instagram & Facebook Video Downloader",
  role: 1,
  author: "mark",

  async execute(senderId, args, pageAccessToken) {
    const prompt = args.join(" ");

    if (!prompt) {
      return sendMessage(senderId, {
        text: `Usage: fbdl [ URL ]`
      }, pageAccessToken);
    }

    try {
      const apiUrl = `https://ccprojectsapis.zetsu.xyz/api/fbdl?url=${encodeURIComponent(prompt)}`;
      const response = await axios.get(apiUrl);

      if (!response.data || !response.data.dl) {
        throw new Error("Invalid API response.");
      }

      const videoUrl = response.data.dl;

      console.log("Sending message with video URL:", videoUrl);

      await sendMessage(senderId, {
        attachment: {
          type: "video",
          payload: {
            url: videoUrl
          }
        }
      }, pageAccessToken);

    } catch (error) {
      console.error("Error pa fix kay owner:", error);
      sendMessage(senderId, {
        text: `Error pa fix kay owner. Please try again or check your input.`
      }, pageAccessToken);
    }
  }
};
