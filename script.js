const year = document.querySelector("#year");
const clock = document.querySelector("#clock");
const weatherIcon = document.querySelector("[data-weather-icon]");
const weatherTemp = document.querySelector(".weather-temp");
const weatherNote = document.querySelector("[data-weather-note]");
const weatherWind = document.querySelector("[data-weather-wind]");
const weatherPlace = document.querySelector("[data-weather-place]");

const weatherIcons = {
  "partly-cloudy": "assets/images/weather/partly-cloudy.png",
  "strong-scattered-thunderstorms": "assets/images/weather/strong-scattered-thunderstorms.png",
  "fog-day": "assets/images/weather/fog-day.png",
  "cloudy-night": "assets/images/weather/cloudy-night.png",
  "windy-night": "assets/images/weather/windy-night.png",
  "haze-night": "assets/images/weather/haze-night.png",
  "cloudy-overcast": "assets/images/weather/cloudy-overcast.png",
  "partly-cloudy-night": "assets/images/weather/partly-cloudy-night.png",
  sunny: "assets/images/weather/sunny.png",
  raining: "assets/images/weather/raining.png",
  thunderstorms: "assets/images/weather/thunderstorms.png",
  "isolated-thunderstorms": "assets/images/weather/isolated-thunderstorms.png",
  clear: "assets/images/weather/clear.png",
};

if (year) {
  year.textContent = new Date().getFullYear();
}

function updateClock() {
  if (!clock) return;

  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

updateClock();
setInterval(updateClock, 1000 * 30);

function setWeatherIcon(condition, label) {
  if (!weatherIcon) return;

  weatherIcon.dataset.condition = condition;
  weatherIcon.src = weatherIcons[condition] || weatherIcons.clear;
  weatherIcon.alt = label;
}

function weatherFromCode(code, isDay, windSpeed) {
  if (windSpeed >= 18) {
    return {
      condition: "windy-night",
      label: "Windy weather",
      note: isDay ? "windy skies" : "windy night",
    };
  }

  if (code === 0) {
    return {
      condition: isDay ? "clear" : "cloudy-night",
      label: isDay ? "Clear weather" : "Clear night weather",
      note: isDay ? "clear skies" : "clear night",
    };
  }

  if ([1, 2].includes(code)) {
    return {
      condition: isDay ? "partly-cloudy" : "partly-cloudy-night",
      label: "Partly cloudy weather",
      note: "partly cloudy",
    };
  }

  if (code === 3) {
    return {
      condition: "cloudy-overcast",
      label: "Cloudy weather",
      note: "cloudy and overcast",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      condition: isDay ? "fog-day" : "haze-night",
      label: "Foggy weather",
      note: isDay ? "fog during the day" : "hazy night",
    };
  }

  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return {
      condition: "raining",
      label: "Rainy weather",
      note: "raining",
    };
  }

  if ([95].includes(code)) {
    return {
      condition: "isolated-thunderstorms",
      label: "Isolated thunderstorms",
      note: "isolated thunderstorms",
    };
  }

  if ([96, 99].includes(code)) {
    return {
      condition: "strong-scattered-thunderstorms",
      label: "Strong thunderstorms",
      note: "strong scattered thunderstorms",
    };
  }

  return {
    condition: "sunny",
    label: "Sunny weather",
    note: "weather nearby",
  };
}

async function loadWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: "temperature_2m,weather_code,is_day,wind_speed_10m",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    timezone: "auto",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (!response.ok) {
    throw new Error("Weather request failed");
  }

  const data = await response.json();
  const current = data.current;
  const temperature = Math.round(current.temperature_2m);
  const windSpeed = Math.round(current.wind_speed_10m);
  const weather = weatherFromCode(
    current.weather_code,
    current.is_day === 1,
    windSpeed,
  );

  if (weatherTemp) weatherTemp.textContent = `${temperature}\u00b0`;
  if (weatherNote) weatherNote.textContent = weather.note;
  if (weatherWind) weatherWind.textContent = `${windSpeed} mph`;
  if (weatherPlace) weatherPlace.textContent = "near you";
  setWeatherIcon(weather.condition, weather.label);
}

function useFallbackWeather(message) {
  if (weatherTemp) weatherTemp.textContent = "--\u00b0";
  if (weatherNote) weatherNote.textContent = message;
  if (weatherWind) weatherWind.textContent = "-- mph";
  if (weatherPlace) weatherPlace.textContent = "location off";
  setWeatherIcon("clear", "Clear weather");
}

function initWeather() {
  if (!weatherIcon) return;

  setWeatherIcon(weatherIcon.dataset.condition || "clear", weatherIcon.alt);

  if (!navigator.geolocation) {
    useFallbackWeather("location is not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      loadWeather(latitude, longitude).catch(() => {
        useFallbackWeather("weather is unavailable");
      });
    },
    () => {
      useFallbackWeather("allow location for local weather");
    },
    {
      enableHighAccuracy: false,
      maximumAge: 1000 * 60 * 20,
      timeout: 1000 * 10,
    },
  );
}

initWeather();
