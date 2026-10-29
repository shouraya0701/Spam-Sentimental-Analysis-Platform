export function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function shortenText(text, max = 80) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

export function toPercent(val) {
  if (val === undefined || val === null || isNaN(val)) return '0.0%';
  return (val * 100).toFixed(1) + '%';
}

