import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface SearchResult {
  id: string;
  title: string;
  type: 'listening' | 'reading' | 'writing' | 'speaking';
  description?: string;
  difficulty?: string;
  duration: number;
  testType?: 'academic' | 'general';
  createdAt: string;
}

interface SearchResponse {
  success: boolean;
  data: {
    results: SearchResult[];
    total: number;
  };
  message?: string;
}

interface TestResponse {
  success: boolean;
  data: {
    tests?: any[];
  } | any[];
}

const getEndpointForType = (type: string): string => {
  switch (type) {
    case 'listening':
      return '/tests'; // Listening tests endpoint
    case 'reading':
      return '/reading-tests'; // Reading tests endpoint
    case 'writing':
      return '/writing-tests'; // Writing tests endpoint
    case 'speaking':
      return '/speaking-tests'; // Speaking tests endpoint
    default:
      return '/tests';
  }
};

const filterAndFormatTests = (tests: any[], type: 'listening' | 'reading' | 'writing' | 'speaking', query: string): SearchResult[] => {
  const searchTerms = query.toLowerCase().split(' ');
  return tests
    .filter(test => {
      const testTitle = (test.title || test.testName || '').toLowerCase();
      const testDesc = (test.description || '').toLowerCase();
      return searchTerms.every(term => 
        testTitle.includes(term) || testDesc.includes(term)
      );
    })
    .map(test => ({
      id: test._id,
      title: test.title || test.testName,
      type,
      description: test.description || `${type} test for IELTS preparation`,
      difficulty: test.difficulty || 'medium',
      duration: test.duration || test.timeLimit || 60,
      testType: test.testType || test.type || 'academic',
      createdAt: test.createdAt || new Date().toISOString()
    }));
};

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    searchTests: builder.query<SearchResponse, { query: string; type?: string }>({
      async queryFn(arg, _queryApi, _extraOptions, fetchWithBQ) {
        try {
          let results: SearchResult[] = [];
          
          // Define which types to search based on the type parameter
          const typesToSearch = arg.type ? [arg.type] : ['listening', 'reading', 'writing', 'speaking'] as const;
          
          // Fetch tests for each type
          const promises = typesToSearch.map(async (type) => {
            const endpoint = getEndpointForType(type);
            const response = await fetchWithBQ(endpoint);
            
            if (response.error) {
              console.error(`Error fetching ${type} tests:`, response.error);
              return [];
            }
            
            const responseData = response.data as TestResponse;
            const tests = Array.isArray(responseData) 
              ? responseData 
              : Array.isArray(responseData.data) 
                ? responseData.data 
                : responseData.data?.tests || [];

            return filterAndFormatTests(tests, type as 'listening' | 'reading' | 'writing' | 'speaking', arg.query);
          });
          
          // Wait for all requests to complete
          const searchResults = await Promise.all(promises);
          
          // Combine all results
          results = searchResults.flat();
          
          // Sort results by relevance (exact matches first) and date
          results.sort((a, b) => {
            const aTitle = a.title.toLowerCase();
            const bTitle = b.title.toLowerCase();
            const query = arg.query.toLowerCase();
            
            // Exact matches first
            if (aTitle.includes(query) && !bTitle.includes(query)) return -1;
            if (!aTitle.includes(query) && bTitle.includes(query)) return 1;
            
            // Then sort by date
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          
          return {
            data: {
              success: true,
              data: {
                results,
                total: results.length
              }
            }
          };
        } catch (error) {
          return {
            error: {
              status: 500,
              data: { message: 'Failed to fetch search results' }
            }
          };
        }
      }
    }),
  }),
});

export const { useSearchTestsQuery } = searchApi; 