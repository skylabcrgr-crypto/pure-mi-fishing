// USGS Water Resources Service — Mock Adapter
// TODO: Replace with USGS NWIS API (free, no key required)
// Stream gauge: https://waterservices.usgs.gov/nwis/iv/?sites={siteNo}&parameterCd=00060,00065&format=json
// Detroit River gauge: Site 04165500 (Detroit River at Detroit)

export interface WaterGaugeReading {
  siteNo: string;
  siteName: string;
  flowCfs?: number;
  gagingHeightFt?: number;
  waterTempC?: number;
  timestamp: string;
}

const MOCK_GAUGE: WaterGaugeReading = {
  siteNo: '04165500',
  siteName: 'Detroit River at Detroit, MI',
  flowCfs: 186000,
  gagingHeightFt: 2.31,
  waterTempC: 18.3,
  timestamp: new Date().toISOString(),
};

export async function fetchGaugeReading(siteNo: string): Promise<WaterGaugeReading> {
  // TODO: Replace with real USGS API:
  // const url = `https://waterservices.usgs.gov/nwis/iv/?sites=${siteNo}&parameterCd=00060,00065&format=json`;
  // const res = await fetch(url);
  // const data = await res.json();
  // return parseUSGSResponse(data);

  await new Promise((resolve) => setTimeout(resolve, 350));
  return { ...MOCK_GAUGE, siteNo };
}

export async function fetchWaterTemperature(_lat: number, _lon: number): Promise<number | null> {
  // TODO: Replace with real gauge lookup by coordinates
  await new Promise((resolve) => setTimeout(resolve, 300));
  return 18.3; // Celsius
}

// Convert to Fahrenheit
export const celsiusToFahrenheit = (c: number): number => Math.round(c * 9 / 5 + 32);
