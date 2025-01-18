const axios = require("axios");
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "belat",
  description: "Gpt4o x Gemini AI",
  role: 1,
  author: "Kiana",

  async execute(bot, args, authToken, event, imageUrl = "") {
    if (!event?.sender?.id) {
      console.error('غير صالح: معرف المرسل غير موجود.');
      sendMessage(bot, { text: 'خطأ: معرف المرسل غير موجود.' }, authToken);
      return;
    }

    const senderId = event.sender.id;
    const userPrompt = args.join(" ");
    const repliedMessage = event.message?.reply_to?.message || "";
    const finalPrompt = repliedMessage ? `${repliedMessage} ${userPrompt}`.trim() : userPrompt;

    try {
      if (imageUrl) {
        const apiUrl = "https://kaiz-apis.gleeze.com/api/gemini-vision";
        const response = await handleImageRecognition(apiUrl, finalPrompt || "تحليل الصورة", imageUrl, senderId);
        const result = response.response;
        const visionResponse = `🌌 𝐆𝐞𝐦𝐢𝐧𝐢 \n━━━━━━━━━━━━━━\n${result}`;
        sendLongMessage(bot, visionResponse, authToken);
        return;
      }

      if (finalPrompt) {
        const response = await chatWithNewAPI(finalPrompt);
        const gptResponse = `${response}`;
        sendLongMessage(bot, gptResponse, authToken);
      } else {
        sendMessage(bot, { text: "يرجى إدخال نص أو إرسال صورة لتحليلها." }, authToken);
      }
    } catch (error) {
      console.error("حدث خطأ أثناء تنفيذ الأمر:", error);
      sendMessage(bot, { text: `خطأ: ${error.message || "حدث خطأ غير متوقع."}` }, authToken);
    }
  }
};

async function chatWithNewAPI(prompt) {
  const apikeys = require("../DB/apikey.json");
  const token = apikeys[Math.floor(Math.random() * apikeys.length)];
  const key = token.token[Math.floor(Math.random() * token.token.length)];

  const options = {
    method: "POST",
    url: "https://chatgpt-api8.p.rapidapi.com/",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": "chatgpt-api8.p.rapidapi.com",
    },
    data: { messages: [{ role: "user", content: prompt }] },
  };

  try {
    const response = await axios.request(options);
    return response.data.text;
  } catch (error) {
    throw new Error("فشل الاتصال بواجهة النصوص API.");
  }
}

async function handleImageRecognition(apiUrl, prompt, imageUrl, senderId) {
  try {
    const { data } = await axios.get(apiUrl, {
      params: {
        q: prompt,
        uid: senderId,
        imageUrl: imageUrl || "",
      },
    });
    return data;
  } catch (error) {
    throw new Error("فشل الاتصال بواجهة Gemini Vision API.");
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
  const regex = new RegExp(`.{1,${chunkSize}}`, "g");
  return message.match(regex);
}
