// import React from "react";
// import { render, screen, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import { BlackjackCtxProvider, useBlackjackCtx } from "../blackjack-ctx";

// // Create a mock account context provider
// const MockAccountProvider = ({ children }: { children: React.ReactNode }) => {
//   const mockAccountContext = {
//     balance: { amount: 1000, currencyCode: "USD", fractionalDigits: 2 },
//     updateBalance: () => Promise.resolve(),
//     getBalance: () => Promise.resolve(),
//     resetBalance: () => {},
//   };

//   return <div data-testid="mock-account-provider">{children}</div>;
// };

// // Test component that uses the blackjack context
// const TestComponent = () => {
//   const {
//     gameState,
//     playerHands,
//     dealerHand,
//     betAmount,
//     setBetAmount,
//     startNewGame,
//     hit,
//     stand,
//     split,
//     doubleDown,
//     canHit,
//     canStand,
//     canSplit,
//     canDoubleDown,
//     stats,
//     remainingCards,
//   } = useBlackjackCtx();

//   return (
//     <div>
//       <div data-testid="game-state">{gameState}</div>
//       <div data-testid="bet-amount">{betAmount}</div>
//       <div data-testid="remaining-cards">{remainingCards}</div>
//       <div data-testid="player-hands-count">{playerHands.length}</div>
//       <div data-testid="dealer-cards-count">{dealerHand.cards.length}</div>
//       <div data-testid="games-played">{stats.gamesPlayed}</div>

//       <button onClick={() => setBetAmount(100)} data-testid="set-bet">
//         Set Bet
//       </button>
//       <button onClick={startNewGame} data-testid="start-game">
//         Start Game
//       </button>
//       <button onClick={hit} disabled={!canHit} data-testid="hit">
//         Hit
//       </button>
//       <button onClick={stand} disabled={!canStand} data-testid="stand">
//         Stand
//       </button>
//       <button onClick={split} disabled={!canSplit} data-testid="split">
//         Split
//       </button>
//       <button
//         onClick={doubleDown}
//         disabled={!canDoubleDown}
//         data-testid="double-down"
//       >
//         Double Down
//       </button>
//     </div>
//   );
// };

// const renderWithProvider = () => {
//   return render(
//     <BlackjackCtxProvider>
//       <TestComponent />
//     </BlackjackCtxProvider>,
//   );
// };

// describe("BlackjackContext", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   test("should initialize with correct default state", () => {
//     renderWithProvider();

//     expect(screen.getByTestId("game-state")).toHaveTextContent("betting");
//     expect(screen.getByTestId("bet-amount")).toHaveTextContent("0");
//     expect(screen.getByTestId("remaining-cards")).toHaveTextContent("52");
//     expect(screen.getByTestId("player-hands-count")).toHaveTextContent("0");
//     expect(screen.getByTestId("dealer-cards-count")).toHaveTextContent("0");
//     expect(screen.getByTestId("games-played")).toHaveTextContent("0");
//   });

//   test("should allow setting bet amount", async () => {
//     const user = userEvent.setup();
//     renderWithProvider();

//     await user.click(screen.getByTestId("set-bet"));
//     expect(screen.getByTestId("bet-amount")).toHaveTextContent("100");
//   });

//   test("should start new game when bet is placed", async () => {
//     const user = userEvent.setup();
//     renderWithProvider();

//     // Set bet first
//     await user.click(screen.getByTestId("set-bet"));

//     // Start game
//     await user.click(screen.getByTestId("start-game"));

//     await waitFor(() => {
//       expect(screen.getByTestId("game-state")).toHaveTextContent("player-turn");
//       expect(screen.getByTestId("player-hands-count")).toHaveTextContent("1");
//       expect(screen.getByTestId("dealer-cards-count")).toHaveTextContent("2");
//     });
//   });

//   test("should not start game without bet", async () => {
//     const user = userEvent.setup();
//     renderWithProvider();

//     await user.click(screen.getByTestId("start-game"));

//     // Should remain in betting state
//     expect(screen.getByTestId("game-state")).toHaveTextContent("betting");
//     expect(screen.getByTestId("player-hands-count")).toHaveTextContent("0");
//   });

