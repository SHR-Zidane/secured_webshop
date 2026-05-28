require('dotenv').config({ path: '../.env' });
const db = require('../config/db');
const { encrypt, deterministicEncrypt } = require('../utils/crypto');

function isPlaintext(val) {
    return val && !val.includes(':');
}

db.query('SELECT id, email, address FROM users', (err, results) => {
    if (err) {
        console.error('Erreur:', err);
        process.exit(1);
    }

    if (results.length === 0) {
        console.log('Aucun utilisateur à migrer.');
        process.exit(0);
    }

    let total = results.length;
    let done = 0;

    results.forEach(user => {
        const updates = [];
        const params = [];

        if (isPlaintext(user.email)) {
            updates.push('email = ?');
            params.push(deterministicEncrypt(user.email));
            console.log(`  Email ${user.email} → chiffré`);
        }

        if (isPlaintext(user.address)) {
            updates.push('address = ?');
            params.push(encrypt(user.address));
            console.log(`  Adresse de ${user.email || user.id} → chiffrée`);
        }

        if (updates.length === 0) {
            done++;
            if (done === total) process.exit(0);
            return;
        }

        params.push(user.id);
        db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params, (err) => {
            if (err) console.error(`Erreur utilisateur ${user.id}:`, err);
            done++;
            if (done === total) {
                console.log('Migration terminée.');
                process.exit(0);
            }
        });
    });
});
