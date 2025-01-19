	// OpenWeather API configuration
const API_KEY = 'API_KEY';
const CITY = 'MUMBAI';
const COUNTRY_CODE = 'IN';

let weatherData = null;
let weatherIcons = {};

// Weather condition colors
const weatherColors = {
  Clear: '#f6f6d5',     // Light yellow for sunny
  Clouds: '#e6e6e6',    // Light gray for cloudy
  Rain: '#e0e6ff',      // Light blue for rain
  Snow: '#ffffff',      // White for snow
  Thunderstorm: '#e0e0e0', // Dark gray for storms
  Drizzle: '#eef0f2',   // Light gray-blue for drizzle
  Atmosphere: '#f0f0f0'  // Gray for mist/fog
};

function preload() {
  weatherIcons = {
    Clear: loadImage('https://openweathermap.org/img/wn/01d@2x.png'),
    Clearn: loadImage('https://openweathermap.org/img/wn/01n@2x.png'),
    Clouds: loadImage('https://openweathermap.org/img/wn/03d@2x.png'),
    Rain: loadImage('https://openweathermap.org/img/wn/09d@2x.png'),
    Snow: loadImage('https://openweathermap.org/img/wn/13d@2x.png'),
    Thunderstorm: loadImage('https://openweathermap.org/img/wn/11d@2x.png'),
    Drizzle: loadImage('https://openweathermap.org/img/wn/09d@2x.png'),
    Mist: loadImage('https://openweathermap.org/img/wn/50d@2x.png')
  };
}

async function loadWeatherData() {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${CITY},${COUNTRY_CODE}&units=metric&appid=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    weatherData = await response.json();
  } catch (error) {
    console.error('Error loading weather data:', error);
  }
}

async function setup() {
  createCanvas(1220, 600);
  await loadWeatherData();
}

function draw() {
  background(240);
  
  if (weatherData) {
    drawDashboard();
  } else {
    fill(50);
    noStroke();
    textSize(20);
    textAlign(CENTER, CENTER);
    text('Loading weather data...', width/2, height/2);
  }
}

function drawDashboard() {
  const tileWidth = 220;
  const tileHeight = 500;
  const padding = 20;
  
  // City name header
  fill(50);
  noStroke();
  textSize(24);
  textAlign(CENTER);
  text(`${weatherData.city.name}, ${weatherData.city.country}`, width/2, 30);
  
  // Filter and group daytime forecasts (6 AM to 9 PM)
  const dailyForecasts = groupByDay(weatherData.list.filter(forecast => {
    const hour = new Date(forecast.dt_txt).getHours();
    return hour >= 6 && hour <= 21;
  }));
  
  // Draw each day's tile
  Object.entries(dailyForecasts).forEach(([ date, forecasts ], index) => {
    const x = padding + index * (tileWidth + padding);
    const y = padding + 40;
    
    // Get dominant weather condition for the day
    const dominantWeather = getDominantWeather(forecasts);
    
    // Draw tile background with weather-based color
    //fill(weatherColors[dominantWeather] || '#ffffff');
    fill('#ffffff');
    stroke(200);
    strokeWeight(1);
    rect(x, y, tileWidth, tileHeight, 10);
    
    // Draw date header
    fill(50);
    noStroke();
    textSize(18);
    textAlign(CENTER);
    text(formatDate(date), x + tileWidth/2, y + 30);
    
    // Draw min/max temperatures for the day
    const dailyMin = Math.min(...forecasts.map(f => f.main.temp_min));
    const dailyMax = Math.max(...forecasts.map(f => f.main.temp_max));
    textAlign(LEFT);
    text(`↓ ${dailyMin}°C`, x + 10, y + 60);
    text(`↑ ${dailyMax}°C`, x + 110, y + 60);
    
    // Draw 3-hour interval forecasts
    forecasts.forEach((forecast, fIndex) => {
      const forecastY = y + 90 + fIndex * 70;
      let timeValue = formatTime(forecast.dt_txt);
      // Draw time
      textSize(14);
      text(timeValue, x + 10, forecastY + 20);
      
      // Draw temperature
      textSize(14);
      text(`${forecast.main.temp}°C`, 
           x + 100, forecastY + 20);
      //text(`↑${forecast.main.temp_max}°`, 
      //    x + 145, forecastY + 20);
      
      // Draw weather icon
      const iconSize = 40;      
      let weatherMain = forecast.weather[0].main;
      if(weatherMain == 'Clear' && (timeValue.includes('06:00 PM') || timeValue.includes('09:00 PM') ) ){
        weatherMain = weatherMain+'n';
      }
      if (weatherIcons[weatherMain]) {
        image(weatherIcons[weatherMain], 
              x + 50, forecastY+20, 
              iconSize, iconSize);
      }
      const weatherIcon = forecast.weather[0].icon;
      
      
      // Draw humidity
      textSize(14);
      text(`💧 ${forecast.main.humidity}%`,
           x + 107, forecastY + 42);
      
      // Draw wind direction arrow
      drawWindArrow(x + 175, forecastY + 42, forecast.wind.deg);
    });
  });
}

function drawWindArrow(x, y, degrees) {
  push();
  translate(x, y);
  rotate(radians(degrees));
  
  // Draw arrow
  stroke(100);
  strokeWeight(2);
  line(-10, 0, 10, 0);
  line(10, 0, 5, -5);
  line(10, 0, 5, 5);
  
  pop();
}

function getDominantWeather(forecasts) {
  // Count occurrences of each weather condition
  const weatherCounts = forecasts.reduce((acc, forecast) => {
    const weather = forecast.weather[0].main;
    acc[weather] = (acc[weather] || 0) + 1;
    return acc;
  }, {});
  
  // Return the most frequent weather condition
  return Object.entries(weatherCounts)
    .sort((a, b) => b[1] - a[1])[0][0];
}

function groupByDay(forecasts) {
  const groups = {};
  forecasts.forEach(forecast => {
    const date = forecast.dt_txt.split(' ')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(forecast);
  });
  return groups;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
}
