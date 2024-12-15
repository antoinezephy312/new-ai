const { sendMessage } = require('./sendMessage');

function handlePostback(event, pageAccessToken) {
  const senderId = event.sender.id;
  const payload = event.postback.payload;

  // Check if the postback payload is "GET_STARTED_PAYLOAD"
  if (payload === "GET_STARTED_PAYLOAD") {
    // Send a welcome message when the user clicks "Get Started"
    sendWelcomeMessage(senderId, pageAccessToken);
  }
}

const sendWelcomeMessage = (senderId, pageAccessToken) => {
  const message = {
    recipient: {
      id: senderId
    },
    message: {
      text: "Hello! I'm your friendly personal assistant. How can I help you today?"
    }
  };

  // Use the sendMessage function to send the message
  sendMessage(message, pageAccessToken);
};

module.exports = { handlePostback };
