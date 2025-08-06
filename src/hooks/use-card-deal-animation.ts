import { useState, useCallback } from 'react';

export const useCardDealAnimation = () => {
  const [isDealing, setIsDealing] = useState(false);
  const [dealSpeed, setDealSpeed] = useState(1);

  const startDealAnimation = useCallback((speed: number = 1) => {
    setDealSpeed(speed);
    setIsDealing(true);
  }, []);

  const stopDealAnimation = useCallback(() => {
    setIsDealing(false);
  }, []);

  const onDealComplete = useCallback(() => {
    setIsDealing(false);
  }, []);

  return {
    isDealing,
    dealSpeed,
    startDealAnimation,
    stopDealAnimation,
    onDealComplete
  };
};