// Utility / helper functions

/**
 * Prepend the backend base URL to relative image paths returned by the API.
 * @param {string|null} url
 * @returns {string|null}
 */
export function getImageUrl(url) {
  if (!url) return null
  if (url.startsWith('http')) return url
  return (import.meta.env.VITE_API_URL || 'http://localhost:5000') + url
}

/**
 * Format a date string to a human-readable format
 * @param {string} dateStr - ISO date string
 * @returns {string}
 */
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Truncate a string to a given length
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength = 100) {
  if (!str) return ''
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str
}
