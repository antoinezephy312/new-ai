const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "ai",
  description: "Gpt4o x Gemini AI",
  role: 1,
  author: "Kiana",

  async execute(bot, args, authToken, event) {
    if (!event?.sender?.id) {
      console.error('Invalid event object: Missing sender ID.');
      sendMessage(bot, { text: 'Error: Missing sender ID.' }, authToken);
      return;
    }

    const senderId = event.sender.id;
    const userPrompt = args.join(" ");
    const repliedMessage = event.message.reply_to?.message || "";
    const finalPrompt = repliedMessage ? `${repliedMessage} ${userPrompt}`.trim() : userPrompt;

    if (!finalPrompt) {
      return sendMessage(bot, { text: "Please enter your question or reply with an image to analyze." }, authToken);
    }

    try {
      const imageUrl = await extractImageUrl(event, authToken);

      if (imageUrl) {
        const apiUrl = `https://kaiz-apis.gleeze.com/api/gemini-vision`;
        const response = await handleImageRecognition(apiUrl, finalPrompt, imageUrl, senderId);
        const result = response.response;

        const visionResponse = `🌌 𝐆𝐞𝐦𝐢𝐧𝐢 𝐀𝐧𝐚𝐥𝐲𝐬𝐢𝐬\n━━━━━━━━━━━━━━━━━━\n${result}`;
        sendLongMessage(bot, visionResponse, authToken);
      } else {
        const apiUrl = `https://kaiz-apis.gleeze.com/api/gpt-4o`;
const response = await axios.get(apiUrl, {
  params: {
    ask: finalPrompt,
    uid: senderId,
    webSearch: "off",
    apikey: "8499a47e-19b0-40a2-84c9-a3f1ec2d929d"
  }
});
const gptMessage = response.data.response;


        sendLongMessage(bot, gptMessage, authToken);
      }
    } catch (error) {
      console.error("Error in AI command:", error);
      sendMessage(bot, { text: `Error: ${error.message || "Something went wrong."}` }, authToken);
    }
  }
};

async function handleImageRecognition(apiUrl, prompt, imageUrl, senderId) {
  try {
    const { data } = await axios.get(apiUrl, {
      params: {
        q: prompt,
        uid: senderId,
        imageUrl: imageUrl || "",
        apikey: "8499a47e-19b0-40a2-84c9-a3f1ec2d929d"
      }
    });
    return data;
  } catch (error) {
    throw new Error("Failed to connect to the Gemini Vision API.");
  }
}


async function extractImageUrl(event, authToken) {
  try {
    if (event.message?.reply_to?.mid) {
      return await getRepliedImage(event.message.reply_to.mid, authToken);
    } else if (event.message?.attachments?.[0]?.type === 'image') {
      return event.message.attachments[0].payload.url;
    }
  } catch (error) {
    console.error("Failed to extract image URL:", error);
  }
  return "";
}

async function getRepliedImage(mid, authToken) {
  try {
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: authToken }
    });
    return data?.data[0]?.image_data?.url || "";
  } catch (error) {
    throw new Error("Failed to retrieve replied image.");
  }
}

function sendLongMessage(bot, text, authToken) {
  const maxMessageLength = 2000;
  const delayBetweenMessages = 1000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    sendMessage(bot, { text: messages[0] }, authToken);

    messages.slice(1).forEach((message, index) => {
      setTimeout(() => sendMessage(bot, { text: message }, authToken), (index + 1) * delayBetweenMessages);
    });
  } else {
    sendMessage(bot, { text }, authToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}
