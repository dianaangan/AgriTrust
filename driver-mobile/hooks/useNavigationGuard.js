import { useState, useRef } from 'react';

export const useNavigationGuard = (delay = 1000) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef(null);

  const navigate = (navigationFunction) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If already navigating, ignore the request
    if (isNavigating) {
      return false;
    }

    // Set navigating state
    setIsNavigating(true);

    // Execute the navigation function
    navigationFunction();

    // Set timeout to reset navigation state
    timeoutRef.current = setTimeout(() => {
      setIsNavigating(false);
    }, delay);

    return true;
  };

  // Cleanup function for component unmount
  const cleanup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return {
    isNavigating,
    navigate,
    cleanup
  };
};
