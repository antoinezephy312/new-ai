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

    const timeArg = args[0]; // Extract the time argument
    const text = args.slice(1).join(" "); // Extract reminder text

    if (!timeArg || !text) {
      return sendMessage(bot, {
        text: `Usage: reminder [time in minutes or minutes:seconds] [reminder text]\nExample: reminder 1 Take a break!\nExample: reminder 1:30 Take a break!`
      }, authToken);
    }

    let timeInSeconds;

    // Check if the time argument contains a colon (e.g., "1:30")
    if (timeArg.includes(":")) {
      const [minutes, seconds] = timeArg.split(":").map(Number);
      if (isNaN(minutes) || isNaN(seconds)) {
        return sendMessage(bot, {
          text: `Invalid time format. Use minutes or minutes:seconds.\nExample: reminder 1 Take a break!\nExample: reminder 1:30 Take a break!`
        }, authToken);
      }
      timeInSeconds = minutes * 60 + seconds;
    } else {
      // Assume the input is in minutes
      const minutes = parseInt(timeArg, 10);
      if (isNaN(minutes)) {
        return sendMessage(bot, {
          text: `Invalid time format. Use minutes or minutes:seconds.\nExample: reminder 1 Take a break!\nExample: reminder 1:30 Take a break!`
        }, authToken);
      }
      timeInSeconds = minutes * 60;
    }

    const display = timeInSeconds >= 60
      ? `${Math.floor(timeInSeconds / 60)} minute(s) and ${timeInSeconds % 60} second(s)`
      : `${timeInSeconds} second(s)`;

    // Notify the user that the reminder is set
    sendMessage(bot, {
      text: `✅ Reminder set! I'll remind you in ${display}.`
    }, authToken);

    // Wait for the specified time
    await new Promise(resolve => setTimeout(resolve, timeInSeconds * 1000));

    // Send the reminder
    sendMessage(bot, {
      text: `⏰ Reminder:\n${text}`
    }, authToken);
  }
};
