
module.exports = (req, res, next) => {

    
    if (!req.user) {
        return res.status(401).json({ error: 'Authentification requise' });
    }
    
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Accès refusé - Rôle admin requis' });
    }
    
    next();
};
