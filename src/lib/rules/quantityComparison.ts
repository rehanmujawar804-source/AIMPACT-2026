/**
 * ProofTrail — Quantity and Financial Comparison Engine
 *
 * Implements deterministic calculation rules:
 * - Unit compatibility validation (Decision D6)
 * - Invoiced vs. Received quantity comparison
 * - Dispatched vs. Received quantity comparison
 * - Invoice line-item arithmetic (Rule 4)
 * - Indicative shortage value estimation (Rule 7)
 * - Financial balance reconciliation (Invoice - Payments - Approved Credits) (Rule 8 & 9)
 * - Delivered-goods reconciliation (Original balance vs. Adjusted delivered balance)
 */

export interface ComparisonResult {
  safe: boolean;
  difference?: number;
  expression?: string;
  unit?: string;
  error?: string;
}

export interface LineArithmeticResult {
  valid: boolean;
  expectedAmount: number;
  recordedAmount: number;
  difference: number;
  currency: string;
  matches: boolean;
  error?: string;
}

export interface IndicativeValueResult {
  valid: boolean;
  value: number;
  currency: string;
  expression: string;
  isIndicative: true;
  error?: string;
}

export interface FinancialReconciliationResult {
  valid: boolean;
  invoiceAmount: number;
  totalPayments: number;
  totalApprovedCredits: number;
  balanceBeforeUnapprovedCredits: number;
  currency: string;
  error?: string;
}

export interface DeliveredGoodsReconciliationResult {
  valid: boolean;
  originalInvoiceTotal: number;
  verifiedDeliveredValue: number;
  shortageQuantity: number;
  shortageValue: number;
  totalPayments: number;
  totalApprovedCredits: number;
  originalOutstandingBalance: number;
  adjustedDeliveredBalance: number;
  currency: string;
  error?: string;
}

/**
 * Validates whether two units are compatible for direct mathematical comparison.
 * In ProofTrail, units must match identically (case-insensitive string trim).
 * No arbitrary unit conversions (e.g. pcs to boxes) are performed without a verified mapping.
 */
export function validateUnitCompatibility(unitA: string, unitB: string): boolean {
  if (!unitA || !unitB) return false;
  const cleanA = unitA.trim().toLowerCase();
  const cleanB = unitB.trim().toLowerCase();
  return cleanA === cleanB;
}

/**
 * Safely rounds a monetary number to 2 decimal places (INR paise representation).
 * Prevents IEEE 754 floating point drift (e.g. 15000 - 12000.05).
 */
export function roundTo2Decimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Compares Invoiced quantity against Received quantity.
 * difference = invoiced_qty - received_qty
 * NOTE: Negative differences (over-delivery) are preserved and never clamped to zero.
 */
export function compareInvoiceAndReceiptQuantities(
  invoicedQty: number,
  receivedQty: number,
  invoicedUnit: string,
  receivedUnit: string
): ComparisonResult {
  if (!Number.isFinite(invoicedQty) || !Number.isFinite(receivedQty)) {
    return { safe: false, error: "Non-finite quantity encountered." };
  }

  if (!validateUnitCompatibility(invoicedUnit, receivedUnit)) {
    return {
      safe: false,
      error: `Incompatible units: cannot compare '${invoicedUnit}' with '${receivedUnit}' without a conversion rule.`,
    };
  }

  const diff = invoicedQty - receivedQty;
  return {
    safe: true,
    difference: diff,
    expression: `${invoicedQty} - ${receivedQty}`,
    unit: invoicedUnit.trim().toLowerCase(),
  };
}

/**
 * Compares Dispatched quantity against Received quantity.
 * difference = dispatched_qty - received_qty
 * Maintained as a separate comparison because dispatch quantities and invoice quantities
 * represent distinct commercial facts (docs/04 Rule 6).
 */
export function compareDispatchAndReceiptQuantities(
  dispatchedQty: number,
  receivedQty: number,
  dispatchedUnit: string,
  receivedUnit: string
): ComparisonResult {
  if (!Number.isFinite(dispatchedQty) || !Number.isFinite(receivedQty)) {
    return { safe: false, error: "Non-finite quantity encountered." };
  }

  if (!validateUnitCompatibility(dispatchedUnit, receivedUnit)) {
    return {
      safe: false,
      error: `Incompatible units: cannot compare '${dispatchedUnit}' with '${receivedUnit}' without a conversion rule.`,
    };
  }

  const diff = dispatchedQty - receivedQty;
  return {
    safe: true,
    difference: diff,
    expression: `${dispatchedQty} - ${receivedQty}`,
    unit: dispatchedUnit.trim().toLowerCase(),
  };
}

/**
 * Verifies invoice line-item arithmetic:
 * expected_line_amount = quantity * unit_price
 */
