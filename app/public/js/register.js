document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const payload = Object.fromEntries(formData.entries());

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json().catch(() => ({}));

                if (res.ok) {
                    try { localStorage.setItem('user', JSON.stringify(data.user)); } catch (err) {}
                    window.location.href = '/profile';
                } else {
                    alert(data.error || 'Erreur lors de l\'inscription.');
                }
            } catch (err) {
                alert('Impossible de contacter le serveur.');
            }
        });
    }
});
