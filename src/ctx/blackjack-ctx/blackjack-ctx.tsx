"use client";

import {
  createContext,
  useMemo,
  useContext,
  type ReactNode,
  useState,
  useCallback,
  useRef,
} from "react";
import { BlackjackEngine } from './game-engine';
import { Card, Hand, GameState, GameResult, GameStats } from './types';
import { useAccountCtx } from "@/ctx/acc-ctx";

interface BlackjackProviderProps {
  children: ReactNode;
}

interface BlackjackCtxValues {
  // Game state
  gameState: GameState;
  gameResult: GameResult;
  
  // Hands
  playerHand: Hand;
  dealerHand: Hand;
  
  // Betting
  betAmount: number;
  setBetAmount: (amount: number) => void;
  
  // Game actions
  startNewGame: () => void;
  hit: () => void;
  stand: () => void;
  doubleDown: () => void;
  resetGame: () => void;
  
  // Game info
  canDoubleDown: boolean;
  canHit: boolean;
  canStand: boolean;
  
  // Stats
  stats: GameStats;
  
  // Deck/Shoe info
  remainingCards: number;
  totalCards: number;
  usedCards: number;
  deckCount: number;
  setDeckCount: (count: number) => void;
  shuffleDeck: () => void;
  getRemainingCardsByRank: () => Record<string, number>;
  getUsedCardsByRank: () => Record<string, number>;
  
  // Utils
  getCardDisplay: (card: Card) => string;
}

const BlackjackCtx = createContext<BlackjackCtxValues | null>(null);

