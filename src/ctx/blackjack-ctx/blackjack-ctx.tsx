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
import { BlackjackEngine } from "./game-engine";
import {
  Card,
  Hand,
  GameState,
  GameResult,
  GameStats,
  PlayerHand,
} from "./types";
import { GameHistoryManager, GameHistoryEntry } from "./game-history";
import { useAccountCtx } from "@/ctx/acc-ctx";

interface BlackjackProviderProps {
  children: ReactNode;
}

interface BlackjackCtxValues {
  // Game state
  gameState: GameState;
  gameResult: GameResult;

  // Hands
  playerHands: PlayerHand[];
  dealerHand: Hand;
  activeHandIndex: number;

  // Betting
  betAmount: number;
  setBetAmount: (amount: number) => void;

  // Game actions
  startNewGame: () => void;
  hit: () => void;
  stand: () => void;
  doubleDown: () => void;
  split: () => void;
  resetGame: () => void;

  // Game info
  canDoubleDown: boolean;
  canHit: boolean;
  canStand: boolean;
  canSplit: boolean;

  // Settings
  autoReturnToBetting: boolean;
  toggleAutoReturnToBetting: VoidFunction;
  startNewBet: VoidFunction;

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

  // Game History
  getGameHistory: () => GameHistoryEntry[];
  getHistoryStats: () => ReturnType<typeof GameHistoryManager.getStats>;
  getRecentGames: (count?: number) => GameHistoryEntry[];
  clearGameHistory: () => void;
  exportGameHistory: () => string;
}

const BlackjackCtx = createContext<BlackjackCtxValues | null>(null);

