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

    const time = parseInt(args[0], 10); // Extract time in seconds
    const text = args.slice(1).join(" "); // Extract reminder text

    if (isNaN(time) || !text) {
      return sendMessage(bot, {
        text: `Usage: reminder [time in seconds] [reminder text]\nExample: reminder 60 Take a break!`
      }, authToken);
    }

    const display = time > 59 ? `${time / 60} minute(s)` : `${time} second(s)`;

    // Notify the user that the reminder is set
    sendMessage(bot, {
      text: `✅ Reminder set! I'll remind you in ${display}.`
    }, authToken);

    // Wait for the specified time
    await new Promise(resolve => setTimeout(resolve, time * 1000));

    // Send the reminder
    sendMessage(bot, {
      text: `⏰ Reminder:\n${text}`
    }, authToken);
  }
};
