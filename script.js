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
const weatherAlert = document.querySelector("[data-weather-alert]");
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeLabel = document.querySelector("[data-theme-label]");
const themeStorageKey = "pudgyfrog-theme";
const youtubePlayer = document.querySelector("[data-youtube-playlist]");

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

function weatherFromCloudCover(cloudCover, isDay) {
  if (cloudCover >= 88) {
    return {
      condition: "cloudy-overcast",
      label: "Overcast weather",
      note: "overcast",
    };
  }

  if (cloudCover >= 55) {
    return {
      condition: isDay ? "partly-cloudy" : "partly-cloudy-night",
      label: "Mostly cloudy weather",
      note: "mostly cloudy",
    };
  }

  if (cloudCover >= 20) {
    return {
      condition: isDay ? "partly-cloudy" : "partly-cloudy-night",
      label: "Partly cloudy weather",
      note: "partly cloudy",
    };
  }

  return {
    condition: isDay ? "clear" : "cloudy-night",
    label: isDay ? "Clear weather" : "Clear night weather",
    note: "clear skies",
  };
}

// turns the weather service numbers into the icons and words i use on the site
function weatherFromCode(
  code,
  isDay,
  windSpeed,
  cloudCover = 0,
  precipitation = 0,
) {
  if (windSpeed >= 18) {
    return {
      condition: "windy-night",
      label: "Windy weather",
      note: "windy",
    };
  }

  if (code === 0) {
    return weatherFromCloudCover(cloudCover, isDay);
  }

  if ([1, 2].includes(code)) {
    return weatherFromCloudCover(cloudCover, isDay);
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
    if (precipitation <= 0) {
      return weatherFromCloudCover(cloudCover, isDay);
    }

    return {
      condition: "isolated-thunderstorms",
      label: "Isolated thunderstorms",
      note: "isolated thunderstorms",
    };
  }

  if ([96, 99].includes(code)) {
    if (precipitation <= 0) {
      return weatherFromCloudCover(cloudCover, isDay);
    }

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

function weatherFromObservation(description, isDay) {
  const observed = description.toLowerCase();

  if (observed.includes("thunder")) {
    return {
      condition: "isolated-thunderstorms",
      label: description,
      note: "isolated thunderstorms",
    };
  }

  if (
    observed.includes("rain") ||
    observed.includes("shower") ||
    observed.includes("drizzle")
  ) {
    return {
      condition: "raining",
      label: description,
      note: "raining",
    };
  }

  if (
    observed.includes("fog") ||
    observed.includes("mist") ||
    observed.includes("haze")
  ) {
    return {
      condition: isDay ? "fog-day" : "haze-night",
      label: description,
      note: observed.includes("fog") ? "fog" : "hazy",
    };
  }

  if (observed.includes("overcast")) {
    return {
      condition: "cloudy-overcast",
      label: description,
      note: "overcast",
    };
  }

  if (observed === "cloudy") {
    return {
      condition: "cloudy-overcast",
      label: description,
      note: "cloudy",
    };
  }

  if (
    observed.includes("mostly cloudy") ||
    observed.includes("broken clouds")
  ) {
    return {
      condition: isDay ? "partly-cloudy" : "partly-cloudy-night",
      label: description,
      note: "mostly cloudy",
    };
  }

  if (
    observed.includes("partly cloudy") ||
    observed.includes("scattered clouds") ||
    observed.includes("few clouds")
  ) {
    return {
      condition: isDay ? "partly-cloudy" : "partly-cloudy-night",
      label: description,
      note: "partly cloudy",
    };
  }

  if (observed.includes("clear") || observed.includes("fair")) {
    return {
      condition: isDay ? "clear" : "cloudy-night",
      label: description,
      note: "clear skies",
    };
  }

  return null;
}

async function loadWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current:
      "temperature_2m,relative_humidity_2m,weather_code,is_day,wind_speed_10m,uv_index,cloud_cover,precipitation",
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
  const uvIndex = Math.round(Number(current.uv_index));
  const cloudCover = Math.round(current.cloud_cover ?? 0);
  const precipitation = Number(current.precipitation ?? 0);
  const rainChance = Math.round(
    data.hourly?.precipitation_probability?.[1] ??
      data.hourly?.precipitation_probability?.[0] ??
      0,
  );
  const weather = weatherFromCode(
    current.weather_code,
    current.is_day === 1,
    windSpeed,
    cloudCover,
    precipitation,
  );

  if (weatherTemp) weatherTemp.textContent = `${temperature}\u00b0`;
  if (weatherNote) weatherNote.textContent = weather.note;
  if (weatherWind) weatherWind.textContent = `${windSpeed} mph`;
  if (weatherRain) weatherRain.textContent = `${rainChance}%`;
  if (weatherHumidity) weatherHumidity.textContent = `${humidity}%`;
  if (weatherUv) weatherUv.textContent = uvIndex;
  if (weatherPlace) weatherPlace.textContent = "currently";
  setWeatherIcon(weather.condition, weather.label);

  return {
    isDay: current.is_day === 1,
  };
}

async function loadObservedWeatherCondition(latitude, longitude, isDay) {
  const point = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const headers = {
    Accept: "application/geo+json",
  };
  const pointResponse = await fetch(
    `https://api.weather.gov/points/${encodeURIComponent(point)}`,
    { headers },
  );

  if (!pointResponse.ok) return;

  const pointData = await pointResponse.json();
  const stationsUrl = pointData.properties?.observationStations;

  if (!stationsUrl) return;

  const stationsResponse = await fetch(stationsUrl, { headers });

  if (!stationsResponse.ok) return;

  const stationsData = await stationsResponse.json();
  const nearestStation = stationsData.features?.[0]?.properties?.stationIdentifier;

  if (!nearestStation) return;

  const observationResponse = await fetch(
    `https://api.weather.gov/stations/${encodeURIComponent(nearestStation)}/observations/latest`,
    { headers },
  );

  if (!observationResponse.ok) return;

  const observationData = await observationResponse.json();
  const description = observationData.properties?.textDescription?.trim();
  const timestamp = Date.parse(observationData.properties?.timestamp);
  const observationAge = Date.now() - timestamp;

  if (
    !description ||
    !Number.isFinite(timestamp) ||
    observationAge > 1000 * 60 * 120
  ) {
    return;
  }

  const observedWeather = weatherFromObservation(description, isDay);

  if (!observedWeather) return;

  if (weatherNote) weatherNote.textContent = observedWeather.note;
  setWeatherIcon(observedWeather.condition, observedWeather.label);
}

function hideWeatherAlert() {
  if (!weatherAlert) return;

  weatherAlert.hidden = true;
  weatherAlert.textContent = "";
  weatherAlert.removeAttribute("title");
}

async function loadWeatherAlerts(latitude, longitude) {
  if (!weatherAlert) return;

  const point = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const response = await fetch(
    `https://api.weather.gov/alerts/active?point=${encodeURIComponent(point)}`,
    {
      headers: {
        Accept: "application/geo+json",
      },
    },
  );

  if (!response.ok) {
    hideWeatherAlert();
    return;
  }

  const data = await response.json();
  const severityOrder = {
    Extreme: 4,
    Severe: 3,
    Moderate: 2,
    Minor: 1,
    Unknown: 0,
  };
  const alerts = (data.features || [])
    .map((feature) => feature.properties)
    .filter((alert) => alert?.event)
    .sort(
      (first, second) =>
        (severityOrder[second.severity] || 0) -
        (severityOrder[first.severity] || 0),
    );

  if (!alerts.length) {
    hideWeatherAlert();
    return;
  }

  const primaryAlert = alerts[0];
  const extraAlertCount = alerts.length - 1;
  weatherAlert.textContent = extraAlertCount
    ? `${primaryAlert.event} +${extraAlertCount}`
    : primaryAlert.event;
  weatherAlert.title = primaryAlert.headline || primaryAlert.event;
  weatherAlert.hidden = false;
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
      loadWeather(latitude, longitude)
        .then(({ isDay }) => {
          loadObservedWeatherCondition(latitude, longitude, isDay).catch(
            () => {},
          );
        })
        .catch(() => {
          useFallbackWeather("weather is unavailable");
        });
      loadWeatherAlerts(latitude, longitude).catch(hideWeatherAlert);
    },
    () => {
      useFallbackWeather("allow location for local weather");
      hideWeatherAlert();
    },
    {
      enableHighAccuracy: false,
      maximumAge: 1000 * 60 * 20,
      timeout: 1000 * 10,
    },
  );
}

