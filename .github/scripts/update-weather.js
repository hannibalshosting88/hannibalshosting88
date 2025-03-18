const axios = require('axios');
const fs = require('fs');
const path = require('path');

// File path for README
const readmePath = path.join(process.cwd(), 'README.md');

async function getWeather() {
  try {
    // Using OpenWeatherMap API
    const apiKey = process.env.WEATHER_API_KEY;
    const city = 'Charlotte';
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`
    );
    
    const data = response.data;
    
    // Format date and time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric'
    });
    
    // Get weather emoji based on condition
    const weatherCondition = data.weather[0].main;
    let conditionEmoji = '☁️';
    
    // Map weather conditions to appropriate emojis
    const weatherEmojis = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Haze': '🌫️',
      'Smoke': '🌫️',
      'Dust': '🌫️',
      'Sand': '🌫️',
      'Ash': '🌫️',
      'Squall': '💨',
      'Tornado': '🌪️'
    };
    
    if (weatherEmojis[weatherCondition]) {
      conditionEmoji = weatherEmojis[weatherCondition];
    }
    
    // Create weather string
    const weatherString = `🌡️ Temperature: ${Math.round(data.main.temp)}°F 💨 Wind: ${Math.round(data.wind.speed)} mph ${conditionEmoji} Conditions: ${data.weather[0].description} 🌅 Updated: ${formattedDate} at ${formattedTime}`;
    
    return weatherString;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return '⚠️ Weather data temporarily unavailable';
  }
}

async function updateReadme() {
  try {
    // Read the current README
    const readme = fs.readFileSync(readmePath, 'utf8');
    
    // Get weather data
    const weatherData = await getWeather();
    
    // Replace the weather section
    const updatedReadme = readme.replace(
      /<!-- WEATHER:START -->.*<!-- WEATHER:END -->/s,
      `<!-- WEATHER:START --> ${weatherData} <!-- WEATHER:END -->`
    );
    
    // Write the updated README
    fs.writeFileSync(readmePath, updatedReadme);
    
    console.log('README updated with latest weather information!');
  } catch (error) {
    console.error('Error updating README:', error);
  }
}

// Run the update function
updateReadme();
