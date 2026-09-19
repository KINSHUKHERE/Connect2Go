/**
 * Password Policy & Validation Utility for Connect2Go
 *
 * Requirements for users:
 * - At least 1 capital letter (A-Z)
 * - At least 1 small letter (a-z)
 * - At least 1 number (0-9)
 * - Minimum size: 8 characters
 * - Maximum size: 16 characters
 */

export function checkPasswordPolicy(password = '') {
  const str = String(password || '');

  const hasCapital = /[A-Z]/.test(str);
  const hasSmall = /[a-z]/.test(str);
  const hasNumber = /[0-9]/.test(str);
  const hasMinLength = str.length >= 8;
  const hasMaxLength = str.length <= 16;
  const hasValidLength = hasMinLength && hasMaxLength;

  const rules = [
    {
      id: 'length',
      label: '8 to 16 characters',
      valid: hasValidLength,
      pendingMessage: str.length < 8 
        ? `Need at least 8 characters (${str.length}/8 entered)` 
        : str.length > 16 
          ? `Too long: max 16 characters (${str.length}/16 entered)` 
          : '8 to 16 characters',
    },
    {
      id: 'capital',
      label: 'At least 1 capital letter (A-Z)',
      valid: hasCapital,
      pendingMessage: 'At least 1 uppercase letter (A-Z)',
    },
    {
      id: 'small',
      label: 'At least 1 small letter (a-z)',
      valid: hasSmall,
      pendingMessage: 'At least 1 lowercase letter (a-z)',
    },
    {
      id: 'number',
      label: 'At least 1 number (0-9)',
      valid: hasNumber,
      pendingMessage: 'At least 1 numeric digit (0-9)',
    },
  ];

  const pendingRules = rules.filter((r) => !r.valid);
  const isSatisfied = pendingRules.length === 0;

  return {
    str,
    hasCapital,
    hasSmall,
    hasNumber,
    hasMinLength,
    hasMaxLength,
    hasValidLength,
    rules,
    pendingRules,
    isSatisfied,
  };
}
