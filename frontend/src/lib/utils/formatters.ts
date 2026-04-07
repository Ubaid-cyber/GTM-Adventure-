/**
 * 🛠️ Hydration-Safe Formatters
 * 
 * Standard toLocaleString can cause mismatches between Server (Node.js) 
 * and Client (Browser) locales. These utilities use fixed logic.
 */

export function formatINR(amount: number): string {
  // Manual Indian formatting: 1,23,456.00
  const parts = amount.toFixed(2).split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return `₹${formatted}`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