initWeather();

function initYoutubePlayer() {
  if (!youtubePlayer) return;

  const playlistId = youtubePlayer.dataset.youtubePlaylist;
  const isWebPage = ["http:", "https:"].includes(window.location.protocol);

  if (!playlistId || !isWebPage) {
    youtubePlayer.hidden = true;
    return;
  }

  const playerUrl = new URL("https://www.youtube.com/embed");
  playerUrl.searchParams.set("listType", "playlist");
  playerUrl.searchParams.set("list", playlistId);
  playerUrl.searchParams.set("origin", window.location.origin);
  playerUrl.searchParams.set("widget_referrer", window.location.href);
  playerUrl.searchParams.set("enablejsapi", "1");
  youtubePlayer.src = playerUrl.toString();

  window.onYouTubeIframeAPIReady = () => {
    new window.YT.Player(youtubePlayer, {
      events: {
        onReady() {
          youtubePlayer.closest(".youtube-player")?.classList.add("is-ready");
        },
      },
    });
  };

  const apiScript = document.createElement("script");
  apiScript.src = "https://www.youtube.com/iframe_api";
  apiScript.async = true;
  document.head.append(apiScript);
}

initYoutubePlayer();

const hoverGifs = document.querySelectorAll("[data-gif-src][data-still-src]");
const hoverVideos = document.querySelectorAll("[data-video-src]");
const animationStage = document.querySelector("[data-animation-stage]");
const animationVideoStage = document.querySelector("[data-animation-video-stage]");
const animationStageFrame = document.querySelector("[data-animation-stage-frame]");
const animationGrid = document.querySelector(".animation-grid");

