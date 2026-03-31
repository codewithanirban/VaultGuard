// File: Frontend/src/utils/passwordHealth.js
// Purpose: Analyzes an array of password entries to detect reused, weak, and outdated passwords.
// Dependencies: getPasswordStrength from ./passwordGenerator.js
// Production-safe: yes

import { getPasswordStrength } from './passwordGenerator';

export const checkHealth = (entries) => {
  const healthMap = new Map();
  const passwordCounts = {};

  // Find duplicates by tallying
  entries.forEach(entry => {
    if (entry.password) {
      passwordCounts[entry.password] = (passwordCounts[entry.password] || 0) + 1;
    }
  });

  entries.forEach(entry => {
    const warnings = [];

    // Duplicate check
    if (entry.password && passwordCounts[entry.password] > 1) {
      warnings.push('Reused password');
    }

    // Weak check
    if (entry.password) {
      const strength = getPasswordStrength(entry.password);
      if (strength.score < 3) {
        warnings.push('Weak password');
      }
    }

    // Outdated check
    if (entry.updatedAt) {
      const msSinceUpdate = Date.now() - new Date(entry.updatedAt).getTime();
      const msIn90Days = 90 * 24 * 60 * 60 * 1000;
      if (msSinceUpdate > msIn90Days) {
        warnings.push('Not updated in 90+ days');
      }
    }

    if (warnings.length > 0) {
      healthMap.set(entry._id ? entry._id.toString() : Math.random().toString(), warnings);
    }
  });

  return healthMap;
};

export const getHealthSummary = (healthMap) => {
  let weak = 0;
  let reused = 0;
  let outdated = 0;
  let total = healthMap.size;

  healthMap.forEach(warnings => {
    if (warnings.includes('Weak password')) weak++;
    if (warnings.includes('Reused password')) reused++;
    if (warnings.includes('Not updated in 90+ days')) outdated++;
  });

  return { weak, reused, outdated, total };
};
