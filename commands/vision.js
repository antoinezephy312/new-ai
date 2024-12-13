const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "ai",
  description: "Gpt4o x Gemini AI",
  author: "Clarence",

  async execute(senderId, args, pageAccessToken, event, imageUrl) {
    const userPrompt = args.join(" ").trim().toLowerCase();

    if (!userPrompt && !imageUrl) {
      return sendMessage(
        senderId,
        { 
          text: `❌ 𝗣𝗹𝗲𝗮𝘀𝗲 𝗽𝗿𝗼𝘃𝗶𝗱𝗲 𝗮 𝗾𝘂𝗲𝘀𝗧𝗶𝗼𝗻 𝗳𝗼𝗿 𝗚𝗲𝗺𝗶𝗻𝗶 𝗔𝗱𝘃𝗮𝗻𝗰𝗲𝗱 𝗼𝗿 𝗮𝗻 𝗶𝗺𝗮𝗴𝗲 𝘄𝗶𝘁𝗵 𝗮 𝗱𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻 𝗳𝗼𝗿 𝗙𝗹𝗮𝘀𝗵 𝗩𝗶𝘀𝗶𝗼𝗻.` 
        }, 
        pageAccessToken
      );
    }

    try {
      if (!imageUrl) {
        if (event.message?.reply_to?.mid) {
          imageUrl = await getRepliedImage(event.message.reply_to.mid, pageAccessToken);
        } else if (event.message?.attachments?.[0]?.type === 'image') {
          imageUrl = event.message.attachments[0].payload.url;
        }
      }

      const textApiUrl = "https://rest-api-french2.onrender.com/api/clarencev2";
      const imageRecognitionUrl = "https://api.joshweb.click/gemini";

      const useImageRecognition =
        imageUrl || 
        ["recognize", "analyze", "analyst", "answer", "analysis"].some(term => userPrompt.includes(term)); 

      let responseMessage;

      if (useImageRecognition) {
        const imageApiResponse = await axios.get(imageRecognitionUrl, {
          params: { prompt: userPrompt, url: imageUrl || "" }
        });
        const imageRecognitionResponse = imageApiResponse.data.gemini || "❌ No response from Gemini Flash Vision.";
        responseMessage = `${imageRecognitionResponse}`;
      } else {
        // Fetch from Gemini Advanced (text)
        const textApiResponse = await axios.get(textApiUrl, { params: { prompt: userPrompt, uid: senderId } });
        const textResponse = textApiResponse.data.response || "❌ No response from ClarenceAi.";
        responseMessage = `${textResponse}`;
      }

      const responseTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila', hour12: true });

      // Final formatted response
      const finalResponse = `${responseMessage}`;

      await sendConcatenatedMessage(senderId, finalResponse, pageAccessToken);

    } catch (error) {
      console.error("❌ Error in Gemini command:", error);
      sendMessage(
        senderId,
        { text: `❌ Error: ${error.message || "Something went wrong."}` },
        pageAccessToken
      );
    }
  }
};

async function getRepliedImage(mid, pageAccessToken) {
  const { data } = await axios.get(`https://graph.facebook.com/v21.0/${mid}/attachments`, {
    params: { access_token: pageAccessToken }
  });

  if (data?.data?.[0]?.image_data?.url) {
    return data.data[0].image_data.url;
  }
  return "";
}

async function sendConcatenatedMessage(senderId, text, pageAccessToken) {
  const maxMessageLength = 2000;

  if (text.length > maxMessageLength) {
    const messages = splitMessageIntoChunks(text, maxMessageLength);

    for (const message of messages) {
      await new Promise(resolve => setTimeout(resolve, 500));
      await sendMessage(senderId, { text: message }, pageAccessToken);
    }
  } else {
    await sendMessage(senderId, { text }, pageAccessToken);
  }
}

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}
