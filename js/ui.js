class WeatherUI {
    constructor() {
        this.elements = {
            loading: document.getElementById('loading'),
            error: document.getElementById('error'),
            errorMessage: document.getElementById('errorMessage'),
            weatherContainer: document.getElementById('weatherContainer'),
            cityName: document.getElementById('cityName'),
            currentDate: document.getElementById('currentDate'),
            currentTemp: document.getElementById('currentTemp'),
            weatherDescription: document.getElementById('weatherDescription'),
            forecastList: document.getElementById('forecastList'),
            locationInput: document.getElementById('locationInput'),
            searchBtn: document.getElementById('searchBtn')
        };
    }

    showLoading() {
        this.hideAll();
        this.elements.loading.classList.remove('hidden');
    }

    showError(message) {
        this.hideAll();
        this.elements.errorMessage.textContent = message;
        this.elements.error.classList.remove('hidden');
    }

    showWeather() {
        this.hideAll();
        this.elements.weatherContainer.classList.remove('hidden');
    }

    hideAll() {
        this.elements.loading.classList.add('hidden');
        this.elements.error.classList.add('hidden');
        this.elements.weatherContainer.classList.add('hidden');
    }

    updateCurrentWeather(weatherData, location) {
        const current = weatherData.getCurrentWeather();
        const loc = weatherData.getLocation();

        this.elements.cityName.textContent = loc.name;
        this.elements.currentDate.textContent = weatherData.formatDate(new Date());
        this.elements.currentTemp.textContent = current.temperature;
        this.elements.weatherDescription.textContent = current.description.replace('-', ' ');

        // Update temperature color
        this.elements.currentTemp.style.color = weatherData.getTemperatureColor(current.temperature);
    }

    updateForecast(weatherData) {
        const forecast = weatherData.getForecast();
        this.elements.forecastList.innerHTML = '';

        forecast.forEach(day => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            forecastItem.innerHTML = `
                <div class="forecast-date">${weatherData.formatShortDate(day.date)}</div>
                <div class="forecast-temp" style="color: ${weatherData.getTemperatureColor(day.temperature)}">
                    ${day.temperature}°C
                </div>
                <div class="forecast-desc">
                    ${weatherData.getWeatherIcon(day.description)} ${day.description.replace('-', ' ')}
                </div>
            `;

            this.elements.forecastList.appendChild(forecastItem);
        });
    }

    bindSearchEvent(callback) {
        const search = () => {
            const city = this.elements.locationInput.value.trim();
            if (city) {
                callback(city);
            }
        };

        this.elements.searchBtn.addEventListener('click', search);
        this.elements.locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                search();
            }
        });
    }

    clearInput() {
        this.elements.locationInput.value = '';
    }

    setInputValue(value) {
        this.elements.locationInput.value = value;
    }
} 