//https://api.open-meteo.com/v1/forecast?latitude=38.112&longitude=13.361&hourly=temperature_2m,precipitation,weathercode,windspeed_10m,winddirection_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_hours,windspeed_10m_max&timezone=Europe%2FBerlin
const forecastContainer = document.getElementById('forecast-cnt');
const forecastDetails = document.getElementById('forecast-details');
const searchButton = document.getElementById('search');
const cityFullName = document.getElementById('cityFullName');
const cityInput = document.getElementById('city');
const weather_code = [];
let longitude, latitude, fullCityName;
let data;

const getData = async () => {
  const response = await fetch(
    'https://api.open-meteo.com/v1/forecast?latitude=' +
      latitude +
      '&longitude=' +
      longitude +
      '&hourly=temperature_2m,precipitation,weathercode,windspeed_10m,winddirection_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_hours,windspeed_10m_max&timezone=Europe%2FBerlin'
  );
  data = await response.json();
  console.log(data);
  resetView();
  printData();
};

const resetView = () => {
  forecastContainer.innerHTML = '';
  cityFullName.innerHTML = '';
};

const getCoordinates = async () => {
  resetView();
  forecastContainer.textContent = 'Retrieving data...';

  const response = await fetch(
    'https://api.teleport.org/api/cities/?search=' +
      cityInput.value +
      '&embed=city%3Asearch-results%2Fcity%3Aitem'
  );

  const geoLocalizationData = await response.json();
  try {
    const coordinates =
      geoLocalizationData._embedded['city:search-results'][0]._embedded[
        'city:item'
      ].location.latlon;
    fullCityName =
      geoLocalizationData._embedded['city:search-results'][0]
        .matching_full_name;
    latitude = coordinates.latitude.toFixed(3);
    longitude = coordinates.longitude.toFixed(3);

    getData();
  } catch (err) {
    window.alert('Ops, something gone wrong! :(\n\nNO CITY FOUND\n\n' + err);
    resetView();
  }
};

function printData() {
  const {
    time: daysArray,
    weathercode: weatherCodeArray,
    temperature_2m_max: dailyMaxTempsArray,
    temperature_2m_min: dailyMinTempsArray,
    precipitation_sum: dailyPrecipitationsArray,
    windspeed_10m_max: maxWindSpeedArray,
    sunrise: sunriseArray,
    sunset: sunsetArray,
  } = data.daily;

  daysArray.forEach((date, index) => {
    const day = document.createElement('div');
    const list = document.createElement('ul');
    const weatherIcon = document.createElement('img');
    const dailyMaxTemp = document.createElement('li');
    const dailyMinTemp = document.createElement('li');
    const dailyPrecipitations = document.createElement('li');
    const maxWindSpeed = document.createElement('li');
    const sunrise = document.createElement('li');
    const sunset = document.createElement('li');
    const moreBtn = createMoreBtn();
    const details = createDetails(index);

    details.style.display = 'none';
    const shortDate = date.split('-');

    day.innerHTML = '<h3>Day: ' + shortDate[1] + '-' + shortDate[2] + '</h3>';

    weatherIcon.src = weatherCodeParser(weatherCodeArray[index]);

    dailyPrecipitations.innerHTML =
      'Precipitations: ' + dailyPrecipitationsArray[index] + 'mm';

    maxWindSpeed.innerHTML =
      'Max wind speed: ' + maxWindSpeedArray[index] + 'km/h';

    dailyMaxTemp.innerHTML = 'Max temp: ' + dailyMaxTempsArray[index] + '°C';
    dailyMinTemp.innerHTML = 'Min temp: ' + dailyMinTempsArray[index] + '°C';

    sunrise.innerHTML = 'Sunrise: ' + sunriseArray[index].split('T').slice(1);
    sunset.innerHTML = 'Sunset: ' + sunsetArray[index].split('T').slice(1);

    list.appendChild(weatherIcon);
    list.appendChild(dailyMaxTemp);
    list.appendChild(dailyMinTemp);
    list.appendChild(dailyPrecipitations);
    list.appendChild(maxWindSpeed);
    list.appendChild(sunrise);
    list.appendChild(sunset);
    list.appendChild(moreBtn);
    list.appendChild(details);

    day.appendChild(list);
    forecastContainer.appendChild(day);
  });
}

function createMoreBtn() {
  const button = document.createElement('button');
  button.textContent = 'Details...';
  button.addEventListener('click', showDetail);

  return button;
}

function createDetails(dayIndex) {
  const {
    time: hoursArray,
    weathercode: weatherCodeArray,
    temperature_2m: hourlyTempsArray,
    precipitation: hourlyPrecipitationsArray,
    windspeed_10m: windSpeedArray,
    winddirection_10m: windDirectionArray,
  } = data.hourly;

  const dayHours = document.createElement('div');

  hoursArray.slice(dayIndex * 24, dayIndex * 24 + 24).forEach((time, index) => {
    const hour = document.createElement('div');
    const list = document.createElement('ul');
    const weatherIcon = document.createElement('img');
    const temperature = document.createElement('li');
    const precipitation = document.createElement('li');
    const windSpeed = document.createElement('li');
    const windDirection = document.createElement('li');

    hour.innerHTML = '<h4>Hour: ' + time.split('T').slice(1) + '</h4>';
    weatherIcon.src = weatherCodeParser(
      weatherCodeArray.slice(dayIndex * 24, dayIndex * 24 + 24)[index]
    );
    temperature.innerHTML =
      'Temp: ' +
      hourlyTempsArray.slice(dayIndex * 24, dayIndex * 24 + 24)[index] +
      '°C';
    precipitation.innerHTML =
      'Precipitations: ' +
      hourlyPrecipitationsArray.slice(dayIndex * 24, dayIndex * 24 + 24)[
        index
      ] +
      'mm';
    windSpeed.innerHTML =
      'Wind speed: ' +
      windSpeedArray.slice(dayIndex * 24, dayIndex * 24 + 24)[index] +
      'km/h';
    windDirection.innerHTML =
      'Wind direction: ' +
      windDirectionArray.slice(dayIndex * 24, dayIndex * 24 + 24)[index] +
      '°';

    list.appendChild(weatherIcon);
    list.appendChild(temperature);
    list.appendChild(precipitation);
    list.appendChild(windSpeed);
    list.appendChild(windDirection);

    hour.appendChild(list);
    dayHours.appendChild(hour);
  });
  return dayHours;
}

function showDetail(ev) {
  forecastDetails.innerHTML = ev.currentTarget.nextSibling.innerHTML;
}

function weatherCodeParser(weatherCode) {
  if (weatherCode == 0) {
    return 'https://cdn-icons-png.flaticon.com/512/1163/1163662.png';
  } else if (weatherCode >= 1 && weatherCode <= 3) {
    return 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png';
  } else if (weatherCode >= 45 && weatherCode <= 48) {
    return 'https://cdn-icons-png.flaticon.com/512/1163/1163640.png';
  } else if (weatherCode >= 51 && weatherCode <= 55) {
    return 'https://cdn-icons-png.flaticon.com/512/1163/1163626.png';
  } else if (weatherCode >= 61 && weatherCode <= 65) {
    return 'https://cdn-icons-png.flaticon.com/512/1163/1163627.png';
  } else if (weatherCode >= 80 && weatherCode <= 82) {
    return 'https://cdn-icons-png.flaticon.com/512/1163/1163657.png';
  }
}

searchButton.addEventListener('click', getCoordinates);
