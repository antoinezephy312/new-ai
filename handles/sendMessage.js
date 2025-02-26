const request = require('request');
const axios = require('axios');

async function typingIndicator(senderId, pageAccessToken) {
  try {
    await axios.post(`https://graph.facebook.com/v13.0/me/messages`, {
      recipient: { id: senderId },
      sender_action: 'typing_on',
    }, {
      params: { access_token: pageAccessToken },
    });
  } catch (error) {
    console.error('Error sending typing indicator:', error.message);
  }
}

function sendMessage(senderId, message, pageAccessToken) {
  if (!message || (!message.text && !message.attachment)) {
    console.error("Error: Message must contain 'text' or 'attachment'.", message);
    return;
  }

  console.log("Sending message:", message);
  typingIndicator(senderId, pageAccessToken);

  const requestData = {
    recipient: { id: senderId },
    message,
  };

  request.post(
    {
      url: `https://graph.facebook.com/v13.0/me/messages`,
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
