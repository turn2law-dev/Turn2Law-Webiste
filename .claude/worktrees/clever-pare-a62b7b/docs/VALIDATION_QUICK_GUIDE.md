# Quick Implementation Guide for Validation

## How to Add Validation to Any Form

### Step 1: Import ValidatedInput
```typescript
import { ValidatedInput } from '@/components/ui/validated-input';
```

### Step 2: Add Validation State
```typescript
const [validationState, setValidationState] = useState<{ [key: string]: boolean }>({
  fieldName1: false,
  fieldName2: false,
  // ... more fields
});
```

### Step 3: Create Handler Function
```typescript
const handleValidatedInputChange = (field: string, value: string, isValid: boolean) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  setValidationState(prev => ({ ...prev, [field]: isValid }));
};
```

### Step 4: Replace Input with ValidatedInput
```typescript
// Before:
<Input
  type="email"
  value={formData.email}
  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
  placeholder="Email"
  required
/>

// After:
<ValidatedInput
  type="email"
  value={formData.email}
  onValueChange={(value, isValid) => handleValidatedInputChange('email', value, isValid)}
  validationType="email"
  placeholder="Email Address"
  label="Email"
  required
/>
```

### Step 5: Validate on Submit
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Check all required fields are valid
  const requiredFields = ['email', 'password', 'name'];
  const invalidFields = requiredFields.filter(field => !validationState[field]);
  
  if (invalidFields.length > 0) {
    setError(`Please correctly fill in: ${invalidFields.join(', ')}`);
    return;
  }
  
  // Proceed with form submission
  // ...
};
```

## Validation Types Reference

| validationType | Use For | Example |
|---------------|---------|---------|
| `password` | Password fields | Strong password with requirements |
| `email` | Email addresses | Valid format, no disposable domains |
| `phone` | Phone numbers | Indian: 10 digits, starts with 6-9 |
| `number` | Numeric values | Salary, age, count |
| `text` | Text fields | Names, addresses, descriptions |
| `barNumber` | Bar Council Number | Lawyer registration |
| `experience` | Years of experience | 0-70 years |
| `consultationFee` | Fee amounts | Positive decimals |
| `pan` | PAN card | ABCDE1234F format |
| `aadhaar` | Aadhaar number | 12 digits |
| `ifsc` | IFSC code | ABCD0123456 format |
| `pincode` | PIN code | 6 digits |

## Common Options

### Number Validation
```typescript
<ValidatedInput
  validationType="number"
  numberOptions={{
    min: 0,
    max: 100,
    allowDecimals: true,
    allowNegative: false
  }}
/>
```

### Text Validation
```typescript
<ValidatedInput
  validationType="text"
  textOptions={{
    minLength: 2,
    maxLength: 50,
    allowSpecialChars: false
  }}
/>
```

### Password with Strength Meter
```typescript
<ValidatedInput
  type="password"
  validationType="password"
  showPasswordStrength={true}
/>
```

## Forms to Update (Priority Order)

### ✅ Completed
1. Signup Page - Full validation implemented

### 🔄 Next Priority
2. Login Page - Add email validation
3. Reset Password Page - Add strong password validation
4. Settings Page - Profile field validation
5. Wallet Pages - Amount validation

### 📝 Remaining
6. Service Forms (LLP, Partnership, Private Limited)
7. SmartMatch Modal
8. Contact Forms
9. Bank Account Forms

## Quick Tips

1. **Always validate on submit** - Even if fields look valid
2. **Use proper validation types** - Don't use generic 'text' for emails
3. **Add labels** - Improves accessibility and UX
4. **Show error messages** - Set `showError={true}` (default)
5. **Test edge cases** - Very long inputs, special characters, etc.

## Example: Complete Form

```typescript
"use client";

import { useState } from 'react';
import { ValidatedInput } from '@/components/ui/validated-input';
import { Button } from '@/components/ui/button';

export default function MyForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    age: '',
  });

  const [validationState, setValidationState] = useState({
    email: false,
    password: false,
    phone: false,
    age: false,
  });

  const handleValidatedInputChange = (field: string, value: string, isValid: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setValidationState(prev => ({ ...prev, [field]: isValid }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = ['email', 'password', 'phone', 'age'];
    const invalidFields = requiredFields.filter(field => !validationState[field]);
    
    if (invalidFields.length > 0) {
      alert(`Invalid fields: ${invalidFields.join(', ')}`);
      return;
    }
    
    // Submit form
    console.log('Form data:', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ValidatedInput
        type="email"
        value={formData.email}
        onValueChange={(value, isValid) => handleValidatedInputChange('email', value, isValid)}
        validationType="email"
        label="Email"
        required
      />

      <ValidatedInput
        type="password"
        value={formData.password}
        onValueChange={(value, isValid) => handleValidatedInputChange('password', value, isValid)}
        validationType="password"
        showPasswordStrength={true}
        label="Password"
        required
      />

      <ValidatedInput
        type="tel"
        value={formData.phone}
        onValueChange={(value, isValid) => handleValidatedInputChange('phone', value, isValid)}
        validationType="phone"
        countryCode="+91"
        label="Phone Number"
        required
      />

      <ValidatedInput
        type="number"
        value={formData.age}
        onValueChange={(value, isValid) => handleValidatedInputChange('age', value, isValid)}
        validationType="number"
        numberOptions={{ min: 18, max: 100, allowDecimals: false }}
        label="Age"
        required
      />

      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Testing Checklist

- [ ] Try submitting with empty fields
- [ ] Try invalid email formats
- [ ] Try weak passwords
- [ ] Try numbers outside allowed range
- [ ] Try text with special characters (when not allowed)
- [ ] Try very long inputs
- [ ] Check error messages display correctly
- [ ] Check validation state updates properly
- [ ] Check form submits only when all valid

---

**Need Help?** Check `/docs/SECURITY_VALIDATION_IMPLEMENTATION.md` for full documentation.
