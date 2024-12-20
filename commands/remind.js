const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: "reminder",
  description: "Set a reminder for a specific time and text.",
  role: 1, // Adjust this if needed
  author: "French Mangigo",

  async execute(bot, args, authToken, event) {
    if (!event?.sender?.id) {
      console.error("Invalid event object: Missing sender ID.");
      sendMessage(bot, { text: "Error: Missing sender ID." }, authToken);
      return;
    }

    const senderId = event.sender.id;
    const timeArg = args[0]; // Extract the time argument
    const text = args.slice(1).join(" "); // Extract the reminder text

    // Validate time format (HH:mm AM/PM)
    const timeRegex = /^([0-1]?[0-9]):([0-5][0-9])(AM|PM)$/i;
    const match = timeRegex.exec(timeArg);
    if (!match || !text) {
      return sendMessage(bot, {
        text: `Usage: reminder [time in HH:mmAM/PM format] [reminder text]\nExample: reminder 10:00PM Hello it is time to eat!`
      }, authToken);
    }

    const [_, hour, minute, period] = match;
    const now = new Date();
    let reminderTime = new Date();

    // Convert 12-hour format to 24-hour format
    let hours24 = parseInt(hour, 10);
    if (period.toUpperCase() === "PM" && hours24 !== 12) hours24 += 12;
    if (period.toUpperCase() === "AM" && hours24 === 12) hours24 = 0;

    reminderTime.setHours(hours24, parseInt(minute, 10), 0, 0);

    // If the reminder time has already passed today, set it for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeDiff = reminderTime - now; // Time difference in milliseconds
    const display = reminderTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Notify the user that the reminder is set
    sendMessage(bot, {
      text: `✅ Reminder set! I'll remind you at ${display}.`
    }, authToken);

    // Wait for the specified time
    await new Promise(resolve => setTimeout(resolve, timeDiff));

    // Send the reminder
    sendMessage(bot, {
      text: `⏰ Reminder:\n${text}`
    }, authToken);
  }
};
