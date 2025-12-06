const API_BASE_URL = 'http://localhost:4000';

/**
 * Perform a GET request against the Swagger backend.
 * @param {string} path - Endpoint path (e.g. "/api/sales").
 * @param {Record<string, string | number | undefined>} params - Query parameters to append.
 * @returns {Promise<any>} Parsed JSON response or {} if empty.
 */
async function apiGet(path, params = {}) {
  const url = new URL(path, API_BASE_URL);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });

  console.log('Calling API:', url.toString());

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      throw new Error(`Request failed with status ${response.status}`);
    }

    // 👇 NEW: be defensive about the body
    const text = await response.text();

    // If the body is completely empty, just return an empty object
    if (!text || !text.trim()) {
      return {};
    }

    // Try to parse JSON; if it fails, log and return {}
    try {
      return JSON.parse(text);
    } catch (parseErr) {
      console.error('Failed to parse JSON response:', parseErr, 'Body was:', text);
      return {};
    }
  } catch (err) {
    console.error('apiGet error:', err);
    throw err;
  }
}

window.apiGet = apiGet;