//   test("should enable/disable action buttons correctly", async () => {
//     const user = userEvent.setup();
//     renderWithProvider();

//     // Initially in betting state - action buttons should be disabled
//     expect(screen.getByTestId("hit")).toBeDisabled();
//     expect(screen.getByTestId("stand")).toBeDisabled();
//     expect(screen.getByTestId("split")).toBeDisabled();
//     expect(screen.getByTestId("double-down")).toBeDisabled();

//     // Set bet and start game
//     await user.click(screen.getByTestId("set-bet"));
//     await user.click(screen.getByTestId("start-game"));

//     await waitFor(() => {
//       // In player turn, hit and stand should be enabled
//       expect(screen.getByTestId("hit")).toBeEnabled();
//       expect(screen.getByTestId("stand")).toBeEnabled();
//       // Split and double down depend on hand composition
//     });
//   });

//   test("should handle hit action", async () => {
//     const user = userEvent.setup();
//     renderWithProvider();

//     // Set bet and start game
//     await user.click(screen.getByTestId("set-bet"));
//     await user.click(screen.getByTestId("start-game"));

//     await waitFor(() => {
//       expect(screen.getByTestId("game-state")).toHaveTextContent("player-turn");
//     });

//     const initialRemainingCards = parseInt(
//       screen.getByTestId("remaining-cards").textContent || "0",
//     );

//     // Hit
//     await user.click(screen.getByTestId("hit"));

//     await waitFor(() => {
//       // Should have dealt one more card
//       const newRemainingCards = parseInt(
//         screen.getByTestId("remaining-cards").textContent || "0",
//       );
//       expect(newRemainingCards).toBe(initialRemainingCards - 1);
//     });
//   });

//   test("should handle stand action", async () => {
//     const user = userEvent.setup();
//     renderWithProvider();

//     // Set bet and start game
//     await user.click(screen.getByTestId("set-bet"));
//     await user.click(screen.getByTestId("start-game"));

//     await waitFor(() => {
//       expect(screen.getByTestId("game-state")).toHaveTextContent("player-turn");
//     });

//     // Stand
//     await user.click(screen.getByTestId("stand"));

//     await waitFor(() => {
//       // Should move to dealer turn
//       expect(screen.getByTestId("game-state")).toHaveTextContent("dealer-turn");
//     });
//   });

//   test("should automatically return to betting after game ends", async () => {
//     const user = userEvent.setup();
//     renderWithProvider();

//     // Set bet and start game
//     await user.click(screen.getByTestId("set-bet"));
//     await user.click(screen.getByTestId("start-game"));

//     await waitFor(() => {
//       expect(screen.getByTestId("game-state")).toHaveTextContent("player-turn");
//     });

//     // Stand to trigger dealer play
//     await user.click(screen.getByTestId("stand"));

//     // Wait for game to complete and return to betting
//     await waitFor(
//       () => {
//         expect(screen.getByTestId("game-state")).toHaveTextContent("betting");
//         expect(screen.getByTestId("games-played")).toHaveTextContent("1");
//       },
//       { timeout: 5000 },
//     );
//   });

//   test("should track game statistics", async () => {
//     const user = userEvent.setup();
//     renderWithProvider();

//     // Play a game
//     await user.click(screen.getByTestId("set-bet"));
//     await user.click(screen.getByTestId("start-game"));

//     await waitFor(() => {
//       expect(screen.getByTestId("game-state")).toHaveTextContent("player-turn");
//     });

//     await user.click(screen.getByTestId("stand"));

//     // Wait for game to complete
//     await waitFor(
//       () => {
//         expect(screen.getByTestId("game-state")).toHaveTextContent("betting");
//         expect(screen.getByTestId("games-played")).toHaveTextContent("1");
//       },
//       { timeout: 5000 },
//     );
//   });
// });

// describe("BlackjackContext Error Handling", () => {
//   test("should throw error when used outside provider", () => {
//     // Suppress console.error for this test
//     const consoleSpy = jest
//       .spyOn(console, "error")
//       .mockImplementation(() => {});

//     expect(() => {
//       render(<TestComponent />);
//     }).toThrow("BlackjackCtxProvider is missing");

//     consoleSpy.mockRestore();
//   });
// });
