
// =====================================================
// WORLDWIDE WEATHER DASHBOARD
// =====================================================


// =====================================================
// ELEMENTS
// =====================================================

const cityInput = document.getElementById("cityInput");
const searchButton = document.getElementById("searchButton");
const suggestionsBox = document.getElementById("suggestions");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");

const weatherContainer =
    document.getElementById("weatherContainer");

const locationName =
    document.getElementById("locationName");

const locationDetails =
    document.getElementById("locationDetails");

const localTime =
    document.getElementById("localTime");

const weatherIcon =
    document.getElementById("weatherIcon");

const temperature =
    document.getElementById("temperature");

const weatherDescription =
    document.getElementById("weatherDescription");

const feelsLike =
    document.getElementById("feelsLike");

const humidity =
    document.getElementById("humidity");

const windSpeed =
    document.getElementById("windSpeed");

const windDirection =
    document.getElementById("windDirection");

const rain =
    document.getElementById("rain");

const sunrise =
    document.getElementById("sunrise");

const sunset =
    document.getElementById("sunset");

const forecast =
    document.getElementById("forecast");


// =====================================================
// SEARCH TIMER
// =====================================================

let searchTimeout;


// =====================================================
// COMMON MISSPELLINGS
// =====================================================

const spellingCorrections = {

    "banglore": "Bangalore",
    "bangalore": "Bangalore",

    "bengaluru": "Bangalore",

    "hydrabad": "Hyderabad",
    "hyderbad": "Hyderabad",
    "hydrabad": "Hyderabad",

    "vijaywada": "Vijayawada",
    "vijayawdda": "Vijayawada",

    "visakhaptnam": "Visakhapatnam",
    "vizag": "Visakhapatnam",

    "chenni": "Chennai",
    "chenai": "Chennai",

    "mumbaii": "Mumbai",
    "bombay": "Mumbai",

    "kolkatta": "Kolkata",
    "calcutta": "Kolkata",

    "delhii": "Delhi",

    "londn": "London",
    "londonn": "London",

    "newyork": "New York",
    "newyrok": "New York",

    "pariss": "Paris",
    "parsi": "Paris",

    "berln": "Berlin",

    "tokoyo": "Tokyo",
    "tokio": "Tokyo",

    "bejing": "Beijing",
    "peking": "Beijing",

    "singapor": "Singapore",

    "dubia": "Dubai",
    "dubayy": "Dubai",

    "melborn": "Melbourne",
    "melburne": "Melbourne",

    "sydneyy": "Sydney",

    "tornto": "Toronto",

    "chcago": "Chicago",

    "moskow": "Moscow",
    "mosco": "Moscow",

    "istambul": "Istanbul",
    "istanbull": "Istanbul",

    "barcelon": "Barcelona",

    "amsterdamn": "Amsterdam",

    "losangeles": "Los Angeles",

    "sanfransisco": "San Francisco",
    "sanfrancisco": "San Francisco"

};


// =====================================================
// INPUT EVENT
// =====================================================

cityInput.addEventListener("input", function () {

    const query =
        cityInput.value.trim();

    clearTimeout(searchTimeout);


    if (query.length < 2) {

        suggestionsBox.innerHTML = "";

        suggestionsBox.style.display = "none";

        return;
    }


    searchTimeout = setTimeout(() => {

        searchCities(query);

    }, 350);

});


// =====================================================
// SEARCH BUTTON
// =====================================================

searchButton.addEventListener("click", function () {

    const query =
        cityInput.value.trim();

    if (query.length === 0) {

        showError(
            "Please enter a city name."
        );

        return;
    }

    searchExactCity(query);

});


// =====================================================
// ENTER KEY
// =====================================================

cityInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        const query =
            cityInput.value.trim();

        if (query.length > 0) {

            hideSuggestions();

            searchExactCity(query);

        }

    }

});


// =====================================================
// WORLDWIDE CITY SEARCH
// =====================================================

async function searchCities(query) {

    try {

        let searchQuery = query;

        const corrected =
            spellingCorrections[
                query.toLowerCase()
            ];


        if (corrected) {

            searchQuery = corrected;

        }


        const url =
            "https://geocoding-api.open-meteo.com/v1/search?" +
            "name=" +
            encodeURIComponent(searchQuery) +
            "&count=10" +
            "&language=en" +
            "&format=json";


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "City search failed."
            );

        }


        const data =
            await response.json();


        suggestionsBox.innerHTML = "";


        if (
            !data.results ||
            data.results.length === 0
        ) {

            suggestionsBox.style.display =
                "none";

            return;

        }


        // ==========================================
        // REMOVE DUPLICATES
        // ==========================================

        const uniqueCities = [];

        const seen = new Set();


        data.results.forEach(city => {

            const key =
                `${city.name}-${city.country_code}`;

            if (!seen.has(key)) {

                seen.add(key);

                uniqueCities.push(city);

            }

        });


        // ==========================================
        // CREATE SUGGESTIONS
        // ==========================================

        uniqueCities
            .slice(0, 8)
            .forEach(city => {

                createSuggestion(city);

            });


        suggestionsBox.style.display =
            "block";


    } catch (error) {

        console.error(
            "City search error:",
            error
        );

        hideSuggestions();

    }

}


