const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "ai",
  description: "Gemini AI",
  role: 1,
  author: "Kiana",

  async execute(chilli, pogi, kalamansi, event) {
    console.log("Received event object:", JSON.stringify(event, null, 2));

    // Check if event and its properties are valid
    if (!event || !event.message) {
      console.error("Invalid event object received:", JSON.stringify(event, null, 2));
      return sendMessage(chilli, { text: "Error: Invalid event data received." }, kalamansi);
    }

    const kalamansiPrompt = pogi.join(" ");

    if (!kalamansiPrompt && !event.message.reply_to?.mid) {
      return sendMessage(chilli, { text: "Please enter your question or reply with an image to analyze." }, kalamansi);
    }

    try {
      const imageUrl = await extractImageUrl(event, kalamansi);
      const senderId = event?.sender?.id || "unknown_user";

      if (senderId === "unknown_user") {
        console.error("Sender ID is undefined. Event object:", JSON.stringify(event, null, 2));
        return sendMessage(chilli, { text: "Unable to identify the sender. Please try again." }, kalamansi);
      }

      if (imageUrl) {
        // If an image is detected, use Gemini Vision API
        const apiUrl = `https://kaiz-apis.gleeze.com/api/gemini-vision`;
        const response = await handleImageRecognition(apiUrl, kalamansiPrompt, imageUrl, senderId);
        const result = response.response;

        const visionResponse = `🌌 𝐆𝐞𝐦𝐢𝐧𝐢 𝐀𝐧𝐚𝐥𝐲𝐬𝐢𝐬\n━━━━━━━━━━━━━━━━━━\n${result}`;
        sendLongMessage(chilli, visionResponse, kalamansi);
      } else {
        // If no image, use GPT API
        const apiUrl = `https://clarence-rest-apiv2.onrender.com/api/gpt4o1`;
        const response = await axios.get(apiUrl, {
          params: {
            prompt: kalamansiPrompt,
            uid: senderId
          }
        });
        const gptMessage = response.data.message;

        const gptResponse = `${gptMessage}`;
        sendLongMessage(chilli, gptResponse, kalamansi);
      }
    } catch (error) {
      console.error("Error in Gemini command:", error);
      sendMessage(chilli, { text: `Error: ${error.message || "Something went wrong."}` }, kalamansi);
    }
  }
};

async function handleImageRecognition(apiUrl, prompt, imageUrl, senderId) {
  try {
    const { data } = await axios.get(apiUrl, {
      params: {
        q: prompt,
        uid: senderId,
        imageUrl: imageUrl || ""
      }
    });
    return data;
  } catch (error) {
    throw new Error("Failed to connect to the Gemini Vision API.");
  }
}

async function extractImageUrl(event, kalamansi) {
  try {
    if (event?.message?.reply_to?.mid) {
      return await getRepliedImage(event.message.reply_to.mid, kalamansi);
    } else if (event?.message?.attachments?.[0]?.type === 'image') {
      return event.message.attachments[0].payload.url;
    }
  } catch (error) {
    console.error("Failed to extract image URL:", error);
  }
  return ""; // Default to empty string if no image is found
}

async function getRepliedImage(mid, kalamansi) {
  try {
    const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
      params: { access_token: kalamansi }
    });
    return data?.data[0]?.image_data?.url || "";
  } catch (error) {
    throw new Error("Failed to retrieve replied image.");
  }
}

function sendLongMessage(chilli, text, kalamansi) {
  const maxMessageLength = 2000;
  const delayBetweenMessages = 1000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);
    sendMessage(chilli, { text: messages[0] }, kalamansi);

    messages.slice(1).forEach((message, index) => {
      setTimeout(() => sendMessage(chilli, { text: message }, kalamansi), (index + 1) * delayBetweenMessages);
    });
  } else {
    sendMessage(chilli, { text }, kalamansi);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const regex = new RegExp(`.{1,${chunkSize}}`, 'g');
  return message.match(regex);
}
