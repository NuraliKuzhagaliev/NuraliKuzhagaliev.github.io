/**
 * Zaman Bank - Utility Functions
 * Common helper functions
 */

/**
 * Debounce function
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func 
 * @param {number} limit 
 * @returns {Function}
 */
export function throttle(func, limit = 300) {
  let inThrottle;

  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generate unique ID
 * @returns {string}
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Deep clone object
 * @param {Object} obj 
 * @returns {Object}
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Get query parameters
 * @returns {Object}
 */
export function getQueryParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const pairs = queryString.split('&');

  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  });

  return params;
}

/**
 * Set query parameter
 * @param {string} key 
 * @param {string} value 
 */
export function setQueryParam(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.pushState({}, '', url);
}

/**
 * Calculate percentage
 * @param {number} current 
 * @param {number} total 
 * @returns {number}
 */
export function calculatePercentage(current, total) {
  if (total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

/**
 * Format large numbers
 * @param {number} num 
 * @returns {string}
 */
export function formatLargeNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Check if mobile device
 * @returns {boolean}
 */
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Copy to clipboard
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
}

export default {
  debounce,
  throttle,
  generateId,
  deepClone,
  getQueryParams,
  setQueryParam,
  calculatePercentage,
  formatLargeNumber,
  isMobile,
  copyToClipboard
};
