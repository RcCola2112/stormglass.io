class WeatherData {
    constructor() {
        this.currentWeather = null;
        this.forecast = [];
        this.location = null;
    }

    setLocation(location) {
        this.location = location;
    }

    setWeatherData(weatherData) {
        this.currentWeather = weatherData.current;
        this.forecast = weatherData.forecast;
    }

    getCurrentWeather() {
        return this.currentWeather;
    }

    getForecast() {
        return this.forecast;
    }

    getLocation() {
        return this.location;
    }

    formatDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    formatShortDate(date) {
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    getWeatherIcon(description) {
        return WEATHER_ICONS[description] || '🌤️';
    }

    getTemperatureColor(temp) {
        if (temp >= 25) return '#e74c3c'; // Hot
        if (temp >= 15) return '#f39c12'; // Warm
        if (temp >= 5) return '#3498db';  // Cool
        return '#9b59b6'; // Cold
    }

    isValid() {
        return this.currentWeather && this.forecast.length > 0;
    }
} 