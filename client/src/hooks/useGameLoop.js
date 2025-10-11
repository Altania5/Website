import { useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

const useGameLoop = (interval = 2000) => {
  const timerRef = useRef(null);
  const tokenHeader = {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
  };

  const tick = useCallback(async () => {
    try {
      await axios.post("/api/game/tick", {}, { headers: tokenHeader });
    } catch (error) {
      console.error("Game tick failed:", error);
    }
  }, []);

  const startLoop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(tick, interval);
  }, [tick, interval]);

  const stopLoop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const pauseLoop = useCallback(() => {
    stopLoop();
  }, [stopLoop]);

  const resumeLoop = useCallback(() => {
    startLoop();
  }, [startLoop]);

  useEffect(() => {
    startLoop();
    return () => stopLoop();
  }, [startLoop, stopLoop]);

  return {
    startLoop,
    stopLoop,
    pauseLoop,
    resumeLoop,
    isRunning: timerRef.current !== null,
  };
};

export default useGameLoop;