const BlackjackCtxProvider = ({ children }: BlackjackProviderProps) => {
  const { balance, updateBalance } = useAccountCtx();
  const [deckCount, setDeckCountState] = useState(1);
  const engineRef = useRef(new BlackjackEngine(deckCount));
  
  // Game state
  const [gameState, setGameState] = useState<GameState>('betting');
  const [gameResult, setGameResult] = useState<GameResult>(null);
  
  // Hands
  const [playerHand, setPlayerHand] = useState<Hand>({ cards: [], value: 0, isBlackjack: false, isBust: false, isSoft: false });
  const [dealerHand, setDealerHand] = useState<Hand>({ cards: [], value: 0, isBlackjack: false, isBust: false, isSoft: false });
  
  // Betting
  const [betAmount, setBetAmount] = useState(0);
  
  // Stats
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    pushes: 0,
    blackjacks: 0,
    totalWinnings: 0,
  });

  const engine = engineRef.current;

  const updateStats = useCallback((result: GameResult, winAmount: number) => {
    setStats(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      gamesWon: result === 'player-wins' || result === 'player-blackjack' ? prev.gamesWon + 1 : prev.gamesWon,
      gamesLost: result === 'dealer-wins' || result === 'dealer-blackjack' ? prev.gamesLost + 1 : prev.gamesLost,
      pushes: result === 'push' ? prev.pushes + 1 : prev.pushes,
      blackjacks: result === 'player-blackjack' ? prev.blackjacks + 1 : prev.blackjacks,
      totalWinnings: prev.totalWinnings + winAmount,
    }));
  }, []);

  const processGameEnd = useCallback((result: GameResult) => {
    let winAmount = 0;
    
    switch (result) {
      case 'player-blackjack':
        winAmount = betAmount + (betAmount * 1.5); // Return bet + 3:2 payout for blackjack
        break;
      case 'player-wins':
        winAmount = betAmount + betAmount; // Return bet + 1:1 payout
        break;
      case 'push':
        winAmount = betAmount; // Return bet only
        break;
      case 'dealer-wins':
      case 'dealer-blackjack':
        winAmount = 0; // Lose bet (already deducted)
        break;
    }
    
    // Add winnings to balance
    if (winAmount > 0) {
      updateBalance?.(winAmount);
    }
    
    updateStats(result, winAmount - betAmount); // Track net winnings for stats
    setGameResult(result);
    
    // Automatically return to betting phase after a short delay
    setTimeout(() => {
      setGameState('betting');
      setGameResult(null);
      setPlayerHand({ cards: [], value: 0, isBlackjack: false, isBust: false, isSoft: false });
      setDealerHand({ cards: [], value: 0, isBlackjack: false, isBust: false, isSoft: false });
      setBetAmount(0);
    }, 3000); // 3 second delay to show result
  }, [betAmount, updateBalance, updateStats]);

  const dealerPlay = useCallback(() => {
    setGameState('dealer-turn');
    
    const playDealerRecursive = (currentDealerHand: Hand) => {
      if (engine.shouldDealerHit(currentDealerHand)) {
        const newCard = engine.dealCard();
        if (newCard) {
          const newCards = [...currentDealerHand.cards, newCard];
          const newHand = engine.createHand(newCards);
          setDealerHand(newHand);
          
          // Continue dealer play after a short delay
          setTimeout(() => playDealerRecursive(newHand), 1000);
          return;
        }
      }
      
      // Dealer is done, determine winner
      const result = engine.determineWinner(playerHand, currentDealerHand);
      processGameEnd(result);
    };
    
    // Start dealer play after a short delay
    setTimeout(() => playDealerRecursive(dealerHand), 500);
  }, [dealerHand, playerHand, engine, processGameEnd]);

  const startNewGame = useCallback(() => {
    if (betAmount <= 0 || (balance?.amount ?? 0) < betAmount) {
      return; // Invalid bet
    }
    
    // Deduct bet from balance
    updateBalance?.(-betAmount);
    
    // Reset hands
    const playerCards: Card[] = [];
    const dealerCards: Card[] = [];
    
    // Deal initial cards
    for (let i = 0; i < 2; i++) {
      const playerCard = engine.dealCard();
      const dealerCard = engine.dealCard();
      
      if (playerCard) playerCards.push(playerCard);
      if (dealerCard) dealerCards.push(dealerCard);
    }
    
    const newPlayerHand = engine.createHand(playerCards);
    const newDealerHand = engine.createHand(dealerCards);
    
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setGameResult(null);
    
    // Check for immediate blackjacks
    if (newPlayerHand.isBlackjack || newDealerHand.isBlackjack) {
      const result = engine.determineWinner(newPlayerHand, newDealerHand);
      processGameEnd(result);
    } else {
      setGameState('player-turn');
    }
  }, [betAmount, balance?.amount, updateBalance, engine, processGameEnd]);

  const hit = useCallback(() => {
    if (gameState !== 'player-turn') return;
    
    const newCard = engine.dealCard();
    if (!newCard) return;
    
    const newCards = [...playerHand.cards, newCard];
    const newHand = engine.createHand(newCards);
    setPlayerHand(newHand);
    
    if (newHand.isBust) {
      processGameEnd('dealer-wins');
    } else if (newHand.value === 21) {
      dealerPlay();
    }
  }, [gameState, playerHand, engine, processGameEnd, dealerPlay]);

  const stand = useCallback(() => {
    if (gameState !== 'player-turn') return;
    dealerPlay();
  }, [gameState, dealerPlay]);

  const doubleDown = useCallback(() => {
    if (gameState !== 'player-turn' || playerHand.cards.length !== 2) return;
    if ((balance?.amount ?? 0) < betAmount) return; // Not enough balance
    
    // Double the bet
    updateBalance?.(-betAmount);
    setBetAmount(prev => prev * 2);
    
    // Hit once and then stand
    const newCard = engine.dealCard();
    if (!newCard) return;
    
    const newCards = [...playerHand.cards, newCard];
    const newHand = engine.createHand(newCards);
    setPlayerHand(newHand);
    
    if (newHand.isBust) {
      processGameEnd('dealer-wins');
    } else {
      dealerPlay();
    }
  }, [gameState, playerHand, betAmount, balance?.amount, updateBalance, engine, processGameEnd, dealerPlay]);

  const resetGame = useCallback(() => {
    setGameState('betting');
    setGameResult(null);
    setPlayerHand({ cards: [], value: 0, isBlackjack: false, isBust: false, isSoft: false });
    setDealerHand({ cards: [], value: 0, isBlackjack: false, isBust: false, isSoft: false });
    setBetAmount(0);
  }, []);

  // Game action availability
  const canDoubleDown = useMemo(() => 
    gameState === 'player-turn' && 
    playerHand.cards.length === 2 && 
    (balance?.amount ?? 0) >= betAmount,
    [gameState, playerHand.cards.length, balance?.amount, betAmount]
  );

  const canHit = useMemo(() => 
    gameState === 'player-turn' && !playerHand.isBust,
    [gameState, playerHand.isBust]
  );

  const canStand = useMemo(() => 
    gameState === 'player-turn',
    [gameState]
  );

  const remainingCards = useMemo(() => engine.getRemainingCards(), [engine, playerHand, dealerHand, gameState]);
  const totalCards = useMemo(() => engine.getTotalCards(), [engine, deckCount]);
  const usedCards = useMemo(() => engine.getUsedCards(), [engine, playerHand, dealerHand, gameState]);

  const setDeckCount = useCallback((count: number) => {
    if (gameState === 'betting') {
      setDeckCountState(count);
      engine.setDeckCount(count);
    }
  }, [gameState, engine]);

  const shuffleDeck = useCallback(() => {
    if (gameState === 'betting') {
      engine.shuffleDeck();
    }
  }, [gameState, engine]);

  const getRemainingCardsByRank = useCallback(() => engine.getRemainingCardsByRank(), [engine, playerHand, dealerHand, gameState]);
  const getUsedCardsByRank = useCallback(() => engine.getUsedCardsByRank(), [engine, playerHand, dealerHand, gameState]);

  const getCardDisplay = useCallback((card: Card) => engine.getCardDisplay(card), [engine]);

  const value = useMemo(
    () => ({
      gameState,
      gameResult,
      playerHand,
      dealerHand,
      betAmount,
      setBetAmount,
      startNewGame,
      hit,
      stand,
      doubleDown,
      resetGame,
      canDoubleDown,
      canHit,
      canStand,
      stats,
      remainingCards,
      totalCards,
      usedCards,
      deckCount,
      setDeckCount,
      shuffleDeck,
      getRemainingCardsByRank,
      getUsedCardsByRank,
      getCardDisplay,
    }),
    [
      gameState,
      gameResult,
      playerHand,
      dealerHand,
      betAmount,
      startNewGame,
      hit,
      stand,
      doubleDown,
      resetGame,
      canDoubleDown,
      canHit,
      canStand,
      stats,
      remainingCards,
      totalCards,
      usedCards,
      deckCount,
      setDeckCount,
      shuffleDeck,
      getRemainingCardsByRank,
      getUsedCardsByRank,
      getCardDisplay,
    ]
  );

  return <BlackjackCtx value={value}>{children}</BlackjackCtx>;
};

const useBlackjackCtx = () => {
  const ctx = useContext(BlackjackCtx);
  if (!ctx) throw new Error("BlackjackCtxProvider is missing");
  return ctx;
};

export { BlackjackCtx, BlackjackCtxProvider, useBlackjackCtx };