/**
 * Fetch with automatic retry and exponential backoff
 * W7: Error Handling - Task 7.2
 */

export interface FetchWithRetryOptions extends RequestInit {
  maxRetries?: number;
  delayMs?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {},
  maxRetries = 3,
  delayMs = 1000
): Promise<Response> {
  const { onRetry, ...fetchOptions } = options;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      // Success - return immediately
      if (response.ok) {
        return response;
      }

      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // Server error (5xx) - retry
      if (attempt < maxRetries - 1) {
        const backoffDelay = delayMs * Math.pow(2, attempt);
        console.warn(`[fetchWithRetry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${backoffDelay}ms...`);

        if (onRetry) {
          onRetry(attempt + 1, new Error(`HTTP ${response.status}`));
        }

        await new Promise(r => setTimeout(r, backoffDelay));
        continue;
      }

      return response;

    } catch (error) {
      // Network error
      if (attempt < maxRetries - 1) {
        const backoffDelay = delayMs * Math.pow(2, attempt);
        console.warn(`[fetchWithRetry] Network error on attempt ${attempt + 1}/${maxRetries}. Retrying in ${backoffDelay}ms...`);

        if (onRetry && error instanceof Error) {
          onRetry(attempt + 1, error);
        }

        await new Promise(r => setTimeout(r, backoffDelay));
        continue;
      }

      throw error;
    }
  }

  throw new Error(`Max retries (${maxRetries}) exceeded`);
}