export function calculateInvoiceLineArithmetic(
  quantity: number,
  unitPrice: number,
  recordedLineAmount: number,
  currency: string = "INR"
): LineArithmeticResult {
  if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice) || !Number.isFinite(recordedLineAmount)) {
    return {
      valid: false,
      expectedAmount: 0,
      recordedAmount: 0,
      difference: 0,
      currency,
      matches: false,
      error: "Non-finite values encountered in invoice line arithmetic.",
    };
  }

  const expectedAmount = roundTo2Decimals(quantity * unitPrice);
  const recorded = roundTo2Decimals(recordedLineAmount);
  const diff = roundTo2Decimals(expectedAmount - recorded);

  return {
    valid: true,
    expectedAmount,
    recordedAmount: recorded,
    difference: diff,
    currency,
    matches: diff === 0,
  };
}

/**
 * Calculates the indicative shortage value based on a quantity discrepancy and unit price.
 * value = quantity_difference * unit_price
 * NOTE: This is strictly an indicative figure. It must never be presented as an authoritative
 * legal loss or approved compensation claim.
 */
export function calculateIndicativeShortageValue(
  quantityDifference: number,
  unitPrice: number,
  currency: string = "INR"
): IndicativeValueResult {
  if (!Number.isFinite(quantityDifference) || !Number.isFinite(unitPrice)) {
    return {
      valid: false,
      value: 0,
      currency,
      expression: "",
      isIndicative: true,
      error: "Non-finite values encountered in shortage value calculation.",
    };
  }

  const value = roundTo2Decimals(quantityDifference * unitPrice);
  return {
    valid: true,
    value,
    currency,
    expression: `${quantityDifference} * ${unitPrice}`,
    isIndicative: true,
  };
}

/**
 * Performs financial balance reconciliation:
 * balance = invoice_amount - recorded_payments - approved_credits
 * NOTE: Only approved credit notes may reduce the balance. Pending or unapproved credits are excluded.
 */
export function calculateFinancialReconciliation(
  invoiceAmount: number,
  recordedPayments: Array<{ amount: number; currency: string }>,
  creditNotes: Array<{ amount: number; currency: string; status?: "approved" | "pending" | "rejected" | string }>,
  expectedCurrency: string = "INR"
): FinancialReconciliationResult {
  if (!expectedCurrency || typeof expectedCurrency !== "string" || expectedCurrency.trim() === "") {
    return {
      valid: false,
      invoiceAmount: Number.isFinite(invoiceAmount) ? roundTo2Decimals(invoiceAmount) : 0,
      totalPayments: 0,
      totalApprovedCredits: 0,
      balanceBeforeUnapprovedCredits: 0,
      currency: expectedCurrency || "",
      error: "Invalid or missing expected currency.",
    };
  }

  const normExpectedCurrency = expectedCurrency.trim().toUpperCase();

  if (!Number.isFinite(invoiceAmount)) {
    return {
      valid: false,
      invoiceAmount: 0,
      totalPayments: 0,
      totalApprovedCredits: 0,
      balanceBeforeUnapprovedCredits: 0,
      currency: normExpectedCurrency,
      error: "Invalid or non-finite invoice amount.",
    };
  }

  let totalPayments = 0;
  for (const pay of recordedPayments) {
    if (!pay.currency || typeof pay.currency !== "string" || pay.currency.trim() === "") {
      return {
        valid: false,
        invoiceAmount: roundTo2Decimals(invoiceAmount),
        totalPayments: 0,
        totalApprovedCredits: 0,
        balanceBeforeUnapprovedCredits: 0,
        currency: normExpectedCurrency,
        error: "Invalid or missing payment currency.",
      };
    }

    const payCurrency = pay.currency.trim().toUpperCase();
    if (payCurrency !== normExpectedCurrency) {
      return {
        valid: false,
        invoiceAmount: roundTo2Decimals(invoiceAmount),
        totalPayments: 0,
        totalApprovedCredits: 0,
        balanceBeforeUnapprovedCredits: 0,
        currency: normExpectedCurrency,
        error: `Currency mismatch: payment currency '${pay.currency}' does not match expected invoice currency '${expectedCurrency}'.`,
      };
    }

    if (!Number.isFinite(pay.amount)) {
      return {
        valid: false,
        invoiceAmount: roundTo2Decimals(invoiceAmount),
        totalPayments: 0,
        totalApprovedCredits: 0,
        balanceBeforeUnapprovedCredits: 0,
        currency: normExpectedCurrency,
        error: "Non-finite payment amount encountered.",
      };
    }
    totalPayments += pay.amount;
  }

  let totalApprovedCredits = 0;
  for (const cn of creditNotes) {
    if (!cn.currency || typeof cn.currency !== "string" || cn.currency.trim() === "") {
      return {
        valid: false,
        invoiceAmount: roundTo2Decimals(invoiceAmount),
        totalPayments: roundTo2Decimals(totalPayments),
        totalApprovedCredits: 0,
        balanceBeforeUnapprovedCredits: 0,
        currency: normExpectedCurrency,
        error: "Invalid or missing credit note currency.",
      };
    }

    const cnCurrency = cn.currency.trim().toUpperCase();
    if (cnCurrency !== normExpectedCurrency) {
      return {
        valid: false,
        invoiceAmount: roundTo2Decimals(invoiceAmount),
        totalPayments: roundTo2Decimals(totalPayments),
        totalApprovedCredits: 0,
        balanceBeforeUnapprovedCredits: 0,
        currency: normExpectedCurrency,
        error: `Currency mismatch: credit note currency '${cn.currency}' does not match expected invoice currency '${expectedCurrency}'.`,
      };
    }

    if (!Number.isFinite(cn.amount)) {
      return {
        valid: false,
        invoiceAmount: roundTo2Decimals(invoiceAmount),
        totalPayments: roundTo2Decimals(totalPayments),
        totalApprovedCredits: 0,
        balanceBeforeUnapprovedCredits: 0,
        currency: normExpectedCurrency,
        error: "Non-finite credit note amount encountered.",
      };
    }
    // Only count approved credit notes (or if status is undefined, treat as approved only when explicitly flagged)
    if (cn.status === "approved") {
      totalApprovedCredits += cn.amount;
    }
  }

  const roundedInv = roundTo2Decimals(invoiceAmount);
  const roundedPay = roundTo2Decimals(totalPayments);
  const roundedCredits = roundTo2Decimals(totalApprovedCredits);
  const balance = roundTo2Decimals(roundedInv - roundedPay - roundedCredits);

  return {
    valid: true,
    invoiceAmount: roundedInv,
    totalPayments: roundedPay,
    totalApprovedCredits: roundedCredits,
    balanceBeforeUnapprovedCredits: balance,
    currency: normExpectedCurrency,
  };
}

