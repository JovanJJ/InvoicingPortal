import crypto from 'crypto';

// 1. Configuration
const ALGORITHM = 'aes-256-gcm';

// The key must be exactly 32 bytes (256 bits). 
// Generate one in your terminal using: require('crypto').randomBytes(32).toString('hex')
// Store it in your .env file.
const IV_LENGTH = 16;

function getEncryptionKey() {
    const rawKey = process.env.MASTER_ENCRYPTION_KEY;

    if (!rawKey) {
        throw new Error('MASTER_ENCRYPTION_KEY is not set');
    }

    return Buffer.from(rawKey, 'hex');
}

/**
 * Encrypts an IBAN and formats it for easy database storage.
 */
export function encryptIBAN(iban) {
    const encryptionKey = getEncryptionKey();

    // 1. Generate a random Initialization Vector
    const iv = crypto.randomBytes(IV_LENGTH);

    // 2. Create the cipher using the algorithm, key, and the random IV
    const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

    // 3. Encrypt the IBAN (from UTF-8 text to Hexadecimal)
    let encrypted = cipher.update(iban, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // 4. Get the Authentication Tag
    const authTag = cipher.getAuthTag().toString('hex');

    // 5. Return a single string separated by colons: "IV:AuthTag:EncryptedData"
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts the formatted string back into the original IBAN.
 */
export function decryptIBAN(encryptedString) {
    if (typeof encryptedString !== 'string' || encryptedString.trim() === '') {
        return '';
    }

    try {
        const encryptionKey = getEncryptionKey();

        // 1. Split the single string back into its three parts
        const [ivHex, authTagHex, encryptedHex] = encryptedString.split(':');

        // If the value is not in encrypted "iv:authTag:data" format,
        // treat it as a plain legacy value instead of crashing.
        if (!ivHex || !authTagHex || !encryptedHex) {
            return encryptedString;
        }

        // 2. Convert the Hex strings back into Buffers
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        // 3. Create the decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);

        // 4. IMPORTANT: Set the Auth Tag to verify the data hasn't been tampered with
        decipher.setAuthTag(authTag);

        // 5. Decrypt the data (from Hexadecimal back to UTF-8 text)
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Failed to decrypt IBAN:', error);
        return encryptedString;
    }
}
