class WeatherAPI {
    constructor() {
        this.baseURL = CONFIG.BASE_URL;
        this.apiKey = CONFIG.API_KEY;
    }

    async getCoordinates(city) {
        try {
            // Use a free geocoding service
            const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            
            if (!response.ok) {
                throw new Error('Failed to get coordinates');
            }
            
            const data = await response.json();
            
            if (!data.results || data.results.length === 0) {
                throw new Error('City not found');
            }
            
            const result = data.results[0];
            return {
                lat: result.latitude,
                lon: result.longitude,
                name: result.name,
                country: result.country
            };
        } catch (error) {
            console.error('Geocoding error:', error);
            throw new Error('Failed to find city coordinates');
        }
    }



    async getWeatherData(lat, lon) {
        // Try Stormglass API first
        try {
            console.log('Trying Stormglass API...');
            return await this.getStormglassData(lat, lon);
        } catch (error) {
            console.warn('Stormglass API failed, trying fallback...', error);
            // Fallback to Open-Meteo API (free, no quota)
            return await this.getOpenMeteoData(lat, lon);
        }
    }

    async getStormglassData(lat, lon) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 5);

        const params = new URLSearchParams({
            lat: lat,
            lng: lon,
            start: startDate.toISOString(),
            end: endDate.toISOString(),
            params: 'airTemperature,humidity,windSpeed,pressure,cloudCover,precipitation'
        });

        const response = await fetch(`${this.baseURL}/weather/point?${params}`, {
            headers: {
                'Authorization': this.apiKey
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Stormglass API failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return this.processStormglassData(data);
    }

    async getOpenMeteoData(lat, lon) {
        console.log('Using Open-Meteo API as fallback...');
        
        // Get current weather
        const currentResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,cloud_cover&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,cloud_cover&timezone=auto`
        );

        if (!currentResponse.ok) {
            throw new Error('Open-Meteo API request failed');
        }

        const data = await currentResponse.json();
        return this.processOpenMeteoData(data);
    }

    processStormglassData(data) {
    const hourly = data.hours;
    const current = hourly[hourly.length - 1];

    // Group hourly data by day
    const dailyData = {};
    hourly.forEach(hour => {
        const dateKey = new Date(hour.time).toDateString();
        if (!dailyData[dateKey]) {
            dailyData[dateKey] = [];
        }
        dailyData[dateKey].push(hour);
    });

    // Compute daily averages
    const allDays = Object.entries(dailyData).map(([date, hours]) => {
        const temps = hours.map(h => h.airTemperature?.noaa || 0).filter(t => t !== 0);
        const avgTemp = temps.length > 0 ? temps.reduce((a, b) => a + b, 0) / temps.length : 0;

        return {
            date: new Date(date),
            temperature: Math.round(avgTemp),
            description: this.getWeatherDescription(hours[0].cloudCover?.noaa || 0)
        };
    });

    // Get current week's Saturday to next week's Sunday
    const today = new Date();
    const currentDay = today.getDay(); // Sunday = 0, Saturday = 6
    const saturday = new Date(today);
    saturday.setDate(today.getDate() - currentDay + 6); // get this week's Saturday

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(saturday);
        day.setDate(saturday.getDate() + i);
        weekDates.push(day.toDateString());
    }

    // Filter forecast to match Saturday → Sunday of the current week
    const forecast = allDays.filter(day => weekDates.includes(day.date.toDateString()));

    return {
        current: {
            temperature: Math.round(current.airTemperature?.noaa || 0),
            humidity: Math.round(current.humidity?.noaa || 0),
            windSpeed: Math.round((current.windSpeed?.noaa || 0) * 3.6),
            pressure: Math.round(current.pressure?.noaa || 0),
            description: this.getWeatherDescription(current.cloudCover?.noaa || 0),
            feelsLike: Math.round(current.airTemperature?.noaa || 0)
        },
        forecast: forecast
    };
}

    processOpenMeteoData(data) {
        const current = data.current;
        const hourly = data.hourly;
        
        // Get current weather
        const currentWeather = {
            temperature: Math.round(current.temperature_2m),
            humidity: Math.round(current.relative_humidity_2m),
            windSpeed: Math.round(current.wind_speed_10m * 3.6), // Convert m/s to km/h
            pressure: Math.round(current.surface_pressure),
            description: this.getWeatherDescription(current.cloud_cover),
            feelsLike: Math.round(current.temperature_2m)
        };

        // Process forecast (next 5 days)
        const forecast = [];
        const today = new Date();
        
        for (let i = 1; i <= 5; i++) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + i);
            
            // Get data for this day (12:00 PM)
            const dayStart = new Date(targetDate);
            dayStart.setHours(12, 0, 0, 0);
            
            const dayIndex = hourly.time.findIndex(time => 
                new Date(time) >= dayStart
            );
            
            if (dayIndex !== -1) {
                forecast.push({
                    date: targetDate,
                    temperature: Math.round(hourly.temperature_2m[dayIndex]),
                    description: this.getWeatherDescription(hourly.cloud_cover[dayIndex])
                });
            }
        }

        return {
            current: currentWeather,
            forecast: forecast
        };
    }

    getWeatherDescription(cloudCover) {
        if (cloudCover < 20) return 'clear';
        if (cloudCover < 40) return 'partly-cloudy-day';
        if (cloudCover < 80) return 'cloudy';
        return 'cloudy';
    }
} 