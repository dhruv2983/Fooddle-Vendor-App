export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateRequired = (value: string, fieldName: string = 'Field'): ValidationResult => {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName} is required`,
    };
  }
  return { isValid: true };
};

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  const requiredCheck = validateRequired(email, 'Email');
  if (!requiredCheck.isValid) {
    return requiredCheck;
  }
  
  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      error: 'Please enter a valid email address',
    };
  }
  
  return { isValid: true };
};

export const validateOrderId = (orderId: string): ValidationResult => {
  const requiredCheck = validateRequired(orderId, 'Order ID');
  if (!requiredCheck.isValid) {
    return requiredCheck;
  }
  
  // Check if order ID contains only numbers
  const numericRegex = /^\d+$/;
  if (!numericRegex.test(orderId.trim())) {
    return {
      isValid: false,
      error: 'Order ID must contain only numbers',
    };
  }
  
  return { isValid: true };
};

export const validatePrice = (price: string): ValidationResult => {
  const requiredCheck = validateRequired(price, 'Price');
  if (!requiredCheck.isValid) {
    return requiredCheck;
  }
  
  const priceNumber = parseFloat(price);
  if (isNaN(priceNumber) || priceNumber < 0) {
    return {
      isValid: false,
      error: 'Please enter a valid price',
    };
  }
  
  return { isValid: true };
};