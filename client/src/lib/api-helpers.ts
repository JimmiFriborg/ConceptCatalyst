/**
 * Helper function to make API requests with proper typing support
 */
export async function apiRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Failed to fetch data');
  }
  
  return response.json();
}

/**
 * Type guard to check if a value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}