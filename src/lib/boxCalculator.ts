export function calculateBoxes(
  targetAmount: number,
): Array<{ amount: number }> {
  // Find n where sum of 1 to n is closest to but not exceeding targetAmount
  // Using the formula: sum = n(n+1)/2
  const n = Math.floor((-1 + Math.sqrt(1 + 8 * targetAmount)) / 2);

  // Generate boxes from 1 to n
  return Array.from({ length: n }, (_, i) => ({
    amount: i + 1,
  }));
}
