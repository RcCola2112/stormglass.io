class WeatherApp {
    constructor() {
        this.api = new WeatherAPI();
        this.ui = new WeatherUI();
        this.weatherData = new WeatherData();
        
        this.init();
    }

    init() {
        this.ui.bindSearchEvent((city) => this.searchWeather(city));
        
        // Load default weather on startup
        this.searchWeather(CONFIG.DEFAULT_LOCATION);
    }

    async searchWeather(city) {
        try {
            this.ui.showLoading();
            this.ui.setInputValue(city);

            // Get coordinates for the city
            const location = await this.api.getCoordinates(city);
            this.weatherData.setLocation(location);

            // Get weather data
            const weatherData = await this.api.getWeatherData(location.lat, location.lon);
            this.weatherData.setWeatherData(weatherData);

            // Update UI
            this.ui.updateCurrentWeather(this.weatherData);
            this.ui.updateForecast(this.weatherData);
            this.ui.showWeather();

        } catch (error) {
            console.error('Error fetching weather:', error);
            this.ui.showError(error.message || 'Failed to fetch weather data');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
}); 