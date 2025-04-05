
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ApiOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  withAuth?: boolean;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  
  const getToken = () => {
    // In a real app, you'd retrieve this from localStorage, cookies, or a state management solution
    return localStorage.getItem('auth_token');
  };
  
  const request = async <T = any>({
    url,
    method = 'GET',
    body,
    headers = {},
    withAuth = true,
  }: ApiOptions): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      // Construct headers
      const requestHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...headers,
      };
      
      // Add authentication if required
      if (withAuth) {
        const token = getToken();
        if (!token) {
          throw new Error('Authentication required. Please log in.');
        }
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
      
      // Prepare request options
      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };
      
      // Add body for POST, PUT methods
      if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
      }
      
      // Make the request
      const response = await fetch(url, options);
      
      // Handle non-successful responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }
      
      // Parse response
      const data = await response.json();
      return data as T;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(err as Error);
      toast({
        variant: 'destructive',
        title: 'API Error',
        description: errorMessage,
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    request,
    loading,
    error,
  };
}
