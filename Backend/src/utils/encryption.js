/**
 * ═══════════════════════════════════════════════════════
 *  AES-256-CBC Encryption Utility — Security Rationale
 * ═══════════════════════════════════════════════════════
 *
 *  WHY AES-256-CBC?
 *    AES-256 is the industry-standard symmetric cipher approved by NIST.
 *    The 256-bit key length provides a very large key space, making
 *    brute-force attacks computationally infeasible.  CBC (Cipher Block
 *    Chaining) mode chains each block to the previous one, meaning
 *    identical plaintext blocks produce different ciphertext — as long
 *    as unique IVs are used.
 *
 *  WHY MUST THE KEY LIVE IN AN ENV VARIABLE?
 *    Embedding cryptographic keys in source code means they end up in
 *    version control, CI logs, build artefacts, and Docker layers.
 *    Anyone with repo access — including compromised CI pipelines —
 *    would be able to decrypt every stored password.  Environment
 *    variables keep the key out of the codebase and allow it to be
 *    rotated independently of deployments.
 *
 *  HOW DOES THIS MODULE AVOID IV REUSE?
 *    Every call to encrypt() generates a fresh 16-byte IV via
 *    crypto.randomBytes().  The IV is stored alongside the ciphertext
 *    in the database (it is not secret — only uniqueness matters).
 *    Because the IV is never reused with the same key, an attacker
 *    cannot deduce plaintext relationships between entries, even if
 *    two users store the same password.
 * ═══════════════════════════════════════════════════════
 */

const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // 16 bytes for AES-CBC

/**
 * Returns the 32-byte encryption key derived from the ENCRYPTION_KEY env var.
 * @returns {Buffer} 32-byte key buffer.
 * @throws {Error} If ENCRYPTION_KEY is missing or not 64 hex characters.
 */
const getKey = () => {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return Buffer.from(hex, 'hex');
};

/**
 * Encrypts a plaintext string using AES-256-CBC.
 *
 * @param {string} plaintext - The text to encrypt.
 * @returns {{ iv: string, encryptedData: string }}
 *   `iv`            — random 16-byte initialisation vector, hex-encoded.
 *   `encryptedData` — ciphertext, hex-encoded.
 * @throws {Error} If plaintext is falsy or encryption fails.
 */
const encrypt = (plaintext) => {
  if (!plaintext || typeof plaintext !== 'string') {
    throw new Error('encrypt() requires a non-empty string');
  }

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
  };
};

/**
 * Decrypts an AES-256-CBC ciphertext back to plaintext.
 *
 * @param {{ iv: string, encryptedData: string }} payload
 *   `iv`            — hex-encoded initialisation vector.
 *   `encryptedData` — hex-encoded ciphertext.
 * @returns {string} The original plaintext.
 * @throws {Error} If the payload is malformed or decryption fails.
 */
const decrypt = ({ iv, encryptedData }) => {
  if (!iv || !encryptedData) {
    throw new Error('decrypt() requires both iv and encryptedData');
  }

  const key = getKey();
  const ivBuffer = Buffer.from(iv, 'hex');

  if (ivBuffer.length !== IV_LENGTH) {
    throw new Error(`IV must be ${IV_LENGTH} bytes — received ${ivBuffer.length}`);
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

module.exports = { encrypt, decrypt };
