const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'weather',
  description: 'Fetch current weather information for Valencia',
  author: 'Clarence',
  role: 1,

  async execute(senderId, args, pageAccessToken) {
    try {
      // Fetch weather data from wttr.in API
      const apiUrl = 'https://wttr.in/valencia?format=%C+%t+%h+%w&m';
      const response = await axios.get(apiUrl);

      // The response will be a plain text string like "Partly cloudy +15°C 63% ↑8km/h"
      const weatherData = response.data;

      if (weatherData) {
        // Split the weather data into individual components
        const [condition, temperature, humidity, wind] = weatherData.split(' ');

        // Construct the message to send
        let message = `🌦️ 𝗪𝗲𝗮𝘁𝗵𝗲𝗿 𝗶𝗻 𝗩𝗮𝗹𝗲𝗻𝗰𝗶𝗮:\n\n`;

        // Add the weather condition, temperature, humidity, and wind
        message += `🌤️ Condition: ${condition}\n`;
        message += `🌡️ Temperature: ${temperature}\n`;
        message += `💧 Humidity: ${humidity}\n`;
        message += `💨 Wind: ${wind}\n`;

        // Send the formatted message
        await sendMessage(senderId, { text: message }, pageAccessToken);
      } else {
        await sendMessage(senderId, { text: '⚠️ Sorry, could not fetch the weather data.' }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      await sendMessage(senderId, { text: '⚠️ Sorry, there was an error processing your request.' }, pageAccessToken);
    }
  }
};
