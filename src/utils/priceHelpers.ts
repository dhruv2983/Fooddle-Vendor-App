/**
 * Utility functions for price formatting and calculations
 */

export const formatPrice = (price: string | number): number => {
  if (typeof price === 'string') {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  }
  return price || 0;
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const calculateDiscount = (originalPrice: number, discountedPrice: number): number => {
  if (originalPrice <= 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

export const hasValidPrice = (price: string | number): boolean => {
  const numPrice = formatPrice(price);
  return numPrice > 0;
};