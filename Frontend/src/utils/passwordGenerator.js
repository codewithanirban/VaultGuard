// File: Frontend/src/utils/passwordGenerator.js
// Purpose: Pure JS utility for cryptographically secure password generation and strength testing.
// Dependencies: none
// Production-safe: yes

export const generatePassword = ({ length = 16, useUpper = true, useLower = true, useNumbers = true, useSymbols = true } = {}) => {
  if (!useUpper && !useLower && !useNumbers && !useSymbols) {
    throw new Error('At least one character set must be enabled');
  }

  const LOWER = 'abcdefghijklmnopqrstuvwxyz';
  const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const DIGITS = '0123456789';
  const SYMS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const sets = [];
  if (useLower) sets.push(LOWER);
  if (useUpper) sets.push(UPPER);
  if (useNumbers) sets.push(DIGITS);
  if (useSymbols) sets.push(SYMS);

  const fullPool = sets.join('');
  const guaranteed = [];

  // Guarantee at least one char from each enabled set
  for (const charset of sets) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    guaranteed.push(charset[arr[0] % charset.length]);
  }

  const remainingLength = Math.max(0, length - Math.max(0, guaranteed.length));
  const remaining = [];
  
  if (remainingLength > 0) {
    const arr = new Uint32Array(remainingLength);
    crypto.getRandomValues(arr);
    for (let i = 0; i < remainingLength; i++) {
      remaining.push(fullPool[arr[i] % fullPool.length]);
    }
  }

  // Combine and shuffle
  const finalArray = [...guaranteed, ...remaining];
  const shuffleArr = new Uint32Array(finalArray.length);
  crypto.getRandomValues(shuffleArr);

  for (let i = finalArray.length - 1; i > 0; i--) {
    const j = shuffleArr[i] % (i + 1);
    [finalArray[i], finalArray[j]] = [finalArray[j], finalArray[i]];
  }

  return finalArray.join('');
};

export const getPasswordStrength = (password) => {
  let score = 0;
  if (!password) return { score: 0, label: 'very weak', color: '#ef4444' };

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  let label = 'very weak';
  let color = '#ef4444';

  if (score === 1) {
    label = 'weak';
    color = '#ef4444';
  } else if (score === 2) {
    label = 'fair';
    color = '#f97316';
  } else if (score === 3) {
    label = 'strong';
    color = '#22c55e';
  } else if (score === 4) {
    label = 'very strong';
    color = '#14b8a6';
  }

  return { score, label, color };
};
