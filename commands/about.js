const { sendMessage } = require('../handles/sendMessage'); // Ensure the path is correct

module.exports = {
  name: 'about',
  description: 'Who is ClarenceAi?',
  author: 'Clarence',
  role: 1,
  async execute(senderId, args, pageAccessToken) {
    try {
      // Send image first
      await sendMessage(senderId, {
        attachment: {
          type: "image",
          payload: {
            url: "https://scontent.fcgy3-1.fna.fbcdn.net/v/t39.30808-6/469194415_122129744432380107_208418222617849837_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGoxoss3cvA7VuRrG-_Xvl4HUe_XYfh8EMdR79dh-HwQwYcvqHRlGdDwtDNFQRDOpEg4txz3m9piP8WoHONWE44&_nc_ohc=NlsVjpOElHsQ7kNvgH0aSVA&_nc_zt=23&_nc_ht=scontent.fcgy3-1.fna&_nc_gid=AteagW_0vJe1pmFXUbfeK0g&oh=00_AYD8U7M8_UTDZ06by1XqDb33-gqRd7XnJH6KK35omgBAcw&oe=6764CF16",
            is_reusable: true
          }
        }
      }, pageAccessToken);

      // Wait for 2 seconds before sending the buttons
      setTimeout(async () => {
        await sendMessage(senderId, {
          attachment: {
            type: "template",
            payload: {
              template_type: "button",
              text: `🤖 𝗔𝗯𝗼𝘂𝘁 𝗖𝗹𝗮𝗿𝗲𝗻𝗰𝗲:
Clarence is your friendly, helpful personal assistant.

💭 𝗪𝗵𝘆 𝗜 𝗻𝗮𝗺𝗲𝗱 𝘁𝗵𝗲 𝗯𝗼𝘁 𝗖𝗹𝗮𝗿𝗲𝗻𝗰𝗲𝗔𝗜: This bot is dedicated to the admin itself 😺

❓ 𝗖𝗼𝗻𝘁𝗮𝗰𝘁 𝘁𝗵𝗲 𝗮𝗱𝗺𝗶𝗻𝘀 if you experience/encounter any issues with the bot, and I will try to fix them. Thank you for using me as your personal assistant!`,
              buttons: [
                {
                  type: "web_url",
                  url: "https://www.facebook.com/profile.php?id=61561403233164",
                  title: "Like/Follow our Page"
                },
                {
                  type: "web_url",
                  url: "https://www.facebook.com/frenchclarence.mangigo.9/",
                  title: "Contact Admin 1"
                },
                {
                  type: "web_url",
                  url: "https://www.facebook.com/Aiko.Yamamoto333",
                  title: "Contact Admin 2"
                }
              ]
            }
          }
        }, pageAccessToken);
      }, 2 * 1000); // Delay for 2 seconds

    } catch (error) {
      console.error('Error executing about command:', error);
      await sendMessage(senderId, { text: 'Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
