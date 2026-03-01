import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const forceScrollTop = () => {
  window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

export const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Initial app load
    forceScrollTop();
  }, []);

  useLayoutEffect(() => {
    // Trigger on every navigation event, including same-path pushes
    forceScrollTop();

    const raf = requestAnimationFrame(() => {
      forceScrollTop();
    });

    const timeout100 = setTimeout(() => {
      forceScrollTop();
    }, 100);

    const timeout300 = setTimeout(() => {
      forceScrollTop();
    }, 300);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout100);
      clearTimeout(timeout300);
    };
  }, [location.key, location.pathname, location.search, location.hash]);

  return null;
};
