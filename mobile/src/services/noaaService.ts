// NOAA Service — Mock Adapter
// TODO: Replace with NOAA National Weather Service API (free, no key required)
// Marine forecast: https://api.weather.gov/gridpoints/{office}/{x},{y}/forecast
// Alerts: https://api.weather.gov/alerts/active?zone=MIZ075

export interface NOAAForecast {
  period: string;
  temp: number;
  windSpeed: string;
  shortForecast: string;
  detailedForecast: string;
}

const MOCK_FORECAST: NOAAForecast[] = [
  {
    period: 'Tonight',
    temp: 60,
    windSpeed: '5 to 10 mph',
    shortForecast: 'Partly Cloudy',
    detailedForecast: 'Partly cloudy, with a low around 60. Southwest wind 5 to 10 mph.',
  },
  {
    period: 'Tomorrow',
    temp: 76,
    windSpeed: '10 to 15 mph',
    shortForecast: 'Mostly Sunny',
    detailedForecast: 'Mostly sunny, with a high near 76. Southwest wind 10 to 15 mph. Good fishing conditions.',
  },
];

export async function fetchNOAAForecast(_lat: number, _lon: number): Promise<NOAAForecast[]> {
  // TODO: Replace with real NOAA API:
  // const pointRes = await fetch(`https://api.weather.gov/points/${_lat},${_lon}`);
  // const { forecastUrl } = await pointRes.json().properties;
  // const forecastRes = await fetch(forecastUrl);
  // return forecastRes.json().properties.periods;

  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_FORECAST;
}

export async function fetchActiveAlerts(_zone: string) {
  // TODO: Replace with https://api.weather.gov/alerts/active?zone={_zone}
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [];
}
