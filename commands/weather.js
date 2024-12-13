const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'weather',
  description: 'Fetch current weather information for a specified city',
  author: 'Clarence',
  role: 1,

  async execute(senderId, args, pageAccessToken) {
    const city = args.join(' ').trim();  // Get city from the user's input

    if (!city) {
      await sendMessage(senderId, { text: '⚠️ Please provide a city to check the weather for.' }, pageAccessToken);
      return;
    }

    try {
      // Dynamically create the URL using encodeURIComponent for the city name
      const apiUrl = `https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+%h+%w&m`;
      const response = await axios.get(apiUrl);

      // The response will be a plain text string like "Partly cloudy +15°C 63% ↑8km/h"
      const weatherData = response.data;

      if (weatherData) {
        // Split the weather data into individual components (condition, temperature, humidity, and wind)
        const parts = weatherData.split(' ');

        // Construct the message to send
        let message = `🌦️ 𝗪𝗲𝗮𝘁𝗵𝗲𝗿 𝗶𝗻 ${city}:\n\n`;

        // Check if the data was properly split and assign to variables
        if (parts.length >= 4) {
          const condition = parts[0];
          const temperature = parts[1];
          const humidity = parts[2];
          const wind = parts[3];

          // Add the weather condition, temperature, humidity, and wind details
          message += `🌤️ Condition: ${condition}\n`;
          message += `🌡️ Temperature: ${temperature}\n`;
          message += `💧 Humidity: ${humidity}\n`;
          message += `💨 Wind: ${wind}\n`;
        } else {
          message += '⚠️ Could not extract the weather details properly. Please try again later.';
        }

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
