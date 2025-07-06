import { useState, useCallback, useRef, useEffect } from 'react';

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequests = useRef([]);

  const sendRequest = useCallback(
    async (url, method = 'GET', body = null, headers = {}) => {
      const localLoading = { current: true }; // Local isLoading flag
      setIsLoading(true);
      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);

      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal
        });

        const responseData = await response.json();

        activeHttpRequests.current = activeHttpRequests.current.filter(
          reqCtrl => reqCtrl !== httpAbortCtrl
        );

        if (!response.ok) {
          throw new Error(responseData.message);
        }

        if (localLoading.current) {
          setIsLoading(false);
        }
        return responseData;
      } catch (err) {
        if (localLoading.current) {
          setError(err.message);
          setIsLoading(false);
        }
        //throw err;
      } finally {
        localLoading.current = false; // Mark local loading as complete
      }
    },
    [] // Remove isLoading from dependencies
  );

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach(abortCtrl => {
        abortCtrl.abort('Component unmounted: Aborting active HTTP request.');
      });
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
