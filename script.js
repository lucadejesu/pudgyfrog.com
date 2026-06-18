const year = document.querySelector("#year");
const clock = document.querySelector("#clock");
const weatherIcon = document.querySelector("[data-weather-icon]");
const weatherTemp = document.querySelector(".weather-temp");
const weatherNote = document.querySelector("[data-weather-note]");
const weatherWind = document.querySelector("[data-weather-wind]");
const weatherRain = document.querySelector("[data-weather-rain]");
const weatherHumidity = document.querySelector("[data-weather-humidity]");
const weatherUv = document.querySelector("[data-weather-uv]");
const weatherPlace = document.querySelector("[data-weather-place]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");
const themeStorageKey = "pudgyfrog-theme";

function applyTheme(theme) {
  const activeTheme = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = activeTheme;

  if (themeToggle) {
    themeToggle.checked = activeTheme === "light";
  }

  if (themeLabel) {
    themeLabel.textContent = `${activeTheme} mode`;
  }
}

applyTheme(localStorage.getItem(themeStorageKey) || "dark");

if (themeToggle) {
  themeToggle.addEventListener("change", () => {
    const theme = themeToggle.checked ? "light" : "dark";
    localStorage.setItem(themeStorageKey, theme);
    applyTheme(theme);
  });
}

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