// =====================================================
// CREATE SUGGESTION
// =====================================================

function createSuggestion(city) {

    const suggestion =
        document.createElement("div");


    suggestion.className =
        "suggestion-item";


    const cityText =
        document.createElement("div");

    cityText.className =
        "suggestion-city";


    cityText.textContent =
        city.name;


    const locationText =
        document.createElement("span");

    locationText.className =
        "suggestion-location";


    let location = "";


    if (city.admin1) {

        location +=
            city.admin1 + ", ";

    }


    if (city.country) {

        location +=
            city.country;

    }


    locationText.textContent =
        location;


    suggestion.appendChild(
        cityText
    );


    suggestion.appendChild(
        locationText
    );


    suggestion.addEventListener(
        "click",
        function () {

            cityInput.value =
                city.name;


            hideSuggestions();


            getWeather(
                city.latitude,
                city.longitude,
                city.name,
                city.country,
                city.timezone
            );

        }
    );


    suggestionsBox.appendChild(
        suggestion
    );

}


// =====================================================
// SEARCH EXACT / CORRECTED CITY
// =====================================================

async function searchExactCity(query) {

    try {

        showLoading();

        hideError();


        let searchQuery =
            query;


        const corrected =
            spellingCorrections[
                query.toLowerCase()
            ];


        if (corrected) {

            searchQuery =
                corrected;

        }


        const url =
            "https://geocoding-api.open-meteo.com/v1/search?" +
            "name=" +
            encodeURIComponent(searchQuery) +
            "&count=10" +
            "&language=en" +
            "&format=json";


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Could not search for the city."
            );

        }


        const data =
            await response.json();


        if (
            !data.results ||
            data.results.length === 0
        ) {

            hideLoading();

            showError(
                "City not found. Try another spelling."
            );

            return;

        }


        // Select first result
        const city =
            data.results[0];


        cityInput.value =
            city.name;


        getWeather(
            city.latitude,
            city.longitude,
            city.name,
            city.country,
            city.timezone
        );


    } catch (error) {

        console.error(error);

        hideLoading();

        showError(
            "Unable to find this city."
        );

    }

}


// =====================================================
// GET WEATHER
// =====================================================

async function getWeather(
    latitude,
    longitude,
    cityName,
    country,
    timezone
) {

    try {

        showLoading();

        hideError();


        const url =
            "https://api.open-meteo.com/v1/forecast?" +
            "latitude=" +
            latitude +
            "&longitude=" +
            longitude +
            "&current=" +
            "temperature_2m," +
            "relative_humidity_2m," +
            "apparent_temperature," +
            "precipitation," +
            "weather_code," +
            "wind_speed_10m," +
            "wind_direction_10m" +
            "&daily=" +
            "weather_code," +
            "temperature_2m_max," +
            "temperature_2m_min," +
            "sunrise," +
            "sunset," +
            "precipitation_probability_max" +
            "&timezone=auto" +
            "&forecast_days=7";


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Weather request failed."
            );

        }


        const data =
            await response.json();


        displayWeather(
            data,
            cityName,
            country
        );


    } catch (error) {

        console.error(
            "Weather error:",
            error
        );


        showError(
            "Unable to load weather data."
        );

    } finally {

        hideLoading();

    }

}


// =====================================================
// DISPLAY WEATHER
// =====================================================

function displayWeather(
    data,
    cityName,
    country
) {

    weatherContainer.style.display =
        "block";


    // ==========================================
    // LOCATION
    // ==========================================

    locationName.textContent =
        cityName;


    locationDetails.textContent =
        country;


    // ==========================================
    // CURRENT WEATHER
    // ==========================================

    const current =
        data.current;


    temperature.textContent =
        Math.round(
            current.temperature_2m
        );


    feelsLike.textContent =
        "Feels like " +
        Math.round(
            current.apparent_temperature
        ) +
        "°C";


    humidity.textContent =
        current.relative_humidity_2m +
        "%";


    windSpeed.textContent =
        Math.round(
            current.wind_speed_10m
        ) +
        " km/h";


    windDirection.textContent =
        current.wind_direction_10m +
        "°";


    rain.textContent =
        current.precipitation +
        " mm";


    // ==========================================
    // WEATHER DESCRIPTION
    // ==========================================

    const weatherInfo =
        getWeatherInfo(
            current.weather_code
        );


    weatherIcon.textContent =
        weatherInfo.icon;


    weatherDescription.textContent =
        weatherInfo.description;


    // ==========================================
    // LOCAL TIME
    // ==========================================

    if (data.current.time) {

        const date =
            new Date(
                data.current.time
            );


        localTime.textContent =
            formatDateTime(date);

    }


    // ==========================================
    // SUNRISE / SUNSET
    // ==========================================

    if (
        data.daily &&
        data.daily.sunrise
    ) {

        sunrise.textContent =
            formatTime(
                data.daily.sunrise[0]
            );

    }


    if (
        data.daily &&
        data.daily.sunset
    ) {

        sunset.textContent =
            formatTime(
                data.daily.sunset[0]
            );

    }


    // ==========================================
    // 7-DAY FORECAST
    // ==========================================

    displayForecast(
        data.daily
    );

}


