const axios = require('axios');

module.exports = {
  name: 'feedback',
  description: 'Send feedback to the bot admin',
  usage: 'feedback <your message>',
  author: 'Clarence',
  
  async execute(senderId, args, pageAccessToken, sendMessage) {
    // Check if there's a message provided
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: 'Enter your message first!\nUsage: feedback <your message>' }, pageAccessToken);
      return;
    }

    // Combine args to form the feedback message
    const feedbackMessage = args.join(' ');

    try {
      // Admin Facebook Messenger thread URL
      const adminMessengerUrl = 'https://www.facebook.com/messages/t/100029573642160';

      // Send feedback to admin
      await axios.post(adminMessengerUrl, {
        message: `Feedback from user ${senderId}:\n\n${feedbackMessage}`
      });

      // Respond to the user if feedback was sent successfully
      await sendMessage(senderId, {
        text: 'Thanks for your feedback! Your feedbacks are really helpful to improve our service. Thank you and enjoy using!'
      }, pageAccessToken);
    } catch (error) {
      console.error('Error sending feedback:', error);
      // Respond to the user in case of an error
      await sendMessage(senderId, { text: 'Error: Could not send your feedback.' }, pageAccessToken);
    }
  }
};
