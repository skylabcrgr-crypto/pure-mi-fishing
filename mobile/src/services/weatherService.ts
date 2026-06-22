// Weather Service — Mock Adapter
// TODO: Replace with OpenWeatherMap API (free tier: 1,000 calls/day)
// Endpoint: https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={key}

import type { WeatherData } from '../types';

const MOCK_WEATHER: WeatherData = {
  tempF: 72,
  feelsLikeF: 70,
  description: 'Partly Cloudy',
  windSpeedMph: 12,
  windDirection: 'SW',
  humidityPct: 58,
  iconCode: 'partly-cloudy',
};

export async function fetchWeather(
  _lat: number,
  _lon: number,
): Promise<WeatherData> {
  // TODO: Replace with real API call:
  // const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${_lat}&lon=${_lon}&appid=${API_KEY}&units=imperial`);
  // const data = await res.json();
  // return parseOpenWeatherResponse(data);

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { ...MOCK_WEATHER };
}

export async function fetchWeatherForecast(_lat: number, _lon: number) {
  // TODO: Replace with 5-day forecast API call
  await new Promise((resolve) => setTimeout(resolve, 400));
  return [];
}
