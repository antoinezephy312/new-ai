const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('./config.json', 'utf8');

module.exports = {
  name: 'weather',
  description: 'Get the current weather of a city',
  author: 'Clarence',
  usage:'weather [city]',

  async execute(senderId, args) {
    const pageAccessToken = token;
    const city = args.join(' ').trim();

    // Vérifier si une ville a été fournie
    if (!city) {
      await sendMessage(senderId, { text: 'Please enter the name of a city to get the weather forecast. Ex: Valencia City weather' }, pageAccessToken);
      return;
    }

    try {
      // Faire une requête à l'API de wttr.in
      const response = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=%C+%t+%h+%w&m`);

      const weatherData = response.data; // Ex: "Partly cloudy +27°C 64% Humidity ↙ 15 km/h"
      const formattedMessage = `🌤️ Weather in ${city} :\n\n${weatherData}`;

      // Envoyer la réponse à l'utilisateur
      await sendMessage(senderId, { text: formattedMessage }, pageAccessToken);

    } catch (error) {
      console.error('Error searching for weather:', error.message);
      await sendMessage(senderId, { text: 'Unable to retrieve weather forecast. Check the city name or try again later.' }, pageAccessToken);
    }
  }
};
