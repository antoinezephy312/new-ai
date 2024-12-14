const axios = require('axios'); // Ensure axios is installed in your project
const { sendMessage } = require('../handles/sendMessage');
module.exports = {
    name: 'weather',
    description: 'Get current weather information for a specific location.',
    usage: '!weather <location>',
    execute: async (message, args) => {
        if (!args.length) {
            return message.reply('Please provide a location. Example: !weather Valencia');
        }

        const location = args.join(' ');
        const apiUrl = `https://kaiz-apis.gleeze.com/api/weather?q=${encodeURIComponent(location)}`;

        try {
            const response = await axios.get(apiUrl);

            if (!response.data || !response.data["0"]) {
                return message.reply(`No weather data found for "${location}".`);
            }

            const weatherData = response.data["0"];
            const locationInfo = weatherData.location;
            const currentWeather = weatherData.current;

            // Construct weather message
            const weatherMessage = `🌍 **Weather for ${locationInfo.name}**
` +
                `📅 Date: ${currentWeather.date}
` +
                `⏰ Observation Time: ${currentWeather.observationtime}
` +
                `🌡️ Temperature: ${currentWeather.temperature}°${locationInfo.degreetype}
` +
                `🌤️ Condition: ${currentWeather.skytext}
` +
                `💧 Humidity: ${currentWeather.humidity}%
` +
                `🌬️ Wind: ${currentWeather.winddisplay}
` +
                `🌡️ Feels Like: ${currentWeather.feelslike}°${locationInfo.degreetype}
` +
                `![Weather Icon](${currentWeather.imageUrl})`;

            message.channel.send(weatherMessage);

        } catch (error) {
            console.error('Error fetching weather data:', error);
            message.reply('An error occurred while fetching the weather information. Please try again later.');
        }
    }
};
