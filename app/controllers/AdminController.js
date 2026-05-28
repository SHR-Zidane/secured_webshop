const db = require('../config/db');
const { decrypt } = require('../utils/crypto');

module.exports = {

    // ----------------------------------------------------------
    // GET /api/admin/users
    // ----------------------------------------------------------
    getUsers: (_req, res) => {
        db.query('SELECT id, username, email, role, address FROM users', (err, results) => {
            if (err) {
                return res.status(500).json({ error: 'Erreur serveur' });
            }
            const users = results.map(u => {
                u.address = decrypt(u.address);
                u.email = decrypt(u.email);
                return u;
            });
            res.json(users);
        });
    }
};
