import { useMemo } from 'react';

/**
 * Computes a password strength score (0‑4) based on:
 *   - length ≥ 8   (+1)
 *   - length ≥ 12  (+1)
 *   - has uppercase (+1)
 *   - has digit     (+1)
 *   - has symbol    (+1)
 *
 * @param {string} password
 * @returns {{ score: number, label: string, className: string }}
 */
const evaluateStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const levels = [
    { label: 'Very weak', className: 'psb--very-weak' },
    { label: 'Weak', className: 'psb--weak' },
    { label: 'Fair', className: 'psb--fair' },
    { label: 'Strong', className: 'psb--strong' },
    { label: 'Very strong', className: 'psb--very-strong' },
  ];

  const idx = Math.min(score, 4);
  return { score: idx, ...levels[idx] };
};

/**
 * PasswordStrengthBar — visual indicator of password strength.
 *
 * Renders a 4-segment animated bar plus a text label.
 *   weak  → red (#ef4444)
 *   fair  → amber (#eab308)
 *   strong → green (#22c55e)
 *   very strong → teal (#06b6d4)
 *
 * @param {{ password: string }} props
 * @returns {JSX.Element | null}
 */
const PasswordStrengthBar = ({ password }) => {
  const strength = useMemo(() => evaluateStrength(password), [password]);

  if (!password || password.length === 0) return null;

  return (
    <div className="psb" aria-label={`Password strength: ${strength.label}`}>
      <div className="psb-bar">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`psb-segment ${i < strength.score ? strength.className : ''}`}
          />
        ))}
      </div>
      <span className={`psb-label ${strength.className}`}>{strength.label}</span>
    </div>
  );
};

export default PasswordStrengthBar;
