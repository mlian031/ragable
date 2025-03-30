import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Custom hook to determine if the current viewport width is considered mobile.
 *
 * @returns {boolean} True if the viewport width is less than the mobile breakpoint, false otherwise.
 *                    Returns false during server-side rendering or before the first client-side check.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(false); // Default to false

  React.useEffect(() => {
    // Check window existence for SSR safety
    if (typeof window === 'undefined') {
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const checkMobile = () => {
      setIsMobile(mql.matches); // Use media query match for consistency
    };

    // Initial check
    checkMobile();

    // Listen for changes
    mql.addEventListener('change', checkMobile);

    // Cleanup listener on unmount
    return () => mql.removeEventListener('change', checkMobile);
  }, []); // Empty dependency array ensures this runs only once on mount

  return isMobile;
}
