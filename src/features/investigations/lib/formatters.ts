/**
 * ProofTrail — Financial & Date Formatters
 * Formats currency values in Indian Rupees (INR) using en-IN locale
 * and handles consistent display formatting across investigation components.
 */

export function formatINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || typeof amount !== "number" || isNaN(amount)) {
    return "₹0.00";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

