import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      queryFn: async ({ queryKey }) => {
        const endpoint = Array.isArray(queryKey) ? queryKey[0] : queryKey;
        const response = await fetch(endpoint as string);
        
        if (!response.ok) {
          throw new Error(`Network error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
      },
    },
  },
});

export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const defaultHeaders = {
    "Content-Type": "application/json",
  };
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`Network error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
};