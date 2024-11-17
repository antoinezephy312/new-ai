const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'feedback',
  description: 'Send feedback to the bot admin',
  usage: 'feedback <your message>',
  author: 'Clarence',
  
  async execute(senderId, args, pageAccessToken) {
    // Check if there's a message provided
    if (!args || args.length === 0) {
      await sendMessage(senderId, { text: 'Enter your message first!\nUsage: feedback <your message>' }, pageAccessToken);
      return;
    }

    // Combine args to form the feedback message
    const feedbackMessage = args.join(' ');
    const adminId = '100029573642160';  // Replace this with your actual Facebook ID

    try {
      // Send the feedback message to the admin
      await sendMessage(adminId, {
        text: `Feedback from user ${senderId}:\n\n${feedbackMessage}`
      }, pageAccessToken);

      // Confirm feedback sent to the user
      await sendMessage(senderId, {
        text: 'Thanks for your feedback! Your feedback is really helpful to improve our service. Thank you and enjoy using!'
      }, pageAccessToken);
    } catch (error) {
      console.error('Error sending feedback:', error);
      // Respond to the user if there was an error
      await sendMessage(senderId, { text: 'Error: Could not send your feedback.' }, pageAccessToken);
    }
  }
};
