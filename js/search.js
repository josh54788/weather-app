// === CONFIGURATION ===
let apiKey = "1e3e8f230b6064d27976e41163a82b77";

// Selects the input field where the user types the city name
let searchinput = document.querySelector('.searchinput');

// === HELPER FUNCTION: WEATHER ICONS ===
// We use the same FontAwesome logic here to keep the vector design consistent across pages
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

// === MAIN SEARCH FUNCTION ===
// This asynchronous function fetches weather data for the searched city
async function search(city) {
    // 1. Fetch data from OpenWeatherMap API using the city name
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city}&appid=${apiKey}`);

    // 2. Check if the API successfully found the city (HTTP status code 200-299)
    if (response.ok) {
        // Convert the raw response into a usable JavaScript object
        let data = await response.json();
        console.log("Search Results:", data);
        
        // === UI MANAGEMENT: SUCCESS ===
        // Show the weather results box (.return container)
        let box = document.querySelector(".return");
        box.style.display = "block";

        // Hide the initial "Search for a city" placeholder message
        let message = document.querySelector(".message");
        if(message) message.style.display = "none";

        // Hide the "City not found" error message in case it was showing from a previous bad search
        let errormessage = document.querySelector(".error-message");
        if(errormessage) errormessage.style.display = "none";

        // === UPDATE DOM ELEMENTS ===
        // Injecting the fetched data into the corresponding HTML elements
        document.querySelector(".city-name").innerHTML = data.name;
        document.querySelector(".weather-temp").innerHTML = Math.floor(data.main.temp) + '°';
        document.querySelector(".wind").innerHTML = Math.floor(data.wind.speed) + " m/s";
        document.querySelector(".pressure").innerHTML = Math.floor(data.main.pressure) + " hPa";
        document.querySelector('.humidity').innerHTML = Math.floor(data.main.humidity)+ "%";
        
        // Convert UNIX timestamps (which OpenWeather uses) into readable local times
        document.querySelector(".sunrise").innerHTML = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
        document.querySelector(".sunset").innerHTML = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});

        // === UPDATE ICONS ===
        // Get the condition string, pass it to our helper function, and change the FontAwesome CSS class
        let weatherCondition = data.weather[0].main;
        let iconClass = getWeatherIconClass(weatherCondition);
        
        // Targets the main icon element and injects the dynamic FontAwesome class
        let weatherIcon = document.querySelector(".weather-icon");
        weatherIcon.className = `fa-solid ${iconClass} weather-icon`;

    } else {
        // === UI MANAGEMENT: ERROR ===
        // If the city wasn't found (e.g., user typed gibberish, throwing a 404 error)
        
        // Hide the weather results box
        let box = document.querySelector(".return");
        if(box) box.style.display = "none";

        // Hide the initial placeholder message
        let message = document.querySelector(".message");
        if(message) message.style.display = "none";

        // Show the "City not found" error message to the user
        let errormessage = document.querySelector(".error-message");
        if(errormessage) errormessage.style.display = "block";
    }
}

// === EVENT LISTENERS ===
// Listen for the user to press a key inside the search input field
searchinput.addEventListener('keydown', function(event) {
    // Check if the key pressed was 'Enter'
    if (event.key === 'Enter') {
        // If it was Enter, run the search function with whatever text is inside the input box
        search(searchinput.value);
        console.log("Search triggered for:", searchinput.value);
    }
});