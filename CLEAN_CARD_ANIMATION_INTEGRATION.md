# Clean Card Animation Integration

## No Overlays, Just Subtle Effects

Instead of hideous overlays, here are clean, integrated animation components:

### 1. **DealingIndicator** - For Shoe Card
Place this inside your existing shoe card component:

```tsx
// In your ShoeCard component
import { DealingIndicator } from "@/components/blackjack/dealing-indicator";

export const ShoeCard = () => {
  const { gameState } = useBlackjackCtx();
  const isDealing = gameState === 'dealing'; // or however you track dealing state
  
  return (
    <Card className="relative ...">
      {/* Your existing shoe content */}
      <CardContent>
        {/* Existing shoe UI */}
      </CardContent>
      
      {/* Subtle dealing indicator - no overlay! */}
      <DealingIndicator isDealing={isDealing} />
    </Card>
  );
};
```

### 2. **CardAppearAnimation** - For Game Cards
Wrap your actual playing cards:

```tsx
// In your game card components
import { CardAppearAnimation } from "@/components/blackjack/card-appear-animation";

export const GameCard = ({ card, shouldAnimate, delay, isDealer }) => {
  return (
    <CardAppearAnimation 
      shouldAnimate={shouldAnimate}
      delay={delay}
      isDealer={isDealer}
    >
      {/* Your existing card component */}
      <div className="playing-card ...">
        {card.rank}{card.suit}
      </div>
    </CardAppearAnimation>
  );
};
```

### 3. **DeckParticleEffect** - For Shoe Area Only
Add subtle particles around the deck:

```tsx
// Inside your shoe/deck area
<div className="deck-container relative">
  {/* Your deck visual */}
  <div className="deck-visual ...">DECK</div>
  
  {/* Subtle particles when dealing */}
  <DeckParticleEffect 
    isActive={isDealing}
    intensity={6}
    duration={1500}
  />
</div>
```

## Benefits of This Approach:

### ✅ **Integrated, Not Intrusive**
- No overlays covering your UI
- Effects happen within existing components
- Maintains game flow and visibility

### ✅ **Subtle and Professional**
- Small particle effects around deck
- Cards appear with smooth animation
- "DEALING" indicator in shoe area
- No flashy, distracting visuals

### ✅ **Performance Friendly**
- Minimal DOM elements
- Efficient Anime.js animations
- Only active when needed

### ✅ **Easy to Control**
- Simple boolean props to activate
- Customizable timing and intensity
- Can be disabled entirely if needed

## Usage Example:

```tsx
const BlackjackGame = () => {
  const [isDealing, setIsDealing] = useState(false);
  const [cardsDealt, setCardsDealt] = useState(0);

  const startNewGame = () => {
    setIsDealing(true);
    // Deal cards with staggered animation
    setTimeout(() => setCardsDealt(1), 0);
    setTimeout(() => setCardsDealt(2), 300);
    setTimeout(() => setCardsDealt(3), 600);
    setTimeout(() => setCardsDealt(4), 900);
    setTimeout(() => setIsDealing(false), 1200);
  };

  return (
    <div className="blackjack-table">
      {/* Shoe with dealing indicator */}
      <ShoeCard isDealing={isDealing} />
      
      {/* Player cards with appear animation */}
      {playerCards.map((card, index) => (
        <CardAppearAnimation
          key={card.id}
          shouldAnimate={cardsDealt > index * 2}
          delay={index * 600}
        >
          <PlayingCard card={card} />
        </CardAppearAnimation>
      ))}
      
      {/* Dealer cards with appear animation */}
      {dealerCards.map((card, index) => (
        <CardAppearAnimation
          key={card.id}
          shouldAnimate={cardsDealt > index * 2 + 1}
          delay={index * 600 + 300}
          isDealer={true}
        >
          <PlayingCard card={card} />
        </CardAppearAnimation>
      ))}
    </div>
  );
};
```

This approach gives you the card dealing animation feel without any ugly overlays - just clean, integrated effects that enhance the existing UI!