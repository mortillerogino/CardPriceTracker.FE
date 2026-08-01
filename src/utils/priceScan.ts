import type { Card } from '../types/card';

// Card.price has no real feed behind it yet (backend always returns null), so "Scan prices"
// simulates a market check: cards without a price get a deterministic starting price, cards
// that already have one get nudged by a plausible day-over-day swing.

function hashStringToUnit(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return (hash >>> 0) / 0xffffffff;
}

export function basePriceForCard(card: Pick<Card, 'id'>): number {
  const unit = hashStringToUnit(card.id);
  const price = 0.25 + unit ** 2.2 * 40;
  return Math.round(price * 100) / 100;
}

export function simulateNewPrice(price: number): number {
  const r = Math.random();
  let pct: number;
  if (r < 0.62) pct = 0.02 + Math.random() * 0.13;
  else if (r < 0.88) pct = -(0.02 + Math.random() * 0.1);
  else pct = (Math.random() - 0.5) * 0.01;
  const next = Math.max(0.25, price * (1 + pct));
  return Math.round(next * 100) / 100;
}
