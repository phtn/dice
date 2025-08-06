import { FC, useEffect, useRef, useCallback } from "react";
import { createTimeline, createAnimatable } from "animejs";
import { GameState, useBlackjackCtx } from "@/ctx/blackjack-ctx";

// interface AnimatedCard {
//   id: string;
//   target: 'player' | 'dealer';
//   handIndex?: number; // For split hands
//   isVisible: boolean;
// }

interface AnimatedCardDealerProps {
  onAnimationComplete?: () => void;
}

export const AnimatedCardDealer: FC<AnimatedCardDealerProps> = ({
  onAnimationComplete,
}) => {
  const { gameState, playerHands, dealerHand } = useBlackjackCtx();
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation>(null);

  const startDealingAnimation = useCallback(() => {
    if (!containerRef.current) return;

    // Stop any existing animation
    if (animationRef.current) {
      animationRef.current.pause();
    }

    const cardElements =
      containerRef.current.querySelectorAll(".animated-card");
    if (cardElements.length === 0) return;

    // Create dealing sequence timeline
    const timeline = createTimeline({
      defaults: {
        duration: 600,
      },
      onComplete: () => {
        setTimeout(() => {
          onAnimationComplete?.();
        }, 300);
      },
    });

    // Animate initial 4 cards (Player → Dealer → Player → Dealer)
    const dealingSequence = [
      { target: "player", delay: 0 },
      { target: "dealer", delay: 400 },
      { target: "player", delay: 800 },
      { target: "dealer", delay: 1200 },
    ];

    cardElements.forEach((element, index) => {
      if (index >= dealingSequence.length) return;

      const sequence = dealingSequence[index];
      const isDealer = sequence.target === "dealer";

      // Calculate positions
      const targetX = isDealer ? 100 : -100;
      const targetY = isDealer ? -60 : 60;

      // Set initial state
      createAnimatable(element, {
        translateX: 0,
        translateY: 0,
        scale: 0.3,
        rotateZ: 0,
        opacity: 0,
      });

      // Deal animation
      timeline.add(
        element,
        {
          translateX: targetX,
          translateY: targetY,
          scale: 1,
          rotateZ: isDealer ? 180 : 0, // Dealer cards face down initially
          opacity: [0, 1],
          duration: 500,
          easing: "easeOutCubic",
        },
        sequence.delay,
      );

      // Settle animation
      timeline.add(
        element,
        {
          rotateY: [0, 15, 0],
          duration: 200,
          easing: "easeInOutSine",
        },
        sequence.delay + 300,
      );
    });

    animationRef.current = timeline as unknown as Animation;
  }, [onAnimationComplete]);

  // Trigger animation when game starts
  useEffect(() => {
    if (
      gameState === "player-turn" &&
      playerHands.length > 0 &&
      dealerHand.cards.length > 0
    ) {
      startDealingAnimation();
    }
  }, [
    gameState,
    playerHands.length,
    dealerHand.cards.length,
    startDealingAnimation,
  ]);

  // Don't render during betting phase
  if (gameState === "betting") return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
    >
      {/* Shoe/Deck position */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-20 h-12 bg-gradient-to-br from-amber-700 to-amber-900 rounded-xl shadow-2xl border border-amber-500/40">
          <div className="w-full h-full bg-gradient-to-t from-black/30 to-transparent rounded-xl flex items-center justify-center">
            <div className="text-amber-200 text-xs font-bold tracking-wider">
              DECK
            </div>
          </div>
        </div>
      </div>

      {/* Animated cards */}
      {gameState !== (`betting` as GameState) && (
        <>
          {[1, 2, 3, 4].map((cardNum) => (
            <div
              key={cardNum}
              className="animated-card absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="w-14 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-2xl border border-blue-400/50">
                <div className="w-full h-full bg-gradient-to-t from-black/20 to-white/10 rounded-xl flex items-center justify-center">
                  <div className="w-12 h-18 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-inner">
                    <div className="text-blue-600 text-lg font-bold">
                      {cardNum <= 2 ? "♠" : "♦"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Particle effects */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full"
            style={{
              animation: `dealerParticle ${1000 + i * 100}ms ease-out infinite`,
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
      </div>

      {/* Position labels */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="text-green-400 text-xs font-bold bg-black/60 px-3 py-1 rounded-full border border-green-400/30">
          PLAYER
        </div>
      </div>

      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="text-red-400 text-xs font-bold bg-black/60 px-3 py-1 rounded-full border border-red-400/30">
          DEALER
        </div>
      </div>

      <style jsx>{`
        @keyframes dealerParticle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.8;
          }
          25% {
            opacity: 0.6;
          }
          50% {
            transform: translate(
                ${Math.random() * 200 - 100}px,
                ${Math.random() * 200 - 100}px
              )
              scale(0.5);
            opacity: 0.4;
          }
          100% {
            transform: translate(
                ${Math.random() * 300 - 150}px,
                ${Math.random() * 300 - 150}px
              )
              scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
