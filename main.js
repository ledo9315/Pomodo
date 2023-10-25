/* Background */
const forwardIcon = document.querySelector(".forward-icon");
changeBackground();
setInterval(changeBackground, intervalInMinutes(5));

async function changeBackground() {
  try {
    const width = 4096;
    const height = 2160;

    const response = await fetch(
      `https://source.unsplash.com/${width}x${height}/?nature/landscape`
    );

    console.log(response);
    const imageURL = response.url;
    document.body.style.backgroundImage = `url(${imageURL})`;
  } catch (error) {
    console.error("Fehler beim Laden des Hintergrundbilds:", error);
  }
}

function intervalInMinutes(minutes) {
  return minutes * 1000 * 60;
}

forwardIcon.addEventListener("click", function () {
  changeBackground();
});

/* Weather */
const apiKey = "9ab38fc6ee3445fe8ab120343230310";
const form = document.querySelector("#form");
const input = document.querySelector("#inputCity");
const weather = document.querySelector(".weather");
const weatherInfo = document.querySelector(".weather-info");
const changeCitybutton = document.querySelector(".change-city-button");
const weatherDataWrapper = document.querySelector(".weather-data-wrapper");

getWeatherByGeolocation();

async function getWeather(city) {
  const query = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no&lang=en`;
  const response = await fetch(query);
  const data = await response.json();
  console.log(data);

  if (data.error) {
    showErrorMessage(data.error.message);
  } else {
    const weatherData = {
      name: data.location.name,
      country: data.location.country,
      temp: data.current.temp_c,
      condition: data.current.condition.text,
      icon: data.current.condition.icon,
      feelslike: data.current.feelslike_c,
      wind: data.current.wind_kph,
      humidity: data.current.humidity,
    };
    showCard(weatherData);
    showCardInfo(weatherData);
  }
}

function showErrorMessage(message) {
  const card = `<main class="card">${message}</main>`;
  weather.insertAdjacentHTML("beforeend", card);
}

function showCard(weatherData) {
  const card = `
    <div class="weather-data-wrapper">
      <div class="temp">${weatherData.temp}<sup>°</sup></div>
      <img class="weather-icon" src="${weatherData.icon}"></img>
    </div>
    <div class="cityName">${weatherData.name}</div>
  `;
  weather.insertAdjacentHTML("beforeend", card);
}

function showCardInfo(weatherData) {
  const infoCard = `
    <div class="weather-info-wrapper">
      <div class="weather-info__left">
        <div class="weather-info__left__city">${weatherData.name}</div>
        <div class="weather-info__left__status">${weatherData.condition}</div>
        <div class="weather-info__left__wrapper">
          <img class="weather-info__left__wrapper__icon" src="${weatherData.icon}" alt="">
          <div class="weather-info__left__wrapper__temp">${weatherData.temp}<sup>°</sup></div>
        </div>
      </div>
      <div class="weather-info__right">
        <div class="feels-like"><span>Feels like</span> ${weatherData.feelslike}<sup>°</sup></div>
        <div class="humidity"><span>Humidity</span> ${weatherData.humidity}%</div>
        <div class="wind"><span>Wind</span> ${weatherData.wind}km/h</div>
      </div>
    </div>
  `;
  weatherInfo.insertAdjacentHTML("afterbegin", infoCard);
}

function getWeatherByGeolocation() {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no&lang=en`
      )
        .then((response) => response.json())
        .then((data) => {
          const city = data.location.name;
          getWeather(city);
        });
    });
  }
}

weather.addEventListener("click", function () {
  weatherInfo.classList.toggle("hidden");
});

changeCitybutton.addEventListener("click", function () {
  changeCitybutton.classList.add("hidden");

  const inputCityHTML = `
  <div class="form-container">
  <form id="changeCityForm" action="javascript:void(0);">
    <input type="text" placeholder="Your City..." id="inputCity" name="inputCity" required>
    <button type="submit">Send</button>
  </form>
  <img class="close-icon" src="./img/icons/close-icon.svg" alt="" />
  </div>  
  `;

  weather.insertAdjacentHTML("afterend", inputCityHTML);

  const formContainer = document.querySelector(".form-container");
  const closeIcon = document.querySelector(".close-icon");

  closeIcon.addEventListener("click", function () {
    formContainer.remove();
    changeCitybutton.classList.remove("hidden");
    closeIcon.remove();
  });

  formContainer.addEventListener("submit", function (e) {
    e.preventDefault();
    const newCity = document.getElementById("inputCity").value;

    weather.innerHTML = "";
    weatherInfo.innerHTML = "";

    getWeather(newCity);

    formContainer.remove();
    changeCitybutton.classList.remove("hidden");
  });
});

/* Clock */
const clockElement = document.getElementById("clock");
const dateElement = document.getElementById("date");

function updateClock() {
  const now = new Date();

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const dayOfWeek = daysOfWeek[now.getDay()];

  const date = now.toLocaleDateString("de-DE");

  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const currentTime = `${hours}:${minutes}`;

  clockElement.innerText = currentTime;
  dateElement.innerText = `${dayOfWeek}, ${date}`;
}

setInterval(updateClock, 1000);
updateClock();

/* Pomodoro */
const pomodoroContainer = document.querySelector(".pomodoro-container");
const clock = document.querySelector(".clock");
const switchIcon = document.querySelector(".switch-icon");
const alarmSound = document.getElementById("alarm");
const pomodoroButton = document.querySelector("#pomodoro-button");
const shortBreakButton = document.querySelector("#short-break-button");
const longBreakButton = document.querySelector("#long-break-button");
const startButton = document.querySelector("#start-button");
const settingsIcon = document.querySelector(".settings-icon");
const settings = document.querySelector(".settings");
const refreshIcon = document.querySelector(".refresh-icon");
const timer = document.querySelector(".timer");
const sessionSettingsForm = document.getElementById("session-settings-form");
const clockIcon = document.querySelector(".clock-icon");
const pomodoroIcon = document.querySelector(".pomodoro-icon");
const switchSettings = document.querySelector(".switch-setting-container");

