const db = require('../config/db');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const PEPPER = process.env.PEPPER || 'default_pePPER_unsafe';
const JWT_SECRET = process.env.JWT_SECRET || 'scrt-key';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';
//-----------------------------------------------------------------------------------------------

async function hashPassword(password) {
    const pepperedPwd = crypto.createHmac('sha512', PEPPER).update(password).digest('hex');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pepperedPwd, salt);
    return `${salt}:${hash}`;
}
//-----------------------------------------------------------------------------------------------

function verifyPassword(password, stored) {
    try {
        const [salt, hash] = stored.split(':');
        const pepperedPwd = crypto.createHmac('sha512', PEPPER).update(password).digest('hex');
        return bcrypt.compareSync(pepperedPwd, hash);
    } catch {
        return false;
    }
}

//-----------------------------------------------------------------------------------------------
function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
    );
}

module.exports = {

    login: (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email et mot de passe requis' });
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
            }

            const user = results[0];
            if (!verifyPassword(password, user.password)) {
                return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
            }

            // Générer le token JWT
            const token = generateToken(user);

            res.json({
                message: 'Connexion réussie',
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        });
    },

    register: async (req, res) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Tous les champs sont requis' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Le mot de passe doit faire au moins 8 caractères' });
        }

        try {
            const hashedPassword = await hashPassword(password);
            db.query(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, 'user'],
                (err, results) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(409).json({ error: 'Email déjà utilisé' });
                        }
                        return res.status(500).json({ error: err.message });
                    }

                    // Créer un utilisateur temporaire pour générer le token
                    const newUser = {
                        id: results.insertId,
                        username: username,
                        email: email,
                        role: 'user'
                    };

                    const token = generateToken(newUser);

                    res.status(201).json({
                        message: 'Inscription réussie',
                        userId: results.insertId,
                        token: token,
                        user: newUser
                    });
                }
            );
        } catch (err) {
            res.status(500).json({ error: 'Erreur lors du hashage' });
        }
    }
};