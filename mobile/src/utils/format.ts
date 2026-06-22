// Utility helpers

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatDateTime(isoString: string): string {
  return `${formatDate(isoString)} · ${formatTime(isoString)}`;
}

export function formatDuration(startIso: string, endIso?: string): string {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const diffMs = end - start;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatRelative(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

export function formatFileSize(mb: number): string {
  if (mb < 1) return `${Math.round(mb * 1024)} KB`;
  return `${mb} MB`;
}

export function celsiusToFahrenheit(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

export function metersToFeet(m: number): number {
  return Math.round(m * 3.28084 * 10) / 10;
}

export function fishingRatingLabel(rating: number): string {
  const labels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];
  return labels[rating] ?? 'Unknown';
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}
