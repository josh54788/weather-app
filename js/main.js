// === CONFIGURATION ===
// Note for your portfolio: In a production app, you usually hide API keys in a backend. 
// For a frontend-only GitHub project, this is okay, but be aware of it!
let apiKey = "1e3e8f230b6064d27976e41163a82b77";

// === HELPER FUNCTION: WEATHER ICONS ===
// This function takes a weather condition string and returns the matching FontAwesome class.
// It is much cleaner than writing a massive if/else block inside the main logic.
function getWeatherIconClass(condition) {
  switch (condition.toLowerCase()) {
    case "rain":
    case "drizzle":
      return "fa-cloud-rain";
    case "clear":
    case "clear sky":
      return "fa-sun";
    case "snow":
      return "fa-snowflake";
    case "clouds":
    case "smoke":
      return "fa-cloud";
    case "mist":
    case "fog":
    case "haze":
      return "fa-smog";
    case "thunderstorm":
      return "fa-cloud-bolt";
    default:
      return "fa-sun"; // Default fallback icon
  }
}

// === MAIN GEOLOCATION & FETCH LOGIC ===
// Asks the user's browser for their current latitude and longitude
navigator.geolocation.getCurrentPosition(
  async function (position) {
    try {
      // 1. Extract coordinates from the browser's geolocation object
      var lat = position.coords.latitude;
      var lon = position.coords.longitude;

      // 2. Reverse Geocoding: Turn coordinates into a readable city name for the UI
      var map = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${apiKey}`
      );
      var userdata = await map.json();
      
      // We grab the local name to display on the screen
      let loc = userdata[0].name;
      
      // Clean up the clunky API location names
      loc = loc.replace(" Municipal District", "");
      loc = loc.replace(" Metropolis", "");
      
      // Custom override to display your specific local area
      if (loc === "Oforikrom") {
          loc = "Ayeduase";
      }

      // 3. Fetch current weather and forecast using EXACT coordinates instead of the city name string.
      // This fixes the 404 bug where the API didn't recognize hyper-local municipality names.
      let url = `https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=${lat}&lon=${lon}&appid=${apiKey}`;
      let respond = await fetch(url);
      
      // Stop the script and throw an error if the API request fails
      if (!respond.ok) {
         throw new Error(`Weather API error: ${respond.status}`);
      }
      
      let data = await respond.json();

      console.log("Weather Data Retrieved:", data);

      // === DOM SELECTION ===
      // Grabbing all the HTML elements we need to update with our new data
      let cityMain = document.getElementById("city-name");
      let cityTemp = document.getElementById("metric");
      let weatherConditionEl = document.getElementById("weather-condition"); 
      let weatherConditionTodayEl = document.getElementById("weather-condition-today");
      let mainHumidity = document.getElementById("humidity");
      let mainFeel = document.getElementById("feels-like");
      let tempMinWeather = document.getElementById("temp-min-today");
      let tempMaxWeather = document.getElementById("temp-max-today");
      
      // Grabbing the FontAwesome icon elements
      let mainWeatherIcon = document.getElementById("main-weather-icon");
      let todayWeatherIcon = document.getElementById("today-weather-icon");

      // === UPDATE UI WITH CURRENT WEATHER ===
      // Injecting the fetched data into the HTML elements
      cityMain.innerHTML = loc; // Use the readable name we got from reverse geocoding
      cityTemp.innerHTML = Math.floor(data.list[0].main.temp) + "°";
      
      // Formatting the description to look nice (e.g., "broken clouds")
      let desc = data.list[0].weather[0].description;
      weatherConditionEl.innerHTML = desc;
      weatherConditionTodayEl.innerHTML = desc;
      
      mainHumidity.innerHTML = Math.floor(data.list[0].main.humidity);
      mainFeel.innerHTML = Math.floor(data.list[0].main.feels_like);
      tempMinWeather.innerHTML = Math.floor(data.list[0].main.temp_min) + "°";
      tempMaxWeather.innerHTML = Math.floor(data.list[0].main.temp_max) + "°";

      // === UPDATE ICONS ===
      // Get the condition string, pass it to our helper function, and change the CSS class
      let weatherCondition = data.list[0].weather[0].main;
      let iconClass = getWeatherIconClass(weatherCondition);
      
      // We keep the base 'fa-solid' and custom sizing classes, but swap out the specific icon class
      mainWeatherIcon.className = `fa-solid ${iconClass} weather-icon`;
      todayWeatherIcon.className = `fa-solid ${iconClass} weather-icons`;


      // === FETCH & DISPLAY 5-DAY FORECAST ===
      // We use the exact coordinates again for the 5-day forecast to ensure reliability
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

      fetch(forecastUrl)
        .then((response) => response.json())
        .then((forecastData) => {
          displayForecast(forecastData);
        })
        .catch((error) => {
          console.error("Error fetching forecast:", error);
        });

      // Local function to handle building the forecast HTML
      function displayForecast(forecastData) {
        const dailyForecasts = {};
        let forecastContainer = document.getElementById("future-forecast-box");
        let forecastHTML = "";

        // Loop through the massive list of 3-hour forecast chunks
        forecastData.list.forEach((item) => {
          // Extract just the date (YYYY-MM-DD) from the timestamp string
          const date = item.dt_txt.split(" ")[0];
          let dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          let day = new Date(date).getDay();

          // If we haven't stored a forecast for this date yet, save the first one we find
          if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
              day_today: dayName[day],
              temperature: Math.floor(item.main.temp) + "°",
              description: item.weather[0].description,
              weatherMain: item.weather[0].main, // Store the main condition for the icon
            };
          }
        });

        // Build the HTML for each saved daily forecast
        for (const date in dailyForecasts) {
          let dayData = dailyForecasts[date];
          
          // Get the correct FontAwesome class for this specific day
          let dayIconClass = getWeatherIconClass(dayData.weatherMain);

          // Append the HTML block to our string using template literals
          forecastHTML += `
                <div class="weather-forecast-box">
                    <div class="day-weather">
                        <span>${dayData.day_today}</span>
                    </div>
                    <div class="weather-icon-forecast">
                        <i class="fa-solid ${dayIconClass}"></i>
                    </div>
                    <div class="temp-weather">
                        <span>${dayData.temperature}</span>
                    </div>
                    <div class="weather-main-forecast">${dayData.description}</div>
                </div>`;
        }

        // Inject the final generated HTML into the browser
        forecastContainer.innerHTML = forecastHTML;
      }
    } catch (error) {
      console.error("An error occurred during fetch/processing:", error);
    }
  },
  () => {
    // Fallback if the user blocks location access
    alert("Please turn on your location access in your browser settings to see your local weather.");
  }
);