const BlackjackCtxProvider = ({ children }: BlackjackProviderProps) => {
  const { balance, updateBalance } = useAccountCtx();
  const [deckCount, setDeckCountState] = useState(1);
  const engineRef = useRef(new BlackjackEngine(deckCount));

  // Game state
  const [gameState, setGameState] = useState<GameState>("betting");
  const [gameResult, setGameResult] = useState<GameResult>(null);

  // Card dealing counter to trigger shoe updates (currently unused but ready for future enhancements)
  // const [cardDealCounter, setCardDealCounter] = useState(0);

  // Hands
  const [playerHands, setPlayerHands] = useState<PlayerHand[]>([]);
  const [dealerHand, setDealerHand] = useState<Hand>({
    cards: [],
    value: 0,
    lowValue: 0,
    highValue: 0,
    isBlackjack: false,
    isBust: false,
    isSoft: false,
  });
  const [activeHandIndex, setActiveHandIndex] = useState(0);

  // Betting
  const [betAmount, setBetAmount] = useState(0);

  // Settings
  const [autoReturnToBetting, setAutoReturnToBetting] = useState(true);
  const toggleAutoReturnToBetting = useCallback(
    () => setAutoReturnToBetting((prev) => !prev),
    [],
  );

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

  // Wrapper function to track card dealing (currently unused but ready for future enhancements)
  // const dealCardAndUpdate = useCallback(() => {
  //   const card = engine.dealCard();
  //   if (card) {
  //     setCardDealCounter(prev => prev + 1);
  //   }
  //   return card;
  // }, [engine]);

  const updateStats = useCallback((result: GameResult, winAmount: number) => {
    setStats((prev) => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1,
      gamesWon:
        result === "player-wins" || result === "player-blackjack"
          ? prev.gamesWon + 1
          : prev.gamesWon,
      gamesLost:
        result === "dealer-wins" || result === "dealer-blackjack"
          ? prev.gamesLost + 1
          : prev.gamesLost,
      pushes: result === "push" ? prev.pushes + 1 : prev.pushes,
      blackjacks:
        result === "player-blackjack" ? prev.blackjacks + 1 : prev.blackjacks,
      totalWinnings: prev.totalWinnings + winAmount,
    }));
  }, []);

  const startNewBet = useCallback(() => {
    setGameState("betting");
    setGameResult(null);
    setPlayerHands([]);
    setDealerHand({
      cards: [],
      value: 0,
      lowValue: 0,
      highValue: 0,
      isBlackjack: false,
      isBust: false,
      isSoft: false,
    });
    setActiveHandIndex(0);
    setBetAmount(0);
  }, []);

  const processGameEnd = useCallback(
    (currentDealerHand?: Hand) => {
      const dealerHandToUse = currentDealerHand || dealerHand;
      let totalWinAmount = 0;
      let playerWins = 0;
      let dealerWins = 0;
      let pushes = 0;
      let playerBlackjacks = 0;
      let dealerBlackjacks = 0;

      // Calculate results for each hand
      const updatedHands = playerHands.map((hand) => {
        let result: GameResult;
        let winAmount = 0;

        // If player hand is busted, dealer wins immediately (no need to play dealer hand)
        if (hand.isBust) {
          result = "dealer-wins";
          winAmount = 0;
          dealerWins++;
        } else {
          // Only compare with dealer if player didn't bust
          result = engine.determineWinner(hand, dealerHandToUse);

          switch (result) {
            case "player-blackjack":
              winAmount = hand.betAmount + hand.betAmount * 1.5;
              playerBlackjacks++;
              break;
            case "player-wins":
              winAmount = hand.betAmount + hand.betAmount;
              playerWins++;
              break;
            case "push":
              winAmount = hand.betAmount;
              pushes++;
              break;
            case "dealer-wins":
              winAmount = 0;
              dealerWins++;
              break;
            case "dealer-blackjack":
              winAmount = 0;
              dealerBlackjacks++;
              break;
          }
        }

        totalWinAmount += winAmount;

        return {
          ...hand,
          result,
        };
      });

      // Determine overall result for display
      let overallResult: GameResult = null;

      // For single hand games, use the direct result
      if (updatedHands.length === 1) {
        overallResult = updatedHands[0].result || null;
      } else {
        // For multiple hands, use majority logic
        if (playerBlackjacks > 0 && dealerBlackjacks === 0) {
          overallResult = "player-blackjack";
        } else if (dealerBlackjacks > 0 && playerBlackjacks === 0) {
          overallResult = "dealer-blackjack";
        } else if (playerWins > dealerWins) {
          overallResult = "player-wins";
        } else if (dealerWins > playerWins) {
          overallResult = "dealer-wins";
        } else if (pushes === updatedHands.length) {
          overallResult = "push";
        } else {
          // Mixed results - show the most common result
          if (dealerWins >= playerWins) {
            overallResult = "dealer-wins";
          } else {
            overallResult = "player-wins";
          }
        }
      }

      setPlayerHands(updatedHands);

      // Add total winnings to balance
      if (totalWinAmount > 0) {
        updateBalance?.(totalWinAmount);
      }

      // Net winnings calculation is handled in GameHistoryManager.saveGame

      // Update stats for each hand result
      updatedHands.forEach((hand) => {
        if (hand.result) {
          const handNetWinnings =
            hand.result === "player-blackjack"
              ? hand.betAmount * 1.5
              : hand.result === "player-wins"
                ? hand.betAmount
                : hand.result === "push"
                  ? 0
                  : -hand.betAmount;
          updateStats(hand.result, handNetWinnings);
        }
      });

      setGameResult(overallResult);

      // Save game to history
      GameHistoryManager.saveGame(
        updatedHands,
        dealerHandToUse,
        overallResult,
        totalWinAmount,
      );

      // Automatically return to betting phase after a short delay if enabled
      if (autoReturnToBetting) {
        setTimeout(() => {
          startNewBet();
        }, 3000);
      }
    },
    [
      engine,
      dealerHand,
      playerHands,
      updateStats,
      startNewBet,
      updateBalance,
      autoReturnToBetting,
    ],
  );

  const dealerPlay = useCallback(() => {
    setGameState("dealer-turn");

    const playDealerRecursive = (currentDealerHand: Hand) => {
      // Debug logging to track dealer behavior
      console.log(
        "Dealer hand value:",
        currentDealerHand.value,
        "Should hit:",
        engine.shouldDealerHit(currentDealerHand),
      );
      if (engine.shouldDealerHit(currentDealerHand)) {
        const newCard = engine.dealCard();
        if (newCard) {
          const newCards = [...currentDealerHand.cards, newCard];
          const newHand = engine.createHand(newCards);
          setDealerHand(newHand);

          // Continue dealer play after a short delay
          setTimeout(() => playDealerRecursive(newHand), 1000);
          return;
        } else {
          // No more cards available, end game
          processGameEnd(currentDealerHand);
          return;
        }
      }

      // Dealer is done (17 or higher), process all hands
      console.log("Dealer stops at:", currentDealerHand.value);
      processGameEnd(currentDealerHand);
    };

    // Start dealer play after a short delay
    setTimeout(() => playDealerRecursive(dealerHand), 500);
  }, [dealerHand, engine, processGameEnd]);

  const startNewGame = useCallback(() => {
    if (betAmount <= 0 || (balance?.amount ?? 0) < betAmount) {
      return; // Invalid bet
    }

    // Deduct bet from balance
    updateBalance?.(-betAmount);

    // Reset hands
    const playerCards: Card[] = [];
    const dealerCards: Card[] = [];

    // Deal initial cards in proper blackjack order: Player → Dealer → Player → Dealer
    const playerCard1 = engine.dealCard();
    const dealerCard1 = engine.dealCard();
    const playerCard2 = engine.dealCard();
    const dealerCard2 = engine.dealCard();

    if (playerCard1) playerCards.push(playerCard1);
    if (playerCard2) playerCards.push(playerCard2);
    if (dealerCard1) dealerCards.push(dealerCard1);
    if (dealerCard2) dealerCards.push(dealerCard2);

    const newPlayerHand = engine.createHand(playerCards);
    const newDealerHand = engine.createHand(dealerCards);

    // Create initial player hand
    const initialPlayerHand: PlayerHand = {
      id: "1",
      ...newPlayerHand,
      betAmount,
      isActive: true,
    };

    setPlayerHands([initialPlayerHand]);
    setDealerHand(newDealerHand);
    setActiveHandIndex(0);
    setGameResult(null);

    // Check for immediate blackjacks
    if (newPlayerHand.isBlackjack || newDealerHand.isBlackjack) {
      processGameEnd(newDealerHand);
    } else {
      setGameState("player-turn");
    }
  }, [betAmount, balance?.amount, updateBalance, engine, processGameEnd]);

  const findNextPlayableHand = useCallback(
    (startIndex: number, hands: PlayerHand[]): number => {
      for (let i = startIndex; i < hands.length; i++) {
        const hand = hands[i];
        // Hand is playable if it's not blackjack and not bust
        // Player can still play with 21 (they can choose to stand or hit and bust)
        if (!hand.isBlackjack && !hand.isBust) {
          return i;
        }
      }
      return -1; // No playable hands found
    },
    [],
  );

  const checkIfAllHandsBusted = useCallback((hands: PlayerHand[]): boolean => {
    return hands.every((hand) => hand.isBust);
  }, []);

  const moveToNextHand = useCallback(
    (currentHands?: PlayerHand[]) => {
      const handsToUse = currentHands || playerHands;
      const nextPlayableIndex = findNextPlayableHand(
        activeHandIndex + 1,
        handsToUse,
      );

      if (nextPlayableIndex !== -1) {
        setActiveHandIndex(nextPlayableIndex);
      } else {
        // Check if all hands are busted - if so, skip dealer play
        if (checkIfAllHandsBusted(handsToUse)) {
          processGameEnd();
        } else {
          dealerPlay();
        }
      }
    },
    [
      activeHandIndex,
      playerHands,
      dealerPlay,
      findNextPlayableHand,
      checkIfAllHandsBusted,
      processGameEnd,
    ],
  );

  const handlePostBust = useCallback((updatedHands: PlayerHand[]) => {
    const nextPlayableIndex = findNextPlayableHand(
      activeHandIndex + 1,
      updatedHands,
    );

    if (nextPlayableIndex !== -1) {
      setActiveHandIndex(nextPlayableIndex);
    } else {
      // Check if all hands are busted - if so, skip dealer play
      if (checkIfAllHandsBusted(updatedHands)) {
        processGameEnd();
      } else {
        dealerPlay();
      }
    }
  }, [
    activeHandIndex,
    findNextPlayableHand,
    checkIfAllHandsBusted,
    processGameEnd,
    dealerPlay,
  ]);

  const hit = useCallback(() => {
    if (gameState !== "player-turn" || activeHandIndex >= playerHands.length)
      return;

    const newCard = engine.dealCard();
    if (!newCard) return;

    const currentHand = playerHands[activeHandIndex];
    const newCards = [...currentHand.cards, newCard];
    const newHand = engine.createHand(newCards);

    const updatedHands = [...playerHands];
    updatedHands[activeHandIndex] = {
      ...currentHand,
      ...newHand,
    };

    setPlayerHands(updatedHands);

    if (newHand.isBust) {
      // Add delay to show the busting card before proceeding
      setTimeout(() => handlePostBust(updatedHands), 1000);
    }
  }, [gameState, activeHandIndex, playerHands, engine, handlePostBust]);

  const stand = useCallback(() => {
    if (gameState !== "player-turn") return;
    moveToNextHand();
  }, [gameState, moveToNextHand]);

  const doubleDown = useCallback(() => {
    if (gameState !== "player-turn" || activeHandIndex >= playerHands.length)
      return;

    const currentHand = playerHands[activeHandIndex];
    if (currentHand.cards.length !== 2) return;
    if ((balance?.amount ?? 0) < currentHand.betAmount) return;

    // Double the bet
    updateBalance?.(-currentHand.betAmount);

    // Hit once and then stand
    const newCard = engine.dealCard();
    if (!newCard) return;

    const newCards = [...currentHand.cards, newCard];
    const newHand = engine.createHand(newCards);

    const updatedHands = [...playerHands];
    updatedHands[activeHandIndex] = {
      ...currentHand,
      ...newHand,
      betAmount: currentHand.betAmount * 2,
    };

    setPlayerHands(updatedHands);
    moveToNextHand();
  }, [
    gameState,
    activeHandIndex,
    playerHands,
    balance?.amount,
    updateBalance,
    engine,
    moveToNextHand,
  ]);

  const split = useCallback(() => {
    if (gameState !== "player-turn" || activeHandIndex >= playerHands.length)
      return;

    const currentHand = playerHands[activeHandIndex];
    if (!engine.canSplit(currentHand)) return;
    if ((balance?.amount ?? 0) < currentHand.betAmount) return;

    // Deduct additional bet for split hand
    updateBalance?.(-currentHand.betAmount);

    // Split the hand
    const { hand1, hand2 } = engine.splitHand(currentHand);

    // Deal one card to each split hand
    const card1 = engine.dealCard();
    const card2 = engine.dealCard();

    if (!card1 || !card2) return;

    const newHand1 = engine.createHand([...hand1.cards, card1]);
    const newHand2 = engine.createHand([...hand2.cards, card2]);

    const splitHand1: PlayerHand = {
      id: `${currentHand.id}-1`,
      ...newHand1,
      betAmount: currentHand.betAmount,
      isActive: true,
    };

    const splitHand2: PlayerHand = {
      id: `${currentHand.id}-2`,
      ...newHand2,
      betAmount: currentHand.betAmount,
      isActive: true,
    };

    // Replace current hand with split hands
    const updatedHands = [...playerHands];
    updatedHands.splice(activeHandIndex, 1, splitHand1, splitHand2);
    setPlayerHands(updatedHands);

    // Find the next playable hand starting from the current index
    const nextPlayableIndex = findNextPlayableHand(
      activeHandIndex,
      updatedHands,
    );

    if (nextPlayableIndex !== -1) {
      setActiveHandIndex(nextPlayableIndex);
    } else {
      // No playable hands left, start dealer play
      dealerPlay();
    }
  }, [
    gameState,
    activeHandIndex,
    playerHands,
    balance?.amount,
    updateBalance,
    engine,
    dealerPlay,
    findNextPlayableHand,
  ]);

  const resetGame = useCallback(() => {
    setGameState("betting");
    setGameResult(null);
    setPlayerHands([]);
    setDealerHand({
      cards: [],
      value: 0,
      lowValue: 0,
      highValue: 0,
      isBlackjack: false,
      isBust: false,
      isSoft: false,
    });
    setActiveHandIndex(0);
    setBetAmount(0);
  }, []);

  // Game action availability
  const currentPlayerHand = useMemo(
    () => playerHands[activeHandIndex] || null,
    [playerHands, activeHandIndex],
  );

  const canDoubleDown = useMemo(
    () =>
      gameState === "player-turn" &&
      currentPlayerHand &&
      currentPlayerHand.cards.length === 2 &&
      (balance?.amount ?? 0) >= currentPlayerHand.betAmount,
    [gameState, currentPlayerHand, balance?.amount],
  );

  const canHit = useMemo(
    () =>
      gameState === "player-turn" &&
      currentPlayerHand &&
      !currentPlayerHand.isBust,
    [gameState, currentPlayerHand],
  );

  const canStand = useMemo(
    () => gameState === "player-turn" && !!currentPlayerHand,
    [gameState, currentPlayerHand],
  );

  const canSplit = useMemo(
    () =>
      gameState === "player-turn" &&
      currentPlayerHand &&
      engine.canSplit(currentPlayerHand) &&
      (balance?.amount ?? 0) >= currentPlayerHand.betAmount &&
      playerHands.length < 4, // Limit to 4 hands max
    [gameState, currentPlayerHand, engine, balance?.amount, playerHands.length],
  );

  const remainingCards = useMemo(
    () => engine.getRemainingCards(),
    [engine, playerHands, dealerHand], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const totalCards = useMemo(
    () => engine.getTotalCards(),
    [engine, deckCount], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const usedCards = useMemo(
    () => engine.getUsedCards(),
    [engine, playerHands, dealerHand], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const setDeckCount = useCallback(
    (count: number) => {
      if (gameState === "betting") {
        setDeckCountState(count);
        engine.setDeckCount(count);
      }
    },
    [gameState, engine],
  );

  const shuffleDeck = useCallback(() => {
    if (gameState === "betting") {
      engine.shuffleDeck();
    }
  }, [gameState, engine]);

  const getRemainingCardsByRank = useCallback(
    () => engine.getRemainingCardsByRank(),
    [engine, playerHands, dealerHand], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const getUsedCardsByRank = useCallback(
    () => engine.getUsedCardsByRank(),
    [engine, playerHands, dealerHand], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const getCardDisplay = useCallback(
    (card: Card) => engine.getCardDisplay(card),
    [engine],
  );

  // Game History methods
  const getGameHistory = useCallback(() => GameHistoryManager.getHistory(), []);
  const getHistoryStats = useCallback(() => GameHistoryManager.getStats(), []);
  const getRecentGames = useCallback(
    (count?: number) => GameHistoryManager.getRecentGames(count),
    [],
  );
  const clearGameHistory = useCallback(
    () => GameHistoryManager.clearHistory(),
    [],
  );
  const exportGameHistory = useCallback(
    () => GameHistoryManager.exportHistory(),
    [],
  );

  const value = useMemo(
    () => ({
      gameState,
      gameResult,
      playerHands,
      dealerHand,
      activeHandIndex,
      betAmount,
      setBetAmount,
      startNewGame,
      hit,
      stand,
      doubleDown,
      split,
      resetGame,
      canDoubleDown,
      canHit,
      canStand,
      canSplit,
      autoReturnToBetting,
      toggleAutoReturnToBetting,
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
      getGameHistory,
      getHistoryStats,
      getRecentGames,
      clearGameHistory,
      exportGameHistory,
      startNewBet,
    }),
    [
      gameState,
      gameResult,
      playerHands,
      dealerHand,
      activeHandIndex,
      betAmount,
      startNewGame,
      hit,
      stand,
      doubleDown,
      split,
      resetGame,
      canDoubleDown,
      canHit,
      canStand,
      canSplit,
      autoReturnToBetting,
      toggleAutoReturnToBetting,
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
      getGameHistory,
      getHistoryStats,
      getRecentGames,
      clearGameHistory,
      exportGameHistory,
      startNewBet,
    ],
  );

  return <BlackjackCtx value={value}>{children}</BlackjackCtx>;
};

const useBlackjackCtx = () => {
  const ctx = useContext(BlackjackCtx);
  if (!ctx) throw new Error("BlackjackCtxProvider is missing");
  return ctx;
};

export { BlackjackCtx, BlackjackCtxProvider, useBlackjackCtx };
