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
                    try { localStorage.setItem('user', JSON.stringify(data.user)); } catch (err) {}
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