// hides the smaller animations while one of them takes over the main box
function showAnimationStage(image) {
  if (!animationStage || !animationStageFrame || !animationGrid) return;

  if (animationVideoStage) {
    animationVideoStage.pause();
    animationVideoStage.hidden = true;
    animationVideoStage.removeAttribute("src");
    animationVideoStage.removeAttribute("poster");
    animationVideoStage.load();
  }

  animationStage.hidden = false;
  animationStage.src = image.dataset.gifSrc;
  animationStage.alt = image.alt;
  animationStage.classList.toggle(
    "animation-stage-contained",
    image.dataset.stageFit === "contain",
  );
  animationGrid.hidden = true;
  animationStageFrame.hidden = false;
}

function showVideoStage(videoThumb) {
  if (!animationVideoStage || !animationStageFrame || !animationGrid) return;

  if (animationStage) {
    animationStage.hidden = true;
    animationStage.src = videoThumb.dataset.posterSrc || videoThumb.src;
  }

  animationVideoStage.src = videoThumb.dataset.videoSrc;
  animationVideoStage.poster = videoThumb.dataset.posterSrc || videoThumb.src;
  animationVideoStage.hidden = false;
  animationVideoStage.load();
  animationGrid.hidden = true;
  animationStageFrame.hidden = false;
}

function hideAnimationStage() {
  if (!animationStageFrame || !animationGrid) return;

  if (animationVideoStage) {
    animationVideoStage.pause();
    animationVideoStage.hidden = true;
    animationVideoStage.removeAttribute("src");
    animationVideoStage.load();
  }

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

hoverVideos.forEach((videoThumb) => {
  videoThumb.tabIndex = 0;
  videoThumb.addEventListener("mouseenter", () => showVideoStage(videoThumb));
  videoThumb.addEventListener("pointerenter", () => showVideoStage(videoThumb));
  videoThumb.addEventListener("focus", () => showVideoStage(videoThumb));
  videoThumb.addEventListener("click", () => showVideoStage(videoThumb));
});

if (animationStageFrame) {
  animationStageFrame.addEventListener("mouseleave", hideAnimationStage);
  animationStageFrame.addEventListener("pointerleave", hideAnimationStage);
  animationStageFrame.addEventListener("blur", hideAnimationStage);
  animationStageFrame.addEventListener("click", (event) => {
    if (event.target === animationStageFrame || event.target === animationStage) {
      hideAnimationStage();
    }
  });
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
