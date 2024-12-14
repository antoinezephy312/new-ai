const axios = require('axios'); // Ensure axios is installed in your project
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
    name: 'weather',
    description: 'Get current weather information for a specific location.',
    usage: '!weather <location>',
    execute: async (bot, args, authToken, event) => {
        if (!args.length) {
            return sendMessage(bot, { text: 'Please provide a location. Example: !weather Valencia' }, authToken);
        }

        const location = args.join(' ');
        const apiUrl = `https://kaiz-apis.gleeze.com/api/weather?q=${encodeURIComponent(location)}`;

        try {
            const response = await axios.get(apiUrl);

            if (!response.data || !response.data["0"]) {
                return sendMessage(bot, { text: `No weather data found for "${location}".` }, authToken);
            }

            const weatherData = response.data["0"];
            const locationInfo = weatherData.location || {};
            const currentWeather = weatherData.current || {};

            // Construct weather message
            const weatherMessage = `🌍 **Weather for ${locationInfo.name || "Unknown"}**
📅 Date: ${currentWeather.date || "N/A"}
⏰ Observation Time: ${currentWeather.observationtime || "N/A"}
🌡️ Temperature: ${currentWeather.temperature || "N/A"}°${locationInfo.degreetype || ""}
🌤️ Condition: ${currentWeather.skytext || "N/A"}
💧 Humidity: ${currentWeather.humidity || "N/A"}%
🌬️ Wind: ${currentWeather.winddisplay || "N/A"}
🌡️ Feels Like: ${currentWeather.feelslike || "N/A"}°${locationInfo.degreetype || ""}
![Weather Icon](${currentWeather.imageUrl || "No image available"})`;

            sendMessage(bot, { text: weatherMessage }, authToken);

        } catch (error) {
            console.error('Error fetching weather data:', error);
            sendMessage(bot, { text: 'An error occurred while fetching the weather information. Please try again later.' }, authToken);
        }
    }
};
