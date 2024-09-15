document.addEventListener("DOMContentLoaded", () => {
  let container = document.getElementById("root");
  let getWeatherDataError = "";
  let isCityNameKrasnodar = false;

  // weather and location block
  function createWeatherBlock() {
    const weatherBlock = document.createElement("div");
    const cityElement = document.createElement("h3");
    const temperatureElement = document.createElement("p");
    const conditionElement = document.createElement("p");
    const errorMessage = document.createElement("p");

    errorMessage.textContent = getWeatherDataError;

    weatherBlock.classList.add("weather-block");
    cityElement.classList.add("city-name");
    errorMessage.classList.add("weather-error-message");

    weatherBlock.appendChild(cityElement);
    weatherBlock.appendChild(temperatureElement);
    weatherBlock.appendChild(conditionElement);
    weatherBlock.appendChild(errorMessage);
    container.appendChild(weatherBlock);

    return { cityElement, temperatureElement, conditionElement };
  }

  function getGeolocation() {
    return new Promise((resolve, reject) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
        reject(new Error("Geolocation is not supported by this browser."));
      }
    });
  }

  async function getWeatherData(lat, lon) {
    let copyLat = lat;
    let copyLon = lon;

    if (isCityNameKrasnodar) {
      copyLat = 45.03540000000001;
      copyLon = 38.97530000000001;
    }

    try {
      const url = `https://www.7timer.info/bin/api.pl?lon=${copyLon}&lat=${copyLat}&product=civil&output=json`;
      const response = await fetch(url);
      const data = await response.json();
      getWeatherDataError = "";
      return data;
    } catch (error) {
      getWeatherDataError += `Ошибка получения данных о погоде: "${error.message}" `;
      console.log("getWeatherData error", error.message);
      return error;
    }
  }

  async function getCityName(lat, lon) {
    isCityNameKrasnodar = false;

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const response = await fetch(url);
      const data = await response.json();
      return (
        data.address.city ||
        data.address.town ||
        data.address.village ||
        "Краснодар"
      );
    } catch (error) {
      console.error("Ошибка при определении города:", error.message);
      isCityNameKrasnodar = true;
      return "Краснодар";
    }
  }

  function getWeatherCondition(weatherCode) {
    const conditions = {
      clearday: "Ясный день ☀️",
      clearnight: "Ясная ночь 🌙",
      pcloudyday: "Переменная облачность днем ⛅",
      pcloudynight: "Переменная облачность ночью 🌙☁️",
      mcloudyday: "Облачный день 🌥️",
      mcloudynight: "Облачная ночь 🌙☁️",
      cloudyday: "Пасмурный день ☁️",
      cloudynight: "Пасмурная ночь ☁️",
      humidday: "Влажный день 💧",
      humidnight: "Влажная ночь 💧",
      lightrainday: "Небольшой дождь днем 🌦️",
      lightrainnight: "Небольшой дождь ночью 🌙🌧️",
      oshowerday: "Кратковременные дожди днем 🌦️",
      oshowernight: "Кратковременные дожди ночью 🌙🌧️",
      ishowerday: "Местами дожди днем 🌦️",
      ishowernight: "Местами дожди ночью 🌙🌧️",
      lightsnowday: "Небольшой снег днем 🌨️",
      lightsnownight: "Небольшой снег ночью 🌙❄️",
      rainday: "Дождливый день 🌧️",
      rainnight: "Дождливая ночь 🌙🌧️",
      snowday: "Снежный день ❄️",
      snownight: "Снежная ночь 🌙❄️",
      tsday: "Гроза днем ⛈️",
      tsnight: "Гроза ночью 🌙⛈️",
    };
    return conditions[weatherCode] || "Неизвестно";
  }

  function updateWeatherDisplay(city, weatherData) {
    const { cityElement, temperatureElement, conditionElement } =
      createWeatherBlock();

    const currentData = weatherData.dataseries[0];
    const temperature = currentData.temp2m;
    const condition = getWeatherCondition(currentData.weather);

    cityElement.textContent = city;
    temperatureElement.textContent = `Температура: ${temperature}°C`;
    conditionElement.textContent = `Погода: ${condition}`;
  }

  async function initWeather() {
    try {
      const position = await getGeolocation();
      const { latitude, longitude } = position.coords;

      // Store geolocation in LocalStorage
      localStorage.setItem(
        "userLocation",
        JSON.stringify({ latitude, longitude })
      );

      const [city, weatherData] = await Promise.all([
        getCityName(latitude, longitude),
        getWeatherData(latitude, longitude),
      ]);
      updateWeatherDisplay(city, weatherData);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  // background image block
  function setBackgroundImage() {
    return new Promise((resolve) => {
      const hour = new Date().getHours();
      let imageUrl;

      if (hour >= 0 && hour < 6) {
        imageUrl =
          "https://github.com/digitalSector47/traineeship-test-task/blob/main/images/01.jpg?raw=true";
      } else if (hour >= 6 && hour < 12) {
        imageUrl =
          "https://github.com/digitalSector47/traineeship-test-task/blob/main/images/02.jpg?raw=true";
      } else if (hour >= 12 && hour < 18) {
        imageUrl =
          "https://github.com/digitalSector47/traineeship-test-task/blob/main/images/03.jpg?raw=true";
      } else {
        imageUrl =
          "https://github.com/digitalSector47/traineeship-test-task/blob/main/images/04.jpg?raw=true";
      }

      const img = new Image();
      img.onload = () => {
        container.style.backgroundImage = `url('${imageUrl}')`;
        resolve();
      };
      img.src = imageUrl;
    });
  }

  // Time and Date block
  function createTimeDateBlock() {
    const timeDateBlock = document.createElement("div");
    const timeElement = document.createElement("h1");
    const dateElement = document.createElement("h2");

    timeDateBlock.classList.add("time-date-block");
    timeElement.classList.add("time");
    dateElement.classList.add("date");

    timeDateBlock.appendChild(timeElement);
    timeDateBlock.appendChild(dateElement);
    container.appendChild(timeDateBlock);

    return { timeElement, dateElement };
  }

  function updateTimeDate() {
    const { timeElement, dateElement } = createTimeDateBlock();

    function update() {
      const now = new Date();

      // Update time
      const time = now.toLocaleTimeString("ru-RU", { hour12: false });
      timeElement.textContent = time;

      // Update date
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const date = now.toLocaleDateString("ru-RU", options);
      dateElement.textContent = date;
    }

    update(); // Initial update
    setInterval(update, 1000); // Update every second
  }

  // Task block
  function createTaskBlock() {
    const taskBlock = document.createElement("div");
    const taskInput = document.createElement("input");
    const errorMessage = document.createElement("p");
    const taskList = document.createElement("ul");
    const deleteCompletedButton = document.createElement("button");

    taskBlock.classList.add("task-block");
    taskInput.classList.add("task-input");
    errorMessage.classList.add("error-message");
    taskList.classList.add("task-list");
    deleteCompletedButton.classList.add("delete-completed-btn");

    deleteCompletedButton.textContent = "Удалить выполненные задачи";
    taskInput.type = "text";
    taskInput.placeholder = "Введите новую задачу";

    taskBlock.append(taskInput, errorMessage, taskList, deleteCompletedButton);
    container.appendChild(taskBlock);

    return { taskInput, taskList, deleteCompletedButton, errorMessage };
  }

  function initTaskManager() {
    const { taskInput, taskList, deleteCompletedButton, errorMessage } =
      createTaskBlock();
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    function saveTasks() {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function createTaskElement(task, index) {
      const li = document.createElement("li");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = task.completed;
      checkbox.addEventListener("change", () => toggleTask(index));

      const span = document.createElement("span");
      span.textContent = task.title;
      if (task.completed) {
        span.classList.add("completed");
      }

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "×";
      deleteButton.classList.add("delete-task-btn");
      deleteButton.addEventListener("click", () => deleteTask(index));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(deleteButton);

      return li;
    }

    function renderTasks() {
      taskList.innerHTML = "";
      tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index);
        taskList.appendChild(taskElement);
      });
    }

    function addTask(title) {
      tasks.push({ title, completed: false });
      saveTasks();
      renderTasks();
    }

    function toggleTask(index) {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    }

    function deleteTask(index) {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    }

    function deleteCompletedTasks() {
      tasks = tasks.filter((task) => !task.completed);
      saveTasks();
      renderTasks();
    }

    taskInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        if (taskInput.value.trim() === "") {
          errorMessage.textContent = "Задача не может быть пустой";
        } else {
          addTask(taskInput.value.trim());
          taskInput.value = "";
          errorMessage.textContent = "";
        }
      }
    });

    taskInput.addEventListener("input", () => {
      errorMessage.textContent = "";
    });

    deleteCompletedButton.addEventListener("click", deleteCompletedTasks);

    renderTasks();
  }

  // Initialization
  async function initializeApp() {
    await setBackgroundImage();
    initWeather();
    updateTimeDate();
    initTaskManager();
  }

  // Initialization
  initializeApp();

  // Update background image every minute
  setInterval(setBackgroundImage, 60000);
});
