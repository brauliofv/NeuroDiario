import React, { useEffect, useState, useRef } from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  durationSeconds: number;
  onExpire: () => void;
  isPaused?: boolean;
  label?: string;
  darkMode?: boolean;
}

export const Timer: React.FC<TimerProps> = ({ durationSeconds, onExpire, isPaused = false, label = "Tiempo Restante", darkMode = false }) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const onExpireRef = useRef(onExpire);

  // Mantener la referencia actualizada sin disparar efectos
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Reset timer if duration changes explicitly
  useEffect(() => {
    setTimeLeft(durationSeconds);
  }, [durationSeconds]);

  useEffect(() => {
    if (isPaused) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          // Usar la referencia para llamar a la función
          if (onExpireRef.current) {
            setTimeout(() => onExpireRef.current(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPaused]); // Solo depende de isPaused (y el montaje)

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isUrgent = timeLeft <= 10 && timeLeft > 0;
  const isWarning = timeLeft < 30 && timeLeft > 10;

  let containerClasses = "flex items-center gap-2 px-4 py-2 rounded-full font-mono text-sm transition-all duration-500 border shadow-sm ";
  
  if (isUrgent) {
    containerClasses += darkMode 
      ? "bg-red-900/30 text-red-300 border-red-800 animate-pulse ring-2 ring-red-900/50"
      : "bg-amber-100 text-amber-700 border-amber-300 animate-pulse ring-2 ring-amber-100";
  } else if (isWarning) {
    containerClasses += darkMode
      ? "bg-orange-900/30 text-orange-300 border-orange-800"
      : "bg-orange-50 text-orange-800 border-orange-200";
  } else {
    containerClasses += darkMode
      ? "bg-stone-800 text-stone-300 border-stone-700"
      : "bg-[#E7E5E4] text-stone-700 border-stone-300";
  }

  return (
    <div className={containerClasses}>
      <Clock size={16} className={!isPaused && isUrgent ? "animate-bounce" : ""} />
      <span className="hidden sm:inline">{label}:</span>
      <span className={`font-bold ${isUrgent ? "text-lg" : ""}`}>
        {minutes}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
};