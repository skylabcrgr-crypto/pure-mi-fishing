// Michigan DNR Service — Mock Adapter
// TODO: Replace with DNR Open Data API when available
// DNR regulations PDF: https://www.michigan.gov/dnr/things-to-do/fishing/regulations
// Note: Michigan DNR does not currently expose a public REST API for regulations.
// Future: scrape or use an unofficial aggregator with appropriate caching.

export interface DNRNotice {
  id: string;
  title: string;
  body: string;
  effectiveDate: string;
  species?: string[];
  waterbodies?: string[];
  link: string;
}

const MOCK_NOTICES: DNRNotice[] = [
  {
    id: 'dnr-notice-1',
    title: '2025-26 Fishing Guide Available',
    body: 'The 2025-2026 Michigan Fishing Guide is now available at michigan.gov/dnr. Key changes include updated walleye size limits on select waterways.',
    effectiveDate: '2025-03-01',
    link: 'https://www.michigan.gov/dnr/things-to-do/fishing/regulations',
  },
  {
    id: 'dnr-notice-2',
    title: 'Detroit River Walleye Season Reminder',
    body: 'Reminder: The Detroit River has special walleye regulations including a 1-fish-over-20-inch rule. Verify current rules before fishing.',
    effectiveDate: '2025-04-15',
    species: ['walleye'],
    waterbodies: ['detroit-river'],
    link: 'https://www.michigan.gov/dnr/things-to-do/fishing/regulations',
  },
];

export async function fetchDNRNotices(_waterbodyId?: string): Promise<DNRNotice[]> {
  // TODO: Replace with real DNR API or RSS feed when available
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (_waterbodyId) {
    return MOCK_NOTICES.filter(
      (n) => !n.waterbodies || n.waterbodies.includes(_waterbodyId),
    );
  }
  return MOCK_NOTICES;
}

export async function fetchLicenseTypes() {
  // TODO: Replace with DNR license API
  // Official purchase URL: https://www.michigan.gov/dnr/licenses-and-permits/fishing-licenses
  await new Promise((resolve) => setTimeout(resolve, 200));
  return [
    { name: 'Annual – Resident', price: '$26', link: 'https://www.michigan.gov/dnr/licenses-and-permits/fishing-licenses' },
    { name: 'Annual – Non-Resident', price: '$76', link: 'https://www.michigan.gov/dnr/licenses-and-permits/fishing-licenses' },
    { name: '24-Hour – Resident', price: '$9', link: 'https://www.michigan.gov/dnr/licenses-and-permits/fishing-licenses' },
    { name: '24-Hour – Non-Resident', price: '$11', link: 'https://www.michigan.gov/dnr/licenses-and-permits/fishing-licenses' },
  ];
}
