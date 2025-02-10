const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage'); // Ensure the path is correct

module.exports = {
  name: "spotify",
  description: "Search for a Spotify track using a keyword",
  role: 1,
  author: "developer",

  async execute(senderId, args, pageAccessToken) {
    const searchQuery = args.join(" ");

    if (!searchQuery) {
      return sendMessage(senderId, {
        text: `Usage: spotify [music title]`
      }, pageAccessToken);
    }

    try {
      // Indicate that the bot is searching
      await sendMessage(senderId, {
        text: `🔍 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 𝐟𝐨𝐫 𝐬𝐨𝐧𝐠:\n${searchQuery}`
      }, pageAccessToken);

      const res = await axios.get('https://hiroshi-api.onrender.com/tiktok/spotify', {
        params: { search: searchQuery }
      });

      if (!res || !res.data || res.data.length === 0) {
        throw new Error("No results found");
      }

      const { name: trackName, download, image, track } = res.data[0];

      // Send the track preview with buttons
      await sendMessage(senderId, {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [
              {
                title: trackName,
                image_url: image,
                subtitle: "Click a button below to listen or download.",
                buttons: [
                  {
                    type: "web_url",
                    url: track,
                    title: "🎵 Listen on Spotify"
                  },
                  {
                    type: "web_url",
                    url: download,
                    title: "⬇ Download Audio"
                  }
                ]
              }
            ]
          }
        }
      }, pageAccessToken);

      // Send the audio file as an attachment
      await sendMessage(senderId, {
        attachment: {
          type: "audio",
          payload: {
            url: download,
            is_reusable: true
          }
        }
      }, pageAccessToken);
    
    } catch (error) {
      console.error("Error retrieving the Spotify track:", error);
      await sendMessage(senderId, {
        text: `⚠ Error retrieving the Spotify track. Please try again or check your input.`
      }, pageAccessToken);
    }
  }
};
