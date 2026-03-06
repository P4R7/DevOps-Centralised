import { useState, useEffect } from 'react';

export function useCountdown(startTime?: string, durationHours: number = 24) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExpired, setIsExpired] = useState<boolean>(true);

  useEffect(() => {
    if (!startTime) {
      setIsExpired(true);
      setTimeLeft(0);
      return;
    }

    const start = new Date(startTime).getTime();
    const deadline = start + durationHours * 60 * 60 * 1000;

    const updateTimer = () => {
      const now = new Date().getTime();
      const remaining = deadline - now;
      if (remaining <= 0) {
        setTimeLeft(0);
        setIsExpired(true);
      } else {
        setTimeLeft(remaining);
        setIsExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startTime, durationHours]);

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  return { timeLeft, isExpired, formattedTime: formatTime(timeLeft) };
}
