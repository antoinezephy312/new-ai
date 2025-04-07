const axios = require("axios");

module.exports = {
  config: {
    name: "sms",
    version: "1.0",
    author: "Kaizenji",
    role: 0,
    shortDescription: {
      en: "Send SMS via API"
    },
    category: "utility",
    guide: {
      en: "sms [number] [count] [interval]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const messageID = event.messageID;

    if (args.length < 3) {
      return api.sendMessage("❌ | Usage: sms [number] [count] [interval]", threadID, messageID);
    }

    const [number, count, interval] = args;
    const apiUrl = `https://kaizenji-rest-api.kyrinwu.repl.co/api/sms?number=${number}&count=${count}&interval=${interval}`;

    try {
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (!data.success) {
        return api.sendMessage("❌ | API failed to send messages.", threadID, messageID);
      }

      // Generate a short summary of first few results
      const summary = data.result
        .slice(0, 10) // first 10 results only
        .map(r => `• Message ${r.messageNumber}: ${r.result}`)
        .join("\n");

      const remaining = data.result.length - 10;
      const extraNotice = remaining > 0 ? `\n...and ${remaining} more.` : "";

      const message = `✅ SMS Sent by ${data.author}\n📱 Target: ${data.target_number}\n🧾 Count: ${data.count}\n⏱️ Interval: ${data.interval}s\n\n📩 Results:\n${summary}${extraNotice}`;

      return api.sendMessage(message, threadID, messageID);
    } catch (error) {
      console.error(error);
      return api.sendMessage("⚠️ | An error occurred while sending the SMS.", threadID, messageID);
    }
  }
};
