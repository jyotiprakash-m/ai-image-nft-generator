"use client";

import { useEffect, useState } from "react";

type CountdownTimerProps = {
  url: string;
};

const CountdownTimer = ({ url }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<ReturnType<
    typeof getTimeRemaining
  > | null>(null);
  const [expired, setExpired] = useState(false);

  function extractExpiryTime(url: string): number | null {
    try {
      const parsedUrl = new URL(url);
      const seParam = parsedUrl.searchParams.get("se");
      if (!seParam) return null;

      return new Date(seParam).getTime();
    } catch {
      return null;
    }
  }

  const expiryTime = extractExpiryTime(url);

  function getTimeRemaining() {
    const now = new Date().getTime();
    if (!expiryTime)
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };

    const difference = expiryTime - now;
    const total = Math.max(difference, 0);
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { total, days, hours, minutes, seconds };
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!expiryTime) return;

    const timer = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeLeft(remaining);
      if (remaining.total <= 0) {
        setExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiryTime]);

  if (!expiryTime)
    return (
      <p className="text-red-600">Invalid or missing expiry time in URL</p>
    );
  if (expired)
    return <p className="text-red-600 font-semibold">Link expired</p>;
  if (!timeLeft) return <p>Loading countdown...</p>;

  return (
    <div className="text-center p-2 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">Time left until expiry:</h2>
      <div className="text-2xl font-mono">
        {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </div>
    </div>
  );
};

export default CountdownTimer;
