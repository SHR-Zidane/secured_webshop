const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

module.exports = (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token manquant ou invalide' });
        }

        const token = authHeader.substring(7); 
        

        const decoded = jwt.verify(token, JWT_SECRET);
        

        req.user = decoded;
        
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expiré' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token invalide' });
        }
        return res.status(401).json({ error: 'Authentification échouée' });
    }
};
