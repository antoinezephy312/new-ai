const moment = require("moment-timezone");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { sendMessage } = require("../handles/sendMessage");

module.exports = {
  name: "reminder",
  description: "Set a reminder for a specific time and text with a voice message.",
  role: 1, // Adjust as needed
  author: "French Mangigo",

  async execute(bot, args, authToken, event) {
    if (!event?.sender?.id) {
      console.error("Invalid event object: Missing sender ID.");
      sendMessage(bot, { text: "Error: Missing sender ID." }, authToken);
      return;
    }

    const timeArg = args[0]; // Extract the time argument
    const meridiem = args[1]?.toLowerCase(); // Extract AM/PM
    const text = args.slice(2).join(" "); // Extract reminder text

    if (!timeArg || !meridiem || !text) {
      return sendMessage(bot, {
        text: `Usage: reminder [time in hh:mm format] [am/pm] [reminder text]\nExample: reminder 7:30 am Wake up!`
      }, authToken);
    }

    // Validate time format
    const timeParts = timeArg.split(":");
    if (timeParts.length !== 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) {
      return sendMessage(bot, {
        text: `Invalid time format. Use hh:mm format.\nExample: reminder 7:30 am Wake up!`
      }, authToken);
    }

    const hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);

    if (hour < 1 || hour > 12 || minute < 0 || minute > 59 || !["am", "pm"].includes(meridiem)) {
      return sendMessage(bot, {
        text: `Invalid time. Ensure the time is in hh:mm format and specify am/pm.\nExample: reminder 7:30 am Wake up!`
      }, authToken);
    }

    // Convert to 24-hour format and calculate delay
    const now = moment();
    const targetTime = moment.tz(`${hour}:${minute} ${meridiem}`, "hh:mm a", "Asia/Manila");

    if (targetTime.isBefore(now)) {
      targetTime.add(1, "day"); // Schedule for the next day if the time has already passed
    }

    const timeDiff = targetTime.diff(now);
    const display = targetTime.format("hh:mm A");

    // Notify the user that the reminder is set
    sendMessage(bot, {
      text: `✅ Reminder set for ${display}. I'll remind you then!`
    }, authToken);

    // Wait for the specified time and send the reminder
    setTimeout(async () => {
      try {
        // Prepare audio file using Google Translate TTS API
        const language = "tl"; // Filipino
        const fileName = `${event.sender.id}_reminder.mp3`;
        const filePath = path.resolve(__dirname, "cache", fileName);

        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${language}&client=tw-ob&idx=1`;

        // Download the audio file
        await downloadFile(ttsUrl, filePath);

        // Send the text reminder
        await sendMessage(bot, {
          text: `⏰ Reminder:\n${text}`
        }, authToken);

        // Send the voice reminder
        await sendMessage(bot, {
          attachment: fs.createReadStream(filePath)
        }, authToken);

        // Clean up the file after sending
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("Error sending reminder:", error);
        sendMessage(bot, {
          text: `⚠️ Failed to send the voice reminder. Please try again later.`
        }, authToken);
      }
    }, timeDiff);
  }
};

// Function to download a file
async function downloadFile(url, filePath) {
  const writer = fs.createWriteStream(filePath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream"
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}
