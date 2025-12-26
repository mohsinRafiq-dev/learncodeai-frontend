import { useState, useEffect } from 'react';

export const useCountUp = (end: number, duration: number = 2000, start: number = 0) => {
  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isAnimating) return;

    const startTime = Date.now();
    const range = end - start;

    const timer = setInterval(() => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      
      setCount(Math.floor(progress * range + start));

      if (progress === 1) {
        clearInterval(timer);
        setIsAnimating(false);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, duration, start, isAnimating]);

  const startAnimation = () => {
    setIsAnimating(true);
  };

  return { count, startAnimation };
};
