export function calculateProcessedPercentage(
  preferredLineId: string | null,
  responseCount: number,
  expected: number,
): number {
  if (!preferredLineId) {
    return 0;
  }
  if (expected <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((responseCount / expected) * 100));
}
