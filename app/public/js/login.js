document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const payload = Object.fromEntries(formData.entries());

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json().catch(() => ({}));

                if (res.ok) {
                    // Stocker le token JWT et les données utilisateur
                    try {
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                    } catch (err) {
                        console.error('Erreur lors du stockage du token:', err);
                    }
                    window.location.href = '/profile';
                } else {
                    alert(data.error || 'Erreur lors de la connexion.');
                }
            } catch (err) {
                alert('Impossible de contacter le serveur.');
            }
        });
    }
});
