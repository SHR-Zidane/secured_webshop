/**
 * Utilitaire pour gérer les appels API avec token JWT
 */

// Récupérer le token JWT du localStorage
function getToken() {
    try {
        return localStorage.getItem('token');
    } catch (err) {
        console.error('Erreur lors de la récupération du token:', err);
        return null;
    }
}

// Vérifier si l'utilisateur est connecté
function isLoggedIn() {
    return getToken() !== null;
}

// Récupérer les données utilisateur du localStorage
function getUser() {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        return null;
    }
}

// Déconnexion : supprimer le token et les données utilisateur
function logout() {
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    } catch (err) {
        console.error('Erreur lors de la déconnexion:', err);
    }
    window.location.href = '/login';
}

// Faire un appel API avec le token JWT dans le header
async function apiCall(url, options = {}) {
    const token = getToken();
    
    // Si pas de token et la route nécessite une authentification, rediriger vers login
    if (!token && (url.includes('/api/profile') || url.includes('/api/admin'))) {
        console.warn('Token manquant, redirection vers login');
        window.location.href = '/login';
        return null;
    }

    const headers = options.headers || {};
    
    // Ajouter le token JWT au header Authorization
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // Ajouter Content-Type par défaut si pas spécifié et corps présent
    if (!headers['Content-Type'] && options.body && typeof options.body === 'string') {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        // Si le token a expiré ou est invalide (401), déconnecter l'utilisateur
        if (response.status === 401) {
            console.warn('Token expiré ou invalide, déconnexion');
            logout();
            return null;
        }

        return response;
    } catch (err) {
        console.error('Erreur lors de l\'appel API:', err);
        throw err;
    }
}

function escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Export des fonctions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { getToken, isLoggedIn, getUser, logout, apiCall, escapeHtml };
}
