const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "test",
  description: "Search for TikTok videos",
  role: 1,
  author: "Jay Mar",

  async execute(senderId, args, pageAccessToken, event) {
    try {
      // Handle postback when "Watch Video" is clicked
      if (event && event.postback) {
        try {
          const payload = JSON.parse(event.postback.payload);
          if (payload.action === "send_video") {
            return sendMessage(senderId, {
              attachment: {
                type: 'video',
                payload: {
                  url: payload.video_url,
                  is_reusable: true
                }
              }
            }, pageAccessToken);
          }
        } catch (error) {
          console.error("Invalid postback payload:", error);
          return sendMessage(senderId, { text: "Invalid postback data." }, pageAccessToken);
        }
      }

      // Continue normal TikTok search if no postback
      const searchQuery = args.join(" ");
      if (!searchQuery) {
        return sendMessage(senderId, { text: "Usage: tiksearch <search text>" }, pageAccessToken);
      }

      const response = await axios.get(`https://markdevs-last-api-vtjp.onrender.com/api/tiksearch?search=${encodeURIComponent(searchQuery)}`);
      const videos = response.data.data.videos;

      if (!videos || videos.length === 0) {
        return sendMessage(senderId, { text: "No videos found for the given search query." }, pageAccessToken);
      }

      const videoData = videos[0];
      const videoUrl = videoData.play;

      const message = {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [
              {
                title: `Tiksearch Result: ${videoData.title}`,
                subtitle: `Post by: ${videoData.author.nickname} (@${videoData.author.unique_id})`,
                image_url: videoData.cover,
                buttons: [
                  {
                    type: "postback",
                    title: "Watch Video",
                    payload: JSON.stringify({
                      action: "send_video",
                      video_url: videoUrl,
                    }),
                  },
                ],
              },
            ],
          },
        },
      };

      sendMessage(senderId, message, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      sendMessage(senderId, { text: "An error occurred while processing the request." }, pageAccessToken);
    }
  },
};
