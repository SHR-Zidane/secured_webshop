const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getKey() {
    const secret = process.env.ENCRYPTION_KEY;
    if (!secret) {
        throw new Error('ENCRYPTION_KEY manquante dans .env');
    }
    return crypto.createHash('sha256').update(secret).digest();
}

function encrypt(text) {
    if (text == null || text === '') return text;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return 'rnd:' + iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    if (text == null || text === '') return text;
    if (!text.includes(':')) return text;

    const firstColon = text.indexOf(':');
    const prefix = text.substring(0, firstColon);
    const rest = text.substring(firstColon + 1);

    if (prefix === 'rnd') {
        const parts = rest.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encrypted = parts.join(':');
        const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    if (prefix === 'det') {
        const encrypted = rest;
        const iv = Buffer.alloc(16, 0);
        const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    if (/^[0-9a-f]{32}$/i.test(prefix)) {
        const iv = Buffer.from(prefix, 'hex');
        const encrypted = rest;
        const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    return text;
}

function deterministicEncrypt(text) {
    if (text == null || text === '') return text;
    const iv = Buffer.alloc(16, 0);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return 'det:' + encrypted;
}

module.exports = { encrypt, decrypt, deterministicEncrypt };
