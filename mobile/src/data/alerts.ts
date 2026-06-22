import type { Alert } from '../types';

export const ALERTS: Alert[] = [
  {
    id: 'alert-1',
    waterbodyId: 'detroit-river',
    title: 'Spring Walleye Run Active',
    body: 'The spring walleye migration through the Detroit River is in peak season. Fishing pressure is high near current edges and shipping channel edges.',
    severity: 'info',
    source: 'Pure MI Fishing (mock)',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-2',
    waterbodyId: 'detroit-river',
    title: 'Elevated Water Levels',
    body: 'Detroit River water levels are slightly above seasonal average following recent rainfall upstream. Boat operators should use caution near bridge pilings.',
    severity: 'warning',
    source: 'USGS (mock adapter)',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'alert-3',
    title: 'DNR Regulation Reminder',
    body: 'Walleye season closing date approaches. Check the DNR website for exact current-year dates. This app shows planning summaries only.',
    severity: 'info',
    source: 'Pure MI Fishing',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const getAlertsForWaterbody = (waterbodyId: string): Alert[] =>
  ALERTS.filter((a) => !a.waterbodyId || a.waterbodyId === waterbodyId);
