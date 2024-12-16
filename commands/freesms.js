const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const userLimits = {}; // Temporary storage for rate-limiting (use a database for production)

module.exports = {
  name: 'freesms',
  description: 'Send free SMS via LBC Express API',
  author: 'Clarence',
  role: 1, // Accessible to all users
  async execute(senderId, args, pageAccessToken) {
    if (args.length < 2) {
      sendMessage(senderId, { text: 'Usage: freesms <phone_number> <message>' }, pageAccessToken);
      return;
    }

    const [phoneNumber, ...messageParts] = args;
    const message = messageParts.join(' ');

    // Rate Limiting
    const now = Date.now();
    const limit = 5; // Max 5 messages per hour
    const windowMs = 3600000; // 1 hour in milliseconds

    if (!userLimits[senderId]) userLimits[senderId] = [];
    userLimits[senderId] = userLimits[senderId].filter((timestamp) => now - timestamp < windowMs);

    if (userLimits[senderId].length >= limit) {
      sendMessage(
        senderId,
        { text: '❌ Rate limit exceeded. You can send up to 5 SMS messages per hour.' },
        pageAccessToken
      );
      return;
    }

    userLimits[senderId].push(now);

    try {
      const apiUrl = `https://ccprojectapis.ddns.net/api/smsfree?number=${encodeURIComponent(phoneNumber)}&message=${encodeURIComponent(message)}`;
      const response = await axios.get(apiUrl);

      if (response.data.success) {
        const smsData = response.data.response.data;
        sendMessage(
          senderId,
          {
            text: `✅ SMS Sent Successfully!\n\n- **To**: ${smsData.to}\n- **Message**: ${message}\n- **Unit Cost**: ${smsData.unitCost} PHP\n- **Transaction Cost**: ${smsData.transactionCost} PHP\n- **Operator**: ${smsData.operatorCode}\n- **Message Parts**: ${smsData.messageParts}\n- **Remaining Messages**: ${smsData.remaining.toFixed(2)}\n- **From**: ${smsData.from}\n\n**Status**: ${response.data.message}`,
          },
          pageAccessToken
        );
      } else {
        sendMessage(senderId, { text: '❌ Failed to send SMS. Please check the phone number or try again later.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      sendMessage(senderId, { text: 'An error occurred while processing your request. Please try again later.' }, pageAccessToken);
    }
  },
};
