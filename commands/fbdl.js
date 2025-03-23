module.exports = {
  name: 'fbdown',
  description: 'Download Facebook video',
  author: 'Kiro',
  role: 0,
  async execute(senderId, args, pageAccessToken) {
    if (args.length === 0) {
      return sendMessage(senderId, { text: 'Please provide a Facebook video URL.' }, pageAccessToken);
    }

    const videoUrl = encodeURIComponent(args[0]);
    const apiUrl = `https://kaiz-apis.gleeze.com/api/fbdl?url=${videoUrl}`;

    try {
      const response = await axios.get(apiUrl);
      const { title, thumbnail, videoUrl } = response.data;

      await sendMessage(senderId, {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [
              {
                title: title || "Facebook Video",
                image_url: thumbnail,
                buttons: [
                  {
                    type: "web_url",
                    url: videoUrl,
                    title: "Download Video"
                  }
                ]
              }
            ]
          }
        }
      }, pageAccessToken);
    } catch (error) {
      console.error('Error fetching video:', error);
      await sendMessage(senderId, { text: 'Failed to retrieve video. Please check the link and try again.' }, pageAccessToken);
    }
  }
};
