import { FC, useEffect, useRef, useState } from "react";
import { createTimeline, createAnimatable } from "animejs";

interface Card {
  id: number;
  target: "player" | "dealer";
  delay: number;
  dealOrder: number; // 1st, 2nd, 3rd, 4th card dealt
}

interface CardDealAnimationProps {
  isDealing: boolean;
  onDealComplete?: () => void;
  dealSpeed?: number;
}

export const CardDealAnimation: FC<CardDealAnimationProps> = ({
  isDealing,
  onDealComplete,
  dealSpeed = 1,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const animationRef = useRef<Animation>(null);

  // Initialize cards for dealing (4 cards: Player, Dealer, Player, Dealer)
  useEffect(() => {
    if (isDealing) {
      const dealingCards: Card[] = [
        { id: 1, target: "player", delay: 0, dealOrder: 1 },
        { id: 2, target: "dealer", delay: 300, dealOrder: 2 },
        { id: 3, target: "player", delay: 600, dealOrder: 3 },
        { id: 4, target: "dealer", delay: 900, dealOrder: 4 },
      ];
      setCards(dealingCards);
    } else {
      setCards([]);
    }
  }, [isDealing]);

  // Card dealing animation
  useEffect(() => {
    if (cards.length === 0 || !isDealing) return;

    // Stop previous animation
    if (animationRef.current) {
      animationRef.current.pause();
    }

    setTimeout(() => {
      const cardElements =
        containerRef.current?.querySelectorAll(".dealing-card");
      if (!cardElements) return;

      // Create timeline for card dealing sequence
      const timeline = createTimeline({
        defaults: {
          duration: 800 / dealSpeed,
        },
        onComplete: () => {
          // Animation complete, notify parent
          setTimeout(() => {
            onDealComplete?.();
          }, 200);
        },
      });

      cardElements.forEach((element, index) => {
        const card = cards[index];
        if (!card) return;

        // Calculate target positions
        const targetX = card.target === "player" ? -120 : 120; // Left for player, right for dealer
        const targetY = card.target === "player" ? 80 : -80; // Bottom for player, top for dealer

        // Set initial position (center of shoe)
        createAnimatable(element, {
          translateX: 0,
          translateY: 0,
          scale: 0.8,
          rotateZ: 0,
          opacity: 0,
        });

        // Add card dealing animation
        timeline.add(
          element,
          {
            translateX: targetX,
            translateY: targetY,
            scale: 1,
            rotateZ: card.target === "dealer" ? 180 : 0, // Dealer cards face down
            opacity: [0, 1, 1],
            duration: 600 / dealSpeed,
            easing: "easeOutBack",
          },
          card.delay / dealSpeed,
        );

        // Add subtle card flip/settle animation
        timeline.add(
          element,
          {
            rotateY: [0, 10, 0],
            duration: 200 / dealSpeed,
            easing: "easeInOutSine",
          },
          (card.delay + 400) / dealSpeed,
        );
      });

      animationRef.current = timeline as unknown as Animation;
    }, 100);

    return () => {
      if (animationRef.current) {
        animationRef.current.pause();
      }
    };
  }, [cards, isDealing, dealSpeed, onDealComplete]);

  if (!isDealing) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-10"
    >
      {/* Shoe position indicator */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-16 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg shadow-lg border border-amber-500/30">
          <div className="w-full h-full bg-gradient-to-t from-black/20 to-transparent rounded-lg flex items-center justify-center">
            <div className="text-amber-200 text-xs font-bold">SHOE</div>
          </div>
        </div>
      </div>

      {/* Dealing cards */}
      {cards.map((card) => (
        <div
          key={card.id}
          className="dealing-card absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-12 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-xl border border-blue-400/30 flex items-center justify-center">
            <div className="w-10 h-14 bg-white rounded border border-gray-300 flex items-center justify-center">
              <div className="text-blue-600 text-xs font-bold">
                {card.target === "dealer" ? "?" : "♠"}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Player position indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="text-green-400 text-xs font-bold bg-black/50 px-2 py-1 rounded">
          PLAYER
        </div>
      </div>

      {/* Dealer position indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <div className="text-red-400 text-xs font-bold bg-black/50 px-2 py-1 rounded">
          DEALER
        </div>
      </div>

      {/* Particle effects for card trails */}
      {cards.map((card) => (
        <div
          key={`trail-${card.id}`}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
              style={{
                animationDelay: `${card.delay + i * 100}ms`,
                animation: `cardTrail ${600 / dealSpeed}ms ease-out forwards`,
              }}
            />
          ))}
        </div>
      ))}

      <style jsx>{`
        @keyframes cardTrail {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translate(
                ${cards[0]?.target === "player" ? "-60px, 40px" : "60px, -40px"}
              )
              scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
