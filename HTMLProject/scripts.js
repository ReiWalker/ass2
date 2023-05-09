const countrySelect = document.getElementById('country');
const holidayList = document.getElementById('holiday-list');
const areaSelect = document.getElementById('area');
const selectedHolidaySelect = document.getElementById('selected-holiday');
const submitBtn = document.getElementById('submit-btn');
const weatherInfo = document.getElementById('weather-info');
const accommodationInfo = document.getElementById('accommodation-info');

const calendarificApiKey = "7dd32dc199f66642d5bff6b408e13ac22546f68e";
const weatherApiKey = "0d5dfa35ee944ca8b8b143139230805";
const rapidAPIKey = "8e8e3417c5msh689bd46a06f1a03p1e1481jsnf6da05056b4f";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();

// 获取国家列表
fetch(`https://calendarific.com/api/v2/countries?api_key=${calendarificApiKey}`)
  .then(response => response.json())
  .then(data => {
    data.response.countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country['iso-3166'];
      option.textContent = country.country_name;
      countrySelect.appendChild(option);
    });
  });

countrySelect.addEventListener('change', getHolidays);
countrySelect.addEventListener('change', getAreas);

function getHolidays() {
  const countryCode = countrySelect.value;
  selectedHolidaySelect.innerHTML = '';

  fetch(`https://calendarific.com/api/v2/holidays?api_key=${calendarificApiKey}&country=${countryCode}&year=${currentYear}`)
    .then(response => response.json())
    .then(data => {
      data.response.holidays.forEach(holiday => {
        const option = document.createElement('option');
        option.value = holiday.date.iso;
        option.textContent = `${holiday.name} - ${holiday.date.iso}`;
        selectedHolidaySelect.appendChild(option);
      });
    });
}


function getAreas() {
  const countryCode = countrySelect.value;
  areaSelect.innerHTML = '';

  // 使用GeoDB Cities API获取地区数据
  fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/countries/${countryCode}/regions?limit=10`, {
    headers: {
      'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
      'X-RapidAPI-Key': rapidAPIKey,
    },
  })
    .then(response => response.json())
    .then(data => {
      data.data.forEach(region => {
        const option = document.createElement('option');
        option.value = region.name;
        option.textContent = region.name;
        areaSelect.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error fetching area data:', error);
    });
}


submitBtn.addEventListener('click', async () => {
  const selectedArea = areaSelect.value;
  const selectedHoliday = selectedHolidaySelect.value;

  // 获取天气信息
  fetch(`https://api.weatherapi.com/v1/forecast.json?key=${weatherApiKey}&q=${selectedArea}&days=10`)
    .then(response => response.json())
    .then(weatherData => {
      const forecast = weatherData.forecast.forecastday.find(day => day.date === selectedHoliday);

      if (forecast) {
        weatherInfo.innerHTML = `Temperature: ${forecast.day.avgtemp_c}°C<br>Weather: ${forecast.day.condition.text}`;
      } else {
        weatherInfo.innerHTML = "Weather information is not available for the selected date.";
      }
    })
    .catch(error => {
      console.error("Error fetching weather data:", error);
    });

  // 获取住宿信息
  const url = `https://hotels4.p.rapidapi.com/locations/v3/search?q=${selectedArea}&locale=en_US&langid=1033&siteid=300000001`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': rapidAPIKey,
      'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    accommodationInfo.innerHTML = '';

    result.sr.forEach(location => {
      if (location.type === "HOTEL") {
        const listItem = document.createElement('li');
        listItem.textContent = `${location.regionNames.primaryDisplayName} - ${location.regionNames.secondaryDisplayName}`;
        accommodationInfo.appendChild(listItem);
      }
    });

  } catch (error) {
    console.error("Error fetching accommodation data:", error);
  }
});

