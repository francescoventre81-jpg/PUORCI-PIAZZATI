export type CountdownValue = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

export function getCountdownValue(
  nowMs: number,
  standardPriceStartMs: number,
): CountdownValue {
  const remaining = Math.max(0, standardPriceStartMs - nowMs);
  const totalSeconds = Math.floor(remaining / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    expired: remaining === 0,
  };
}
