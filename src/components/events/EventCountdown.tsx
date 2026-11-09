"use client";
import { useEffect, useState } from "react";

interface EventCountdownProps {
  eventDate: string;
  className?: string;
}

const EventCountdown = ({ eventDate, className }: EventCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const target = new Date(eventDate).getTime();
    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [eventDate]);

  if (timeLeft.expired) {
    return <span className={className}>Événement en cours ou terminé</span>;
  }

  return (
    <div className={`nolva-countdown ${className || ""}`}>
      <span className="nolva-countdown-item">{timeLeft.days}j</span>
      <span className="nolva-countdown-sep">:</span>
      <span className="nolva-countdown-item">{String(timeLeft.hours).padStart(2, "0")}h</span>
      <span className="nolva-countdown-sep">:</span>
      <span className="nolva-countdown-item">{String(timeLeft.minutes).padStart(2, "0")}m</span>
      <span className="nolva-countdown-sep">:</span>
      <span className="nolva-countdown-item">{String(timeLeft.seconds).padStart(2, "0")}s</span>
    </div>
  );
};

export default EventCountdown;
