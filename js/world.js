// === CONFIGURATION & DOM SELECTORS ===
let apiKey = "1e3e8f230b6064d27976e41163a82b77";

// Grabbing the HTML elements using the specific IDs we set up in world.html
let searchInput = document.getElementById("add-city-input");
let cityContainer = document.getElementById("saved-cities-list");
let toggleAddBtn = document.getElementById("toggle-add-btn");
let addSection = document.getElementById("add-section");
let btnIcon = toggleAddBtn.querySelector("i"); // Grabs the plus icon inside the button

// Notification Messages
let normalMessage = document.getElementById("normal-msg");
let errorMessage = document.getElementById("error-msg");
let successMessage = document.getElementById("success-msg");

// === INITIALIZE SAVED CITIES ===
// Checks the browser's local storage for saved cities. If none exist, it creates a default list.
let savedCities = JSON.parse(localStorage.getItem("weatherAppCities")) || ["London", "Paris", "New York", "Tokyo"];


// === DATE GENERATOR ===
// Uses built-in JS methods to format the date beautifully (e.g., "April 7, 2024")
let dateElement = document.getElementById("current-date");
let today = new Date();
dateElement.innerHTML = today.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
});


// === HELPER FUNCTION: WEATHER ICONS ===
// Reusing our FontAwesome logic to ensure consistent vector icons across the app
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
        return "fa-sun";
    }
}


// === CORE FUNCTION: FETCH & RENDER CITY ===
// Fetches the weather data and builds the HTML card for the screen
async function fetchAndRenderCity(cityName) {
  try {
    // 1. Call the API
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?units=metric&q=${cityName}&appid=${apiKey}`);
    
    // 2. Check if the city exists
    if (response.ok) {
        let data = await response.json();
        
        // 3. Get the correct FontAwesome icon class
        let weatherCondition = data.weather[0].main;
        let iconClass = getWeatherIconClass(weatherCondition);
        
        // 4. Build the HTML card using Template Literals (Much cleaner than createElement)
        let cityCardHTML = `
            <div class="weather-box">
                <div class="name">
                    <div class="city-name">${data.name}</div>
                    <div class="weather-temp">${Math.floor(data.main.temp)}°</div>
                </div>
                <div class="weather-icon-container">
                    <i class="fa-solid ${iconClass}"></i>
                </div>
            </div>
        `;
        
        // 5. Inject the new card into the container (adds it to the top of the list)
        cityContainer.insertAdjacentHTML('afterbegin', cityCardHTML);
        
        return true; // Returns true so our event listener knows it succeeded
    } else {
        return false; // Returns false if city wasn't found (404 error)
    }
  } catch (error) {
      console.error("Error fetching city data:", error);
      return false;
  }
}


// === EVENT LISTENER: TOGGLE ADD CITY MENU ===
// Handles sliding the modal down and changing the button icon
toggleAddBtn.addEventListener("click", () => {
    // Toggles the 'show' class we created in CSS
    addSection.classList.toggle("show");
    
    // Swaps the icon from a Plus to an X depending on if the menu is open
    if (addSection.classList.contains("show")) {
        btnIcon.className = "fa-solid fa-circle-xmark";
    } else {
        btnIcon.className = "fa-solid fa-circle-plus";
        // Reset messages when closing
        normalMessage.style.display = "block";
        errorMessage.style.display = "none";
        successMessage.style.display = "none";
        searchInput.value = ""; // Clear the input field
    }
});


// === EVENT LISTENER: SEARCH & SAVE ===
// Listens for the Enter key to add a new city
searchInput.addEventListener("keydown", async function (event) {
    // Modern way to check for the Enter key
    if (event.key === 'Enter') {
        let newCity = searchInput.value.trim(); // .trim() removes accidental spaces
        
        if (newCity === "") return; // Don't search if the box is empty

        // Wait for the fetchAndRenderCity function to run
        const isSuccess = await fetchAndRenderCity(newCity);
        
        if (isSuccess) {
            // UI Update: Show Success
            normalMessage.style.display = "none";
            errorMessage.style.display = "none";
            successMessage.style.display = "block";
            
            // Data Update: Add to our array and save to LocalStorage
            if (!savedCities.includes(newCity)) {
                savedCities.push(newCity);
                localStorage.setItem("weatherAppCities", JSON.stringify(savedCities));
            }
            
            searchInput.value = ""; // Clear the box for the next search
        } else {
            // UI Update: Show Error
            normalMessage.style.display = "none";
            errorMessage.style.display = "block";
            successMessage.style.display = "none";
        }
    }
});

// === ON PAGE LOAD ===
// Loop through our saved cities array and render them to the screen
savedCities.forEach(city => {
    fetchAndRenderCity(city);
});