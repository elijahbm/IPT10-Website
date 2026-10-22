/** Formats cents as USD, hiding the ".00" on whole-dollar amounts so "$25" reads cleaner than "$25.00". */
export function formatAmount(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
}
