/** Default Pro trial length when TRIAL_DAYS / NEXT_PUBLIC_TRIAL_DAYS are unset. */
export const DEFAULT_TRIAL_DAYS = 3;

export function getTrialDays(): number {
  const raw = process.env.TRIAL_DAYS ?? process.env.NEXT_PUBLIC_TRIAL_DAYS ?? String(DEFAULT_TRIAL_DAYS);
  const days = Number(raw);
  return Number.isFinite(days) && days > 0 ? Math.floor(days) : DEFAULT_TRIAL_DAYS;
}

/** Client-safe trial length for marketing copy (set NEXT_PUBLIC_TRIAL_DAYS at build). */
export function getPublicTrialDays(): number {
  const raw = process.env.NEXT_PUBLIC_TRIAL_DAYS ?? String(DEFAULT_TRIAL_DAYS);
  const days = Number(raw);
  return Number.isFinite(days) && days > 0 ? Math.floor(days) : DEFAULT_TRIAL_DAYS;
}
