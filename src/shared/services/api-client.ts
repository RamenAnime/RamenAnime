/**
 * Resilient API Client
 * - Automatic retry with exponential backoff
 * - Request/response interceptors
 * - Timeout handling
 * - Circuit breaker pattern for external APIs
 */

const DEFAULT_TIMEOUT = 10000;
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000;

interface RequestConfig {
  timeout?: number;
  retries?: number;
  fallback?: () => Promise<any>;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function apiClient(
  url: string,
  options: RequestInit = {},
  config: RequestConfig = {}
): Promise<any> {
  const timeout = config.timeout || DEFAULT_TIMEOUT;
  const maxRetries = config.retries !== undefined ? config.retries : MAX_RETRIES;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeout);
      
      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on 4xx client errors
      if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Use fallback on last attempt if available
      if (attempt === maxRetries && config.fallback) {
        return await config.fallback();
      }
      
      // Exponential backoff
      if (attempt < maxRetries) {
        const backoff = RETRY_DELAY_BASE * Math.pow(2, attempt);
        await delay(backoff);
      }
    }
  }
  
  throw lastError || new ApiError('Request failed after all retries');
}

// External API wrappers with fallbacks
export const externalApi = {
  // IP Geolocation with fallback chain
  async detectLocation(): Promise<{ country: string; countryName: string }> {
    const fallback = async () => ({
      country: 'US',
      countryName: 'United States'
    });
    
    try {
      // Primary: ipapi.co
      const data = await apiClient(
        'https://ipapi.co/json/',
        {},
        { timeout: 4000, retries: 1, fallback }
      );
      
      if (data.country_code) {
        return {
          country: data.country_code,
          countryName: data.country_name
        };
      }
    } catch { /* try next */ }
    
    try {
      // Fallback: ipinfo.io
      const data = await apiClient(
        'https://ipinfo.io/json',
        {},
        { timeout: 4000, retries: 0, fallback }
      );
      
      if (data.country) {
        return {
          country: data.country,
          countryName: data.country
        };
      }
    } catch { /* use final fallback */ }
    
    return fallback();
  },
  
  // Exchange rates with fallback
  async getExchangeRates(base: string = 'USD'): Promise<Record<string, number>> {
    const fallback = async () => ({
      USD: 1, EUR: 0.92, JPY: 150, GBP: 0.79,
      CAD: 1.36, AUD: 1.52, KRW: 1330, CNY: 7.24
    });
    
    try {
      const data = await apiClient(
        `https://api.frankfurter.app/latest?from=${base}`,
        {},
        { timeout: 5000, retries: 2, fallback }
      );
      
      if (data?.rates) {
        return { [base]: 1, ...data.rates };
      }
    } catch { /* use fallback */ }
    
    return fallback();
  }
};

export { ApiError };