// turns the weather service numbers into the icons and words i use on the site
function weatherFromCode(code, isDay, windSpeed) {
  if (windSpeed >= 18) {
    return {
      condition: "windy-night",
      label: "Windy weather",
      note: "windy",
    };
  }

  if (code === 0) {
    return {
      condition: isDay ? "clear" : "cloudy-night",
      label: isDay ? "Clear weather" : "Clear night weather",
      note: "clear skies",
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
      note: "overcast",
    };
  }

  if ([45, 48].includes(code)) {
    return {
      condition: isDay ? "fog-day" : "haze-night",
      label: "Foggy weather",
      note: isDay ? "fog" : "hazy night",
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
    current:
      "temperature_2m,relative_humidity_2m,weather_code,is_day,wind_speed_10m,uv_index",
    hourly: "precipitation_probability",
    forecast_hours: "2",
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
  const humidity = Math.round(current.relative_humidity_2m);
  const uvIndex = Number(current.uv_index).toFixed(1);
  const rainChance = Math.round(
    data.hourly?.precipitation_probability?.[1] ??
      data.hourly?.precipitation_probability?.[0] ??
      0,
  );
  const weather = weatherFromCode(
    current.weather_code,
    current.is_day === 1,
    windSpeed,
  );

  if (weatherTemp) weatherTemp.textContent = `${temperature}\u00b0`;
  if (weatherNote) weatherNote.textContent = weather.note;
  if (weatherWind) weatherWind.textContent = `${windSpeed} mph`;
  if (weatherRain) weatherRain.textContent = `${rainChance}%`;
  if (weatherHumidity) weatherHumidity.textContent = `${humidity}%`;
  if (weatherUv) weatherUv.textContent = uvIndex;
  if (weatherPlace) weatherPlace.textContent = "currently";
  setWeatherIcon(weather.condition, weather.label);
}

function useFallbackWeather(message) {
  if (weatherTemp) weatherTemp.textContent = "--\u00b0";
  if (weatherNote) weatherNote.textContent = message;
  if (weatherWind) weatherWind.textContent = "-- mph";
  if (weatherRain) weatherRain.textContent = "--%";
  if (weatherHumidity) weatherHumidity.textContent = "--%";
  if (weatherUv) weatherUv.textContent = "--";
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

const hoverGifs = document.querySelectorAll("[data-gif-src][data-still-src]");
const animationStage = document.querySelector("[data-animation-stage]");
const animationStageFrame = document.querySelector("[data-animation-stage-frame]");
const animationGrid = document.querySelector(".animation-grid");

// hides the smaller animations while one of them takes over the main box
function showAnimationStage(image) {
  if (!animationStage || !animationStageFrame || !animationGrid) return;

  animationStage.src = image.dataset.gifSrc;
  animationStage.alt = image.alt;
  animationStage.classList.toggle(
    "animation-stage-contained",
    image.dataset.stageFit === "contain",
  );
  animationGrid.hidden = true;
  animationStageFrame.hidden = false;
}

function hideAnimationStage() {
  if (!animationStageFrame || !animationGrid) return;

  animationStageFrame.hidden = true;
  animationGrid.hidden = false;
}

hoverGifs.forEach((image) => {
  image.tabIndex = 0;

  if (animationStage && animationStageFrame && animationGrid) {
    image.addEventListener("mouseenter", () => showAnimationStage(image));
    image.addEventListener("pointerenter", () => showAnimationStage(image));
    image.addEventListener("focus", () => showAnimationStage(image));
    image.addEventListener("click", () => showAnimationStage(image));
    return;
  }

  const playGif = () => {
    image.src = image.dataset.gifSrc;
  };

  const pauseGif = () => {
    image.src = image.dataset.stillSrc;
  };

  image.addEventListener("mouseenter", playGif);
  image.addEventListener("mouseover", playGif);
  image.addEventListener("pointerenter", playGif);
  image.addEventListener("focus", playGif);
  image.addEventListener("mouseleave", pauseGif);
  image.addEventListener("pointerleave", pauseGif);
  image.addEventListener("blur", pauseGif);
});

if (animationStageFrame) {
  animationStageFrame.addEventListener("mouseleave", hideAnimationStage);
  animationStageFrame.addEventListener("pointerleave", hideAnimationStage);
  animationStageFrame.addEventListener("blur", hideAnimationStage);
  animationStageFrame.addEventListener("click", hideAnimationStage);
}

const hoverPaintings = document.querySelectorAll(".hover-painting");
const paintingStage = document.querySelector("[data-painting-stage]");
const paintingStageFrame = document.querySelector("[data-painting-stage-frame]");
const paintingGrid = document.querySelector(".painting-grid");

// lets one painting take over the main box until the mouse moves away
function showPaintingStage(image) {
  if (!paintingStage || !paintingStageFrame || !paintingGrid) return;

  paintingStage.src = image.src;
  paintingStage.alt = image.alt;
  paintingGrid.hidden = true;
  paintingStageFrame.hidden = false;
}

function hidePaintingStage() {
  if (!paintingStageFrame || !paintingGrid) return;

  paintingStageFrame.hidden = true;
  paintingGrid.hidden = false;
}

hoverPaintings.forEach((image) => {
  image.tabIndex = 0;
  image.addEventListener("mouseenter", () => showPaintingStage(image));
  image.addEventListener("pointerenter", () => showPaintingStage(image));
  image.addEventListener("focus", () => showPaintingStage(image));
  image.addEventListener("click", () => showPaintingStage(image));
});

if (paintingStageFrame) {
  paintingStageFrame.addEventListener("mouseleave", hidePaintingStage);
  paintingStageFrame.addEventListener("pointerleave", hidePaintingStage);
  paintingStageFrame.addEventListener("blur", hidePaintingStage);
  paintingStageFrame.addEventListener("click", hidePaintingStage);
}

const commentForm = document.querySelector("[data-comment-form]");
const commentList = document.querySelector("[data-comment-list]");
const commentsStorageKey = "pudgyfrog-painting-comments";

// keeps painting comments saved in this browser for now
function readComments() {
  try {
    return JSON.parse(localStorage.getItem(commentsStorageKey)) || [];
  } catch {
    return [];
  }
}

function saveComments(comments) {
  localStorage.setItem(commentsStorageKey, JSON.stringify(comments));
}

function formatCommentTime(value) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function renderComments() {
  if (!commentList) return;

  const comments = readComments();
  commentList.replaceChildren();

  if (comments.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "comment-empty";
    emptyMessage.textContent = "no comments yet";
    commentList.append(emptyMessage);
    return;
  }

  comments.forEach((comment) => {
    const entry = document.createElement("article");
    entry.className = "comment-entry";

    const header = document.createElement("header");
    const name = document.createElement("span");
    const time = document.createElement("time");
    const body = document.createElement("p");

    name.textContent = comment.name;
    time.dateTime = comment.createdAt;
    time.textContent = formatCommentTime(comment.createdAt);
    body.textContent = comment.body;

    header.append(name, time);
    entry.append(header, body);
    commentList.append(entry);
  });
}

if (commentForm && commentList) {
  renderComments();

  commentForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(commentForm);
    const name = String(formData.get("name") || "").trim();
    const body = String(formData.get("comment") || "").trim();

    if (!name || !body) return;

    const comments = readComments();
    comments.unshift({
      name,
      body,
      createdAt: new Date().toISOString(),
    });

    saveComments(comments);
    renderComments();
    commentForm.reset();
  });
}
