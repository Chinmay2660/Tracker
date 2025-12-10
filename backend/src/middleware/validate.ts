import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Common validation rules
 */
export const commonValidations = {
  // String validation
  string: (field: string, minLength: number = 1, maxLength: number = 1000) =>
    body(field)
      .trim()
      .isLength({ min: minLength, max: maxLength })
      .withMessage(`${field} must be between ${minLength} and ${maxLength} characters`)
      .escape(), // Escape HTML entities

  // Optional string validation
  optionalString: (field: string, maxLength: number = 1000) =>
    body(field)
      .optional()
      .trim()
      .isLength({ max: maxLength })
      .withMessage(`${field} must not exceed ${maxLength} characters`)
      .escape(),

  // URL validation
  url: (field: string) =>
    body(field)
      .optional()
      .trim()
      .isURL({ protocols: ['http', 'https'] })
      .withMessage(`${field} must be a valid HTTP or HTTPS URL`)
      .escape(),

  // Number validation
  number: (field: string, min?: number, max?: number) => {
    let validator = body(field)
      .optional()
      .isNumeric()
      .withMessage(`${field} must be a number`);
    
    if (min !== undefined) {
      validator = validator.isInt({ min }).withMessage(`${field} must be at least ${min}`);
    }
    if (max !== undefined) {
      validator = validator.isInt({ max }).withMessage(`${field} must be at most ${max}`);
    }
    
    return validator;
  },

  // Array validation
  array: (field: string, maxItems: number = 50) =>
    body(field)
      .optional()
      .isArray({ max: maxItems })
      .withMessage(`${field} must be an array with at most ${maxItems} items`),

  // Date validation
  date: (field: string) =>
    body(field)
      .optional()
      .isISO8601()
      .withMessage(`${field} must be a valid ISO 8601 date`),

  // Email validation
  email: (field: string) =>
    body(field)
      .trim()
      .isEmail()
      .withMessage(`${field} must be a valid email address`)
      .normalizeEmail()
      .escape(),
};