// =====================================================
// DISPLAY 7-DAY FORECAST
// =====================================================

function displayForecast(daily) {

    forecast.innerHTML = "";


    for (
        let i = 0;
        i < daily.time.length;
        i++
    ) {

        const date =
            new Date(
                daily.time[i] +
                "T00:00:00"
            );


        const weatherInfo =
            getWeatherInfo(
                daily.weather_code[i]
            );


        const card =
            document.createElement("div");


        card.className =
            "forecast-card";


        const rainProbability =
            daily
                .precipitation_probability_max[i];


        card.innerHTML = `

            <div class="forecast-day">
                ${formatDay(date)}
            </div>

            <div class="forecast-icon">
                ${weatherInfo.icon}
            </div>

            <div class="forecast-temp">
                ${Math.round(
                    daily.temperature_2m_max[i]
                )}° /
                ${Math.round(
                    daily.temperature_2m_min[i]
                )}°
            </div>

            <div class="forecast-description">
                ${weatherInfo.description}
            </div>

            <div class="forecast-rain">
                🌧️ ${rainProbability ?? 0}%
            </div>

        `;


        forecast.appendChild(card);

    }

}


// =====================================================
// WEATHER CODE
// =====================================================

function getWeatherInfo(code) {

    if (code === 0) {

        return {
            icon: "☀️",
            description: "Clear sky"
        };

    }


    if (
        code === 1 ||
        code === 2
    ) {

        return {
            icon: "🌤️",
            description: "Partly cloudy"
        };

    }


    if (code === 3) {

        return {
            icon: "☁️",
            description: "Overcast"
        };

    }


    if (
        code === 45 ||
        code === 48
    ) {

        return {
            icon: "🌫️",
            description: "Fog"
        };

    }


    if (
        code >= 51 &&
        code <= 57
    ) {

        return {
            icon: "🌦️",
            description: "Drizzle"
        };

    }


    if (
        code >= 61 &&
        code <= 67
    ) {

        return {
            icon: "🌧️",
            description: "Rain"
        };

    }


    if (
        code >= 71 &&
        code <= 77
    ) {

        return {
            icon: "❄️",
            description: "Snow"
        };

    }


    if (
        code >= 80 &&
        code <= 82
    ) {

        return {
            icon: "🌦️",
            description: "Rain showers"
        };

    }


    if (
        code === 85 ||
        code === 86
    ) {

        return {
            icon: "🌨️",
            description: "Snow showers"
        };

    }


    if (
        code >= 95 &&
        code <= 99
    ) {

        return {
            icon: "⛈️",
            description: "Thunderstorm"
        };

    }


    return {
        icon: "🌤️",
        description: "Unknown"
    };

}


// =====================================================
// DATE / TIME
// =====================================================

function formatTime(dateString) {

    if (!dateString) {

        return "--";

    }


    const parts =
        dateString.split("T");


    if (parts.length < 2) {

        return dateString;

    }


    return parts[1];

}


function formatDay(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "short"
        }
    );

}


function formatDateTime(date) {

    return date.toLocaleString(
        "en-US",
        {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


// =====================================================
// UI FUNCTIONS
// =====================================================

function showLoading() {

    loading.style.display =
        "block";

}


function hideLoading() {

    loading.style.display =
        "none";

}


function showError(message) {

    errorMessage.textContent =
        message;

    errorMessage.style.display =
        "block";

}


function hideError() {

    errorMessage.textContent =
        "";

    errorMessage.style.display =
        "none";

}


function hideSuggestions() {

    suggestionsBox.innerHTML =
        "";

    suggestionsBox.style.display =
        "none";

}


// =====================================================
// CLOSE SUGGESTIONS WHEN CLICKING OUTSIDE
// =====================================================

document.addEventListener(
    "click",
    function (event) {

        if (
            !event.target.closest(
                ".search-container"
            )
        ) {

            hideSuggestions();

        }

    }
);
