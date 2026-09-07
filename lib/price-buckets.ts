export interface PriceBucket {
  label: string;
  min?: number;
  max?: number;
}

/** Rounds up to the next 1 / 2 / 5 × 10ⁿ so thresholds read as round numbers. */
function niceRound(value: number): number {
  if (value <= 0) return 0;

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalised = value / magnitude;
  const step = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10;

  return step * magnitude;
}

/**
 * Fixed brackets go stale the moment the catalogue changes: the shop shipped
 * with "moins de 100 €" and "plus de 1500 €" while stocking bikes from 900 € to
 * 9 000 €, so every product landed in the last bracket. Derive them from the
 * actual prices instead, on quantiles rather than the range — prices are
 * skewed, and splitting the range evenly would leave the top brackets empty.
 */
export function buildPriceBuckets(prices: number[]): PriceBucket[] {
  const sorted = prices.filter((p) => Number.isFinite(p) && p > 0).sort((a, b) => a - b);

  if (sorted.length < 4) return [{ label: "Tous les prix" }];

  const quantile = (q: number) => sorted[Math.floor((sorted.length - 1) * q)];
  const thresholds = [...new Set([quantile(1 / 3), quantile(2 / 3)].map(niceRound))]
    .filter((t) => t > sorted[0] && t < sorted[sorted.length - 1])
    .sort((a, b) => a - b);

  if (thresholds.length === 0) return [{ label: "Tous les prix" }];

  const money = (v: number) => new Intl.NumberFormat("fr-FR").format(v) + " €";

  const buckets: PriceBucket[] = [{ label: "Tous les prix" }];

  buckets.push({ label: `Moins de ${money(thresholds[0])}`, max: thresholds[0] });

  for (let i = 1; i < thresholds.length; i++) {
    buckets.push({
      label: `${money(thresholds[i - 1])} – ${money(thresholds[i])}`,
      min: thresholds[i - 1],
      max: thresholds[i],
    });
  }

  buckets.push({
    label: `Plus de ${money(thresholds[thresholds.length - 1])}`,
    min: thresholds[thresholds.length - 1],
  });

  return buckets;
}