let isRunning = false;
let countdown;
let pomodoroSessionTime = Number(
  document.querySelector("#pomodoro-duration").value
);
let shortBreakSessionTime = Number(
  document.querySelector("#short-break-duration").value
);
let longBreakSessionTime = Number(
  document.querySelector("#long-break-duration").value
);
let minutes = pomodoroSessionTime;
let seconds = 0;

const sessionTime = {
  minutes: pomodoroSessionTime,
  seconds: seconds,
};

if (localStorage.getItem("pomodoroSessionTime")) {
  pomodoroSessionTime = Number(localStorage.getItem("pomodoroSessionTime"));
  shortBreakSessionTime = Number(localStorage.getItem("shortBreakSessionTime"));
  longBreakSessionTime = Number(localStorage.getItem("longBreakSessionTime"));

  document.querySelector("#pomodoro-duration").value = pomodoroSessionTime;
  document.querySelector("#short-break-duration").value = shortBreakSessionTime;
  document.querySelector("#long-break-duration").value = longBreakSessionTime;

  minutes = pomodoroSessionTime;
  sessionTime.minutes = pomodoroSessionTime;
  updateTimerDisplay(pomodoroSessionTime);
} else {
  updateTimerDisplay(minutes);
}

startButton.addEventListener("click", toggleTimer);
refreshIcon.addEventListener("click", resetTimer);

settingsIcon.addEventListener("click", function () {
  settings.classList.toggle("hidden");
  switchSettings.classList.add("hidden");
});

[pomodoroButton, shortBreakButton, longBreakButton].forEach((button) => {
  button.addEventListener("click", function () {
    setPomodoroSession(button);
  });
});

switchIcon.addEventListener("click", function () {
  switchSettings.classList.toggle("hidden");
  settings.classList.add("hidden");
});

clockIcon.addEventListener("click", function () {
  clock.classList.remove("hidden");
  dateElement.classList.remove("hidden");
  pomodoroContainer.classList.add("hidden");

  /* wieder schließen */
  switchSettings.classList.add("hidden");
});

pomodoroIcon.addEventListener("click", function () {
  pomodoroContainer.classList.remove("hidden");
  clock.classList.add("hidden");
  dateElement.classList.add("hidden");

  /* wieder schließen */
  switchSettings.classList.add("hidden");
});

function setPomodoroSession(sessionButton) {
  resetTimer();

  const buttons = document.querySelectorAll('[data="buttons"]');
  buttons.forEach((button) => {
    button.classList.remove("button--active");
  });
  sessionButton.classList.add("button--active");

  if (sessionButton === pomodoroButton) {
    sessionTime.minutes = pomodoroSessionTime;
  } else if (sessionButton === shortBreakButton) {
    sessionTime.minutes = shortBreakSessionTime;
  } else {
    sessionTime.minutes = longBreakSessionTime;
  }
  minutes = sessionTime.minutes;
  updateTimerDisplay(minutes);
}

function toggleTimer() {
  isRunning = !isRunning;
  updateStartButtonText();
  if (isRunning) {
    startTimer();
  } else pauseTimer();
}

function startTimer() {
  countdown = setInterval(() => {
    if (minutes === 0 && seconds === 0) {
      playAlarm();
      clearInterval(countdown);
    } else if (seconds === 0) {
      minutes--;
      seconds = 59;
    } else {
      seconds--;
    }
    updateTimerDisplay(minutes, seconds);
  }, 1000);
}

function pauseTimer() {
  clearInterval(countdown);
}

function resetTimer() {
  isRunning = false;
  updateStartButtonText();
  clearInterval(countdown);
  minutes = sessionTime.minutes;
  seconds = sessionTime.seconds;
  updateTimerDisplay(minutes);
}

sessionSettingsForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const settingsPomodoroDuration =
    document.querySelector("#pomodoro-duration").value;

  const settingsShortBreakDuration = document.querySelector(
    "#short-break-duration"
  ).value;

  const settingsLongBreakDuration = document.querySelector(
    "#long-break-duration"
  ).value;

  settings.classList.add("hidden");

  const activeButton = document.querySelector(".button--active");

  if (activeButton === pomodoroButton) {
    minutes = pomodoroSessionTime;
  } else if (activeButton === shortBreakButton) {
    minutes = shortBreakSessionTime;
  } else if (activeButton === longBreakButton) {
    minutes = longBreakSessionTime;
  }

  pomodoroSessionTime = Number(settingsPomodoroDuration);
  shortBreakSessionTime = Number(settingsShortBreakDuration);
  longBreakSessionTime = Number(settingsLongBreakDuration);

  // Speichere die Einstellungen im localStorage
  localStorage.setItem("pomodoroSessionTime", pomodoroSessionTime);
  localStorage.setItem("shortBreakSessionTime", shortBreakSessionTime);
  localStorage.setItem("longBreakSessionTime", longBreakSessionTime);

  updateTimerDisplay(minutes);
  resetTimer();
  setPomodoroSession(activeButton);
});

function updateTimerDisplay(minutes, seconds = 0) {
  const time =
    seconds >= 10 ? `${minutes}:${seconds}` : `${minutes}:0${seconds}`;
  timer.textContent = time;
}

function updateStartButtonText() {
  startButton.textContent = isRunning ? "pause" : "start";
}

function playAlarm() {
  alarmSound.play();
}