/**
 * Reconciles financial positions distinguishing the original invoice balance from
 * the adjusted balance under a delivered-goods basis.
 *
 * Example:
 * 120 invoiced units at ₹400 = ₹48,000 original invoice total.
 * 110 accepted units = ₹44,000 verified delivered value.
 * ₹30,000 paid, no approved credits.
 * Original outstanding balance = ₹48,000 - ₹30,000 = ₹18,000.
 * Adjusted delivered balance = ₹44,000 - ₹30,000 = ₹14,000.
 */
export function calculateDeliveredGoodsReconciliation(
  invoicedQty: number,
  unitPrice: number,
  acceptedQty: number,
  recordedPayments: Array<{ amount: number; currency: string }>,
  creditNotes: Array<{ amount: number; currency: string; status?: "approved" | "pending" | "rejected" | string }>,
  expectedCurrency: string = "INR"
): DeliveredGoodsReconciliationResult {
  if (!Number.isFinite(invoicedQty) || !Number.isFinite(unitPrice) || !Number.isFinite(acceptedQty)) {
    return {
      valid: false,
      originalInvoiceTotal: 0,
      verifiedDeliveredValue: 0,
      shortageQuantity: 0,
      shortageValue: 0,
      totalPayments: 0,
      totalApprovedCredits: 0,
      originalOutstandingBalance: 0,
      adjustedDeliveredBalance: 0,
      currency: expectedCurrency,
      error: "Non-finite quantities or unit price in delivered-goods reconciliation.",
    };
  }

  const originalInvoiceTotal = roundTo2Decimals(invoicedQty * unitPrice);
  const verifiedDeliveredValue = roundTo2Decimals(acceptedQty * unitPrice);
  const shortageQuantity = invoicedQty - acceptedQty;
  const shortageValue = roundTo2Decimals(shortageQuantity * unitPrice);

  const baseRecon = calculateFinancialReconciliation(
    originalInvoiceTotal,
    recordedPayments,
    creditNotes,
    expectedCurrency
  );

  if (!baseRecon.valid) {
    return {
      valid: false,
      originalInvoiceTotal,
      verifiedDeliveredValue,
      shortageQuantity,
      shortageValue,
      totalPayments: 0,
      totalApprovedCredits: 0,
      originalOutstandingBalance: 0,
      adjustedDeliveredBalance: 0,
      currency: expectedCurrency,
      error: baseRecon.error,
    };
  }

  const originalOutstandingBalance = baseRecon.balanceBeforeUnapprovedCredits;
  const adjustedDeliveredBalance = roundTo2Decimals(
    verifiedDeliveredValue - baseRecon.totalPayments - baseRecon.totalApprovedCredits
  );

  return {
    valid: true,
    originalInvoiceTotal,
    verifiedDeliveredValue,
    shortageQuantity,
    shortageValue,
    totalPayments: baseRecon.totalPayments,
    totalApprovedCredits: baseRecon.totalApprovedCredits,
    originalOutstandingBalance,
    adjustedDeliveredBalance,
    currency: baseRecon.currency,
  };
}

