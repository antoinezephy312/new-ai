const { sendMessage } = require('../handles/sendMessage');
const moment = require("moment-timezone");

module.exports = {
  name: "reminder",
  description: "Set a reminder for a specific time (Philippine time) and text.",
  role: 1, // Adjust this if needed
  author: "French Mangigo",

  async execute(bot, args, authToken, event) {
    if (!event?.sender?.id) {
      console.error("Invalid event object: Missing sender ID.");
      sendMessage(bot, { text: "Error: Missing sender ID." }, authToken);
      return;
    }

    const senderId = event.sender.id;
    const timeInput = args[0]; // Example: "10:00PM"
    const text = args.slice(1).join(" "); // Extract reminder text

    if (!timeInput || !text) {
      return sendMessage(bot, {
        text: `Usage: reminder [time in HH:MM AM/PM] [reminder text]\nExample: reminder 10:00PM Time to eat!`
      }, authToken);
    }

    // Get the current time in Philippine Standard Time
    const currentTime = moment().tz("Asia/Manila");
    const reminderTime = moment.tz(timeInput, "hh:mmA", "Asia/Manila");

    if (!reminderTime.isValid()) {
      return sendMessage(bot, {
        text: "❌ Invalid time format. Please use HH:MM AM/PM (e.g., 10:00PM)."
      }, authToken);
    }

    // Check if the time is for the next day
    if (reminderTime.isBefore(currentTime)) {
      reminderTime.add(1, "day");
    }

    const timeDifference = reminderTime.diff(currentTime);

    // Notify the user that the reminder is set
    sendMessage(bot, {
      text: `✅ Reminder set for ${reminderTime.format("hh:mm A")} (Philippine Time). I'll remind you!`
    }, authToken);

    // Wait for the specified time
    await new Promise(resolve => setTimeout(resolve, timeDifference));

    // Send the reminder
    sendMessage(bot, {
      text: `⏰ Reminder:\n${text}`
    }, authToken);
  }
};
