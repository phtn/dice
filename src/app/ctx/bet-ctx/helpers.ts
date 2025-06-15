export function computeLogisex(a: number): number {
  if (a >= 100) {
    throw new Error(
      "Input 'a' must be less than 100 to avoid division by zero or negative values.",
    );
  }
  const numerator = Math.pow(a, 1.5);
  const denominator = Math.pow(100 - a, 1.1);
  return numerator / denominator;
}

export function computeLogisex2(a: number): number {
  if (a < 2 || a > 99.99) {
    throw new Error("Input 'a' must be between 2 and 99.99");
  }

  const minA = 2;
  const maxA = 99.99;
  const minB = 1.02;
  const maxB = 9900;

  // Normalize a between 0 and 1
  const t = (a - minA) / (maxA - minA);

  // Apply a non-linear curve, adjust exponent to tune the accuracy at midpoints like a=80
  const curved = Math.pow(t, 1.2); // <- tweak this exponent to shift growth earlier or later

  // Scale to the output range
  const b = minB + curved * (maxB - minB);

  return b;
}

export function eiQuartCurve(a: number): number {
  const minA = 2;
  const maxA = 99.99;
  const minB = 1.02;
  const maxB = 9900;

  if (a < minA || a > maxA) {
    throw new Error("Input 'a' must be between 2 and 99.99");
  }

  // Normalize to [0, 1]
  const t = (a - minA) / (maxA - minA);

  // Apply ease-in quart curve
  const curved = Math.pow(t, 4);

  // Scale to output range
  return minB + curved * (maxB - minB);
}

export function quartCurve(a: number): number {
  const minA = 2;
  const maxA = 99.99;
  const minEaseStart = 95;
  const minB = 1.02;
  const maxB = 9900;

  if (a < minA || a > maxA) {
    throw new Error("Input 'a' must be between 2 and 99.99");
  }

  if (a < minEaseStart) {
    return minB;
  }

  // Normalize within the [95, 99.99] range
  const t = (a - minEaseStart) / (maxA - minEaseStart);
  const curved = Math.pow(t, 4); // ease-in quart
  return minB + curved * (maxB - minB);
}

export function quart(a: number): number {
  if (a < 2 || a > 99.99) {
    throw new Error("Input 'a' must be between 2 and 99.99");
  }

  // Anchor points you provided for a ∈ [2, 95]
  const anchors = [
    { a: 2, b: 1.02 },
    { a: 50, b: 2 },
    { a: 60, b: 3.3 },
    { a: 70, b: 4.275 },
    { a: 80, b: 5.2 },
    { a: 90, b: 6 },
    { a: 95, b: 6.8 }, // approximate smooth endpoint before takeoff
  ];

  if (a <= 95) {
    // Find segment
    for (let i = 0; i < anchors.length - 1; i++) {
      const curr = anchors[i];
      const next = anchors[i + 1];
      if (a >= curr.a && a <= next.a) {
        const t = (a - curr.a) / (next.a - curr.a); // normalize within this segment
        // Linear interpolation with slight easing
        const easedT = Math.pow(t, 1.4); // slight ease-in to smooth it
        return curr.b + easedT * (next.b - curr.b);
      }
    }
  }

  // a ∈ (95, 99.99]: quartic ease-in toward 9900
  const startA = 95;
  const endA = 99.99;
  const startB = 6.8;
  const endB = 9900;

  const t = (a - startA) / (endA - startA); // normalize to 0–1
  const eased = Math.pow(t, 4); // ease-in quart
  return startB + eased * (endB - startB);
}
