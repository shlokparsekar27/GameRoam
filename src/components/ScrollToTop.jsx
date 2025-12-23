import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // "0, 0" takes you to the very top-left of the screen
    window.scrollTo(0, 0);
  }, [pathname]); // This triggers every time the URL path changes

  return null;
}