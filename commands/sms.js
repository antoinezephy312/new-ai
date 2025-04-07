const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'sms',
  description: 'SMS spam',
  author: 'Clarence',
  role: 1,
  async execute(senderId, args, pageAccessToken) {
    if (args.length < 3) {
      sendMessage(senderId, { text: 'Usage: sms <phone> <count> <interval>' }, pageAccessToken);
      return;
    }

    const [phone, count, interval] = args;

    if (isNaN(count) || isNaN(interval)) {
      sendMessage(senderId, { text: 'Count and interval must be numbers.' }, pageAccessToken);
      return;
    }

    try {
      const apiUrl = `https://kaiz-apis.gleeze.com/api/spamsms?phone=${encodeURIComponent(phone)}&count=${count}&interval=${interval}`;
      const response = await axios.get(apiUrl);

      if (response.data.success) {
        const header = `✅ SMS spam initiated!\n\n📱 Target Number: ${response.data.target_number}\n🔁 Count: ${response.data.count}\n⏱ Interval: ${response.data.interval} sec(s)\n\n📨 Results:\n`;
        const results = response.data.result.map((item, i) => `Message #${i + 1}: ${item.result}`);
        const allText = header + results.join('\n');

        // Split message if it exceeds 2000 characters
        const chunks = splitTextIntoChunks(allText, 1900); // safe margin

        for (const chunk of chunks) {
          await sendMessage(senderId, { text: chunk }, pageAccessToken);
        }

      } else {
        sendMessage(senderId, { text: '❌ Failed to initiate SMS spam. Please try again.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error initiating SMS spam:', error);
      sendMessage(senderId, { text: '⚠️ An error occurred while processing your request.' }, pageAccessToken);
    }
  },
};

// Helper function to split long text
function splitTextIntoChunks(text, maxLength) {
  const chunks = [];
  let current = '';

  for (const line of text.split('\n')) {
    if ((current + line + '\n').length > maxLength) {
      chunks.push(current);
      current = '';
    }
    current += line + '\n';
  }

  if (current) chunks.push(current);
  return chunks;
}
