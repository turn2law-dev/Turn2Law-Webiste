"use client";

import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { 
  validatePassword, 
  validateEmail, 
  validatePhoneNumber, 
  validateNumber, 
  validateText,
  validateBarNumber,
  validateExperience,
  validateConsultationFee,
  validatePAN,
  validateAadhaar,
  validateIFSC,
  validatePinCode,
  getPasswordStrength,
  type ValidationResult 
} from '@/utils/validation';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validationType?: 
    | 'password' 
    | 'email' 
    | 'phone' 
    | 'number' 
    | 'text'
    | 'barNumber'
    | 'experience'
    | 'consultationFee'
    | 'pan'
    | 'aadhaar'
    | 'ifsc'
    | 'pincode';
  value: string;
  onValueChange: (value: string, isValid: boolean) => void;
  showError?: boolean;
  countryCode?: string;
  numberOptions?: {
    min?: number;
    max?: number;
    allowDecimals?: boolean;
    allowNegative?: boolean;
  };
  textOptions?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternError?: string;
    allowSpecialChars?: boolean;
  };
  showPasswordStrength?: boolean;
  label?: string;
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    {
      validationType,
      value,
      onValueChange,
      showError = true,
      countryCode = '+91',
      numberOptions,
      textOptions,
      showPasswordStrength = false,
      label,
      className,
      onChange,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [error, setError] = useState<string>('');
    const [touched, setTouched] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<ReturnType<typeof getPasswordStrength> | null>(null);

    const validate = (val: string): ValidationResult => {
      if (!validationType) return { isValid: true };

      switch (validationType) {
        case 'password':
          return validatePassword(val);
        case 'email':
          return validateEmail(val);
        case 'phone':
          return validatePhoneNumber(val, countryCode);
        case 'number':
          return validateNumber(val, numberOptions);
        case 'text':
          return validateText(val, textOptions);
        case 'barNumber':
          return validateBarNumber(val);
        case 'experience':
          return validateExperience(val);
        case 'consultationFee':
          return validateConsultationFee(val);
        case 'pan':
          return validatePAN(val);
        case 'aadhaar':
          return validateAadhaar(val);
        case 'ifsc':
          return validateIFSC(val);
        case 'pincode':
          return validatePinCode(val);
        default:
          return { isValid: true };
      }
    };

    useEffect(() => {
      if (value && touched) {
        const result = validate(value);
        setError(result.error || '');
        onValueChange(value, result.isValid);

        // Update password strength
        if (validationType === 'password' && showPasswordStrength) {
          setPasswordStrength(getPasswordStrength(value));
        }
      } else if (!value && touched) {
        setError('');
        onValueChange(value, false);
        setPasswordStrength(null);
      }
    }, [value, touched, validationType, countryCode, numberOptions, textOptions]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      // For number inputs, filter out non-numeric characters
      if (validationType === 'number' || validationType === 'experience' || validationType === 'consultationFee') {
        const allowDecimals = numberOptions?.allowDecimals || validationType === 'consultationFee';
        const filtered = allowDecimals 
          ? newValue.replace(/[^\d.]/g, '')
          : newValue.replace(/[^\d]/g, '');
        
        const result = validate(filtered);
        setError(touched ? (result.error || '') : '');
        onValueChange(filtered, result.isValid);
      } else if (validationType === 'phone') {
        // Allow only digits for phone
        const filtered = newValue.replace(/[^\d]/g, '');
        const result = validate(filtered);
        setError(touched ? (result.error || '') : '');
        onValueChange(filtered, result.isValid);
      } else {
        const result = validate(newValue);
        setError(touched ? (result.error || '') : '');
        onValueChange(newValue, result.isValid);
      }

      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      const result = validate(value);
      setError(result.error || '');
      onValueChange(value, result.isValid);
      onBlur?.(e);
    };

    const getPasswordStrengthColor = () => {
      if (!passwordStrength) return '';
      switch (passwordStrength.level) {
        case 'weak':
          return 'bg-red-500';
        case 'medium':
          return 'bg-yellow-500';
        case 'strong':
          return 'bg-blue-500';
        case 'very-strong':
          return 'bg-green-500';
      }
    };

    const getPasswordStrengthWidth = () => {
      if (!passwordStrength) return '0%';
      return `${(passwordStrength.score / 9) * 100}%`;
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1">
            {label}
          </label>
        )}
        <Input
          ref={ref}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            className,
            error && touched && showError ? 'border-red-500 focus-visible:ring-red-500' : ''
          )}
          aria-invalid={!!error && touched}
          aria-describedby={error && touched ? `${props.id || 'input'}-error` : undefined}
          {...props}
        />
        
        {/* Password Strength Indicator */}
        {validationType === 'password' && showPasswordStrength && value && (
          <div className="mt-2">
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-300',
                  getPasswordStrengthColor()
                )}
                style={{ width: getPasswordStrengthWidth() }}
              />
            </div>
            {passwordStrength && (
              <p className="text-xs mt-1 text-muted-foreground">
                {passwordStrength.feedback}
              </p>
            )}
          </div>
        )}
        
        {/* Error Message */}
        {error && touched && showError && (
          <p
            id={`${props.id || 'input'}-error`}
            className="text-sm text-red-500 mt-1"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';
