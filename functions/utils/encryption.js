const crypto = require('crypto');

// Encryption key - this should be stored in Firebase environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secure-encryption-key-here';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

// Create a 32-byte key from the input string
function generateKey(key) {
    return crypto.scryptSync(key, 'salt', 32);
}

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = generateKey(ENCRYPTION_KEY);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted,
        authTag: authTag.toString('hex')
    };
}

function decrypt(encryptedData) {
    const key = generateKey(ENCRYPTION_KEY);
    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        key,
        Buffer.from(encryptedData.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

module.exports = {
    encrypt,
    decrypt
}; 