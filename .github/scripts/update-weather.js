const axios = require('axios');
const fs = require('fs');
const path = require('path');

// File path for README
const readmePath = path.join(process.cwd(), 'README.md');

async function getWeather() {
  try {
    // Charlotte, NC coordinates
    const lat = 35.2271;
    const lon = -80.8431;
    
    console.log('Fetching weather data from Open-Meteo...');
    
    // Using Open-Meteo API (no API key required)
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
    );
    
    const current = response.data.current;
    
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
    
    // Map WMO weather codes to conditions and emojis
    // Based on https://open-meteo.com/en/docs (WMO Weather interpretation codes)
    const weatherConditions = {
      0: { description: 'Clear sky', emoji: '☀️' },
      1: { description: 'Mainly clear', emoji: '🌤️' },
      2: { description: 'Partly cloudy', emoji: '⛅' },
      3: { description: 'Overcast', emoji: '☁️' },
      45: { description: 'Fog', emoji: '🌫️' },
      48: { description: 'Depositing rime fog', emoji: '🌫️' },
      51: { description: 'Light drizzle', emoji: '🌦️' },
      53: { description: 'Moderate drizzle', emoji: '🌦️' },
      55: { description: 'Dense drizzle', emoji: '🌧️' },
      56: { description: 'Light freezing drizzle', emoji: '🌨️' },
      57: { description: 'Dense freezing drizzle', emoji: '🌨️' },
      61: { description: 'Slight rain', emoji: '🌦️' },
      63: { description: 'Moderate rain', emoji: '🌧️' },
      65: { description: 'Heavy rain', emoji: '🌧️' },
      66: { description: 'Light freezing rain', emoji: '🌨️' },
      67: { description: 'Heavy freezing rain', emoji: '🌨️' },
      71: { description: 'Slight snow fall', emoji: '❄️' },
      73: { description: 'Moderate snow fall', emoji: '❄️' },
      75: { description: 'Heavy snow fall', emoji: '❄️' },
      77: { description: 'Snow grains', emoji: '❄️' },
      80: { description: 'Slight rain showers', emoji: '🌦️' },
      81: { description: 'Moderate rain showers', emoji: '🌧️' },
      82: { description: 'Violent rain showers', emoji: '🌧️' },
      85: { description: 'Slight snow showers', emoji: '🌨️' },
      86: { description: 'Heavy snow showers', emoji: '🌨️' },
      95: { description: 'Thunderstorm', emoji: '⛈️' },
      96: { description: 'Thunderstorm with slight hail', emoji: '⛈️' },
      99: { description: 'Thunderstorm with heavy hail', emoji: '⛈️' }
    };
    
    // Get weather description and emoji from the code
    const weatherCode = current.weather_code;
    const weather = weatherConditions[weatherCode] || { description: 'Unknown', emoji: '❓' };
    
    // Create weather string
    const weatherString = `🌡️ Temperature: ${Math.round(current.temperature_2m)}°F 💨 Wind: ${Math.round(current.wind_speed_10m)} mph ${weather.emoji} Conditions: ${weather.description} 🌅 Updated: ${formattedDate} at ${formattedTime}`;
    
    return weatherString;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    if (error.response) {
      console.error('API response status:', error.response.status);
      console.error('API response data:', JSON.stringify(error.response.data));
    }
    return `⚠️ Weather data temporarily unavailable (Error: ${error.message})`;
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
