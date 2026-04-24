document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorMsg = document.getElementById('errorMsg');
            errorMsg.textContent = '';

            const formData = new FormData(registerForm);
            const username = formData.get('username');
            const email = formData.get('email');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');

            if (!username || !email || !password || !confirmPassword) {
                errorMsg.textContent = 'Tous les champs sont requis';
                return;
            }

            if (password.length < 8) {
                errorMsg.textContent = 'Le mot de passe doit faire au moins 8 caractères';
                return;
            }

            if (password !== confirmPassword) {
                errorMsg.textContent = 'Les mots de passe ne correspondent pas';
                return;
            }

            const payload = { username, email, password };

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await res.json().catch(() => ({}));

                if (res.ok) {
                    alert('Inscription réussie ! Veuillez vous connecter.');
                    window.location.href = '/login';
                } else {
                    errorMsg.textContent = data.error || 'Erreur lors de l\'inscription.';
                }
            } catch (err) {
                errorMsg.textContent = 'Impossible de contacter le serveur.';
            }
        });
    }
});