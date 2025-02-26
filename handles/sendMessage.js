const request = require('request');
const axios = require('axios');

async function typingIndicator(senderId, pageAccessToken) {
  try {
    await axios.post(
      'https://graph.facebook.com/v13.0/me/messages',
      {
        recipient: { id: senderId },
        sender_action: 'typing_on',
      },
      {
        params: { access_token: pageAccessToken },
      }
    );
  } catch (error) {
    console.error('Error sending typing indicator:', error.message);
  }
}

async function sendMessage(senderId, message, pageAccessToken) {
  if (!message || (!message.text && !message.attachment)) {
    console.error("Message must contain 'text' or 'attachment'.");
    return;
  }

  await typingIndicator(senderId, pageAccessToken); // Ensure typing indicator is completed before sending message

  const requestData = {
    recipient: { id: senderId },
    message,
  };

  request.post(
    {
      url: 'https://graph.facebook.com/v13.0/me/messages',
      qs: { access_token: pageAccessToken },
      json: requestData,
    },
    (error, response, body) => {
      if (error) {
        console.error('Error sending message:', error);
      } else {
        console.log('Message sent successfully:', body);
      }
    }
  );
}

module.exports = { sendMessage };
