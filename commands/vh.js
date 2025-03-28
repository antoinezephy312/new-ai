const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "test",
  description: "Search for TikTok videos",
  role: 1,
  author: "Jay Mar",

  async execute(senderId, args, pageAccessToken) {
    try {
      const searchQuery = args.join(" ");
      if (!searchQuery) {
        return sendMessage(senderId, { text: "Usage: tiksearch <search text>" });
      }

      const apiUrl = `https://markdevs-last-api-vtjp.onrender.com/api/tiksearch?search=${encodeURIComponent(searchQuery)}`;
      const response = await axios.get(apiUrl);
      const { data } = response.data;

      if (!data || !data.videos || data.videos.length === 0) {
        return sendMessage(senderId, { text: "No TikTok videos found for your search." });
      }

      // Get the first video from the search results
      const video = data.videos[0];

      // Create a message with a button to watch the video
      const message = {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [
              {
                title: video.title.length > 80 ? video.title.substring(0, 77) + "..." : video.title,
                image_url: video.cover,
                subtitle: `👀 Views: ${video.play_count} | ❤️ Likes: ${video.digg_count}`,
                buttons: [
                  {
                    type: "postback",
                    title: "▶ Watch Video",
                    payload: `WATCH_TIKTOK_${video.video_id}`
                  }
                ]
              }
            ]
          }
        }
      };

      // Send the initial message with the button
      await sendMessage(senderId, message);

    } catch (error) {
      console.error("TikTok search error:", error);
      sendMessage(senderId, { text: "An error occurred while searching for TikTok videos." });
    }
  }
};

// Handle postback when the user clicks "Watch Video"
module.exports.handlePostback = async (senderId, payload) => {
  if (payload.startsWith("WATCH_TIKTOK_")) {
    const videoId = payload.replace("WATCH_TIKTOK_", "");
    const apiUrl = `https://markdevs-last-api-vtjp.onrender.com/api/tiksearch?search=${videoId}`;
    
    try {
      const response = await axios.get(apiUrl);
      const { data } = response.data;
      const video = data.videos.find(v => v.video_id === videoId);

      if (!video) {
        return sendMessage(senderId, { text: "Video not found." });
      }

      // Send the extracted video
      await sendMessage(senderId, {
        attachment: {
          type: "video",
          payload: {
            url: video.play
          }
        }
      });

    } catch (error) {
      console.error("Error fetching video:", error);
      sendMessage(senderId, { text: "An error occurred while fetching the video." });
    }
  }
};
