const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'tempmail',
  description: 'Generate temporary email and check inbox',
  usage: '-tempmail gen OR -tempmail inbox <email>',
  author: 'coffee',

  async execute(senderId, args, pageAccessToken) {
    const [cmd, email] = args;

    if (cmd === 'gen') {
      try {
        const response = await axios.get('https://kaiz-apis.gleeze.com/api/tempmail-create');
        const { address, token } = response.data;

        if (address && token) {
          // Save the token alongside the email (implement storage as per your system's design).
          return sendMessage(
            senderId,
            { text: `📧 | Temporary Email: ${address}\n🔑 | Token: ${token}\n\nUse this token to check the inbox.` },
            pageAccessToken
          );
        } else {
          throw new Error('Invalid response from TempMail API.');
        }
      } catch (error) {
        return sendMessage(senderId, { text: 'Error: Unable to generate a temporary email.' }, pageAccessToken);
      }
    }

    if (cmd === 'inbox' && email) {
      try {
        // Assume `email` is the token received during email generation.
        const inboxResponse = await axios.get(`https://kaiz-apis.gleeze.com/api/tempmail-inbox?token=${email}`);
        const { emails } = inboxResponse.data;

        if (!emails || emails.length === 0) {
          return sendMessage(senderId, { text: 'Inbox is empty.' }, pageAccessToken);
        }

        const { to, from, subject, body } = emails[0]; // Display the latest email.
        return sendMessage(
          senderId,
          {
            text: `📬 | Latest Email:\nTo: ${to}\nFrom: ${from}\nSubject: ${subject}\n\nContent:\n${body}`,
          },
          pageAccessToken
        );
      } catch (error) {
        return sendMessage(senderId, { text: 'Error: Unable to fetch inbox or email content.' }, pageAccessToken);
      }
    }

    sendMessage(senderId, { text: 'Invalid usage. Use -tempmail gen or -tempmail inbox <token>' }, pageAccessToken);
  },
};
