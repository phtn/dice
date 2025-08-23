"use client";

import {
  createContext,
  useMemo,
  useContext,
  type ReactNode,
  useState,
  useCallback,
  useRef,
  Dispatch,
  SetStateAction,
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
  setBetAmount: Dispatch<SetStateAction<number>>;
  totalWinAmount: number;
  netWinnings: number;

  // Game actions
  startNewGame: (slotBets?: { [key: number]: number }) => void;
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

  // Studio integration
  dealSpecificCard: (card: Card) => Card | null;

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

  // Card dealing counter to trigger shoe updates
  const [cardDealCounter, setCardDealCounter] = useState(0);

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
  const [totalWinAmount, setTotalWinAmount] = useState(0);
  const [netWinnings, setNetWinnings] = useState(0);

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

  // Wrapper function to track card dealing
  const dealCardAndUpdate = useCallback((specificCard?: Card) => {
    const card = engine.dealCard(specificCard);
    if (card) {
      setCardDealCounter(prev => prev + 1);
    }
    return card;
  }, [engine]);

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
    setTotalWinAmount(0);
    setNetWinnings(0);
  }, []);

  const processGameEnd = useCallback(
    (currentDealerHand?: Hand, currentPlayerHands?: PlayerHand[]) => {
      const dealerHandToUse = currentDealerHand || dealerHand;
      const playerHandsToUse = currentPlayerHands || playerHands;
      let totalWinAmount = 0;
      let playerWins = 0;
      let dealerWins = 0;
      let pushes = 0;
      let playerBlackjacks = 0;
      let dealerBlackjacks = 0;

      // Calculate results for each hand
      const updatedHands = playerHandsToUse.map((hand) => {
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
        const currentBalance = balance?.amount ?? 0;
        updateBalance?.(currentBalance + totalWinAmount);
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

      // Calculate net winnings (profit only)
      const totalBetAmount = playerHandsToUse.reduce((sum, hand) => sum + hand.betAmount, 0);
      const netWinningsAmount = totalWinAmount - totalBetAmount;

      setGameResult(overallResult);
      setTotalWinAmount(totalWinAmount);
      setNetWinnings(netWinningsAmount);

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
      balance?.amount,
    ],
  );

  const dealerPlay = useCallback(
    (currentPlayerHands?: PlayerHand[]) => {
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
          const newCard = dealCardAndUpdate();
          if (newCard) {
            const newCards = [...currentDealerHand.cards, newCard];
            const newHand = engine.createHand(newCards);
            setDealerHand(newHand);

            // Continue dealer play after a short delay
            setTimeout(() => playDealerRecursive(newHand), 1000);
            return;
          } else {
            // No more cards available, end game
            processGameEnd(currentDealerHand, currentPlayerHands);
            return;
          }
        }

        // Dealer is done (17 or higher), process all hands
        console.log("Dealer stops at:", currentDealerHand.value);
        processGameEnd(currentDealerHand, currentPlayerHands);
      };

      // Start dealer play after a short delay
      setTimeout(() => playDealerRecursive(dealerHand), 500);
    },
    [dealerHand, engine, processGameEnd, dealCardAndUpdate],
  );

  const startNewGame = useCallback(
    (slotBets?: { [key: number]: number }) => {
      // If slotBets provided, use them; otherwise fall back to single bet
      const betsToUse = slotBets || { 0: betAmount };
      const activeBets = Object.entries(betsToUse).filter(([, bet]) => bet > 0);

      // Calculate total bet amount
      const totalBetAmount = activeBets.reduce((sum, [, bet]) => sum + bet, 0);

      if (activeBets.length === 0 || (balance?.amount ?? 0) < totalBetAmount) {
        return; // Invalid bet
      }

      // Deduct total bet from balance
      const currentBalance = balance?.amount ?? 0;
      updateBalance?.(currentBalance - totalBetAmount);

      // Deal dealer cards first
      const dealerCards: Card[] = [];
      const dealerCard1 = dealCardAndUpdate();
      const dealerCard2 = dealCardAndUpdate();
      if (dealerCard1) dealerCards.push(dealerCard1);
      if (dealerCard2) dealerCards.push(dealerCard2);
      const newDealerHand = engine.createHand(dealerCards);

      // Create player hands for each active slot
      const newPlayerHands: PlayerHand[] = [];

      activeBets.forEach(([slotIndex, slotBet], handIndex) => {
        const playerCards: Card[] = [];

        // Deal two cards for this hand
        const playerCard1 = dealCardAndUpdate();
        const playerCard2 = dealCardAndUpdate();

        if (playerCard1) playerCards.push(playerCard1);
        if (playerCard2) playerCards.push(playerCard2);

        const newPlayerHand = engine.createHand(playerCards);

        const playerHand: PlayerHand = {
          id: `slot-${slotIndex}`,
          ...newPlayerHand,
          betAmount: slotBet,
          isActive: handIndex === 0, // First hand is active
        };

        newPlayerHands.push(playerHand);
      });

      setPlayerHands(newPlayerHands);
      setDealerHand(newDealerHand);
      setActiveHandIndex(0);
      setGameResult(null);

      // Check for immediate blackjacks
      if (newDealerHand.isBlackjack) {
        // Dealer blackjack - end game immediately
        processGameEnd(newDealerHand, newPlayerHands);
      } else {
        // Check if ALL player hands have blackjack
        const allHandsBlackjack = newPlayerHands.every(hand => hand.isBlackjack);

        if (allHandsBlackjack) {
          // All player hands have blackjack, dealer doesn't - end game
          processGameEnd(newDealerHand, newPlayerHands);
        } else {
          // Some hands need to be played - start player turn
          // Find first non-blackjack hand to be active
          const firstPlayableIndex = newPlayerHands.findIndex(hand => !hand.isBlackjack);
          if (firstPlayableIndex !== -1) {
            setActiveHandIndex(firstPlayableIndex);
          }
          setGameState("player-turn");
        }
      }
    },
    [betAmount, balance?.amount, updateBalance, engine, processGameEnd, dealCardAndUpdate],
  );

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
        // Check if all hands are finished (busted or blackjack) - if so, skip dealer play if all busted
        if (checkIfAllHandsBusted(handsToUse)) {
          processGameEnd(undefined, handsToUse);
        } else {
          dealerPlay(handsToUse);
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

  const handlePostBust = useCallback(
    (updatedHands: PlayerHand[]) => {
      const nextPlayableIndex = findNextPlayableHand(
        activeHandIndex + 1,
        updatedHands,
      );

      if (nextPlayableIndex !== -1) {
        setActiveHandIndex(nextPlayableIndex);
      } else {
        // Check if all hands are busted - if so, skip dealer play
        if (checkIfAllHandsBusted(updatedHands)) {
          processGameEnd(undefined, updatedHands);
        } else {
          dealerPlay(updatedHands);
        }
      }
    },
    [
      activeHandIndex,
      findNextPlayableHand,
      checkIfAllHandsBusted,
      processGameEnd,
      dealerPlay,
    ],
  );

  const hit = useCallback(() => {
    if (gameState !== "player-turn" || activeHandIndex >= playerHands.length)
      return;

    const newCard = dealCardAndUpdate();
    if (!newCard) return;

    const currentHand = playerHands[activeHandIndex];
    const newCards = [...currentHand.cards, newCard];
    const newHand = engine.createHand(newCards);

    const updatedHands = [...playerHands];
    updatedHands[activeHandIndex] = {
      ...currentHand,
      ...newHand,
      hasHit: true,
    };

    setPlayerHands(updatedHands);

    if (newHand.isBust) {
      // Add delay to show the busting card before proceeding
      setTimeout(() => handlePostBust(updatedHands), 1000);
    }
  }, [gameState, activeHandIndex, playerHands, engine, handlePostBust, dealCardAndUpdate]);

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
    const currentBalance = balance?.amount ?? 0;
    updateBalance?.(currentBalance - currentHand.betAmount);

    // Hit once and then stand
    const newCard = dealCardAndUpdate();
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

    // Check if the doubled hand busted
    if (newHand.isBust) {
      // Add delay to show the busting card before proceeding
      setTimeout(() => handlePostBust(updatedHands), 1000);
    } else {
      moveToNextHand(updatedHands);
    }
  }, [
    gameState,
    activeHandIndex,
    playerHands,
    balance?.amount,
    updateBalance,
    engine,
    moveToNextHand,
    handlePostBust,
    dealCardAndUpdate,
  ]);

  const split = useCallback(() => {
    if (gameState !== "player-turn" || activeHandIndex >= playerHands.length)
      return;

    const currentHand = playerHands[activeHandIndex];
    if (!engine.canSplit(currentHand)) return;
    if ((balance?.amount ?? 0) < currentHand.betAmount) return;

    // Deduct additional bet for split hand
    const currentBalance = balance?.amount ?? 0;
    updateBalance?.(currentBalance - currentHand.betAmount);

    // Split the hand
    const { hand1, hand2 } = engine.splitHand(currentHand);

    // Deal one card to each split hand
    const card1 = dealCardAndUpdate();
    const card2 = dealCardAndUpdate();

    if (!card1 || !card2) return;

    const newHand1 = engine.createHand([...hand1.cards, card1]);
    const newHand2 = engine.createHand([...hand2.cards, card2]);

    const splitHand1: PlayerHand = {
      id: `${currentHand.id}-1`,
      ...newHand1,
      betAmount: currentHand.betAmount,
      isActive: true,
      hasHit: false,
    };

    const splitHand2: PlayerHand = {
      id: `${currentHand.id}-2`,
      ...newHand2,
      betAmount: currentHand.betAmount,
      isActive: false,
      hasHit: false,
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
      dealerPlay(updatedHands);
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
    dealCardAndUpdate,
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
      !currentPlayerHand.hasHit && // prevent doubling after a hit
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
    [engine, playerHands, dealerHand, cardDealCounter], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const totalCards = useMemo(
    () => engine.getTotalCards(),
    [engine, deckCount], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const usedCards = useMemo(
    () => engine.getUsedCards(),
    [engine, playerHands, dealerHand, cardDealCounter], // eslint-disable-line react-hooks/exhaustive-deps
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
    [engine, playerHands, dealerHand, cardDealCounter], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const getUsedCardsByRank = useCallback(
    () => engine.getUsedCardsByRank(),
    [engine, playerHands, dealerHand, cardDealCounter], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const getCardDisplay = useCallback(
    (card: Card) => engine.getCardDisplay(card),
    [engine],
  );

  // Deal a specific card (for studio use)
  const dealSpecificCard = useCallback(
    (card: Card) => {
      const dealtCard = engine.dealCard(card);
      if (dealtCard) {
        setCardDealCounter(prev => prev + 1);
      }
      return dealtCard;
    },
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
      totalWinAmount,
      netWinnings,
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
      dealSpecificCard,
    }),
    [
      gameState,
      gameResult,
      playerHands,
      dealerHand,
      activeHandIndex,
      betAmount,
      totalWinAmount,
      netWinnings,
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
      dealSpecificCard,
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
