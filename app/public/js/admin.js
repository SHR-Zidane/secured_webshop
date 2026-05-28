document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!isLoggedIn()) {
            alert('Vous devez être connecté pour accéder à cette page');
            window.location.href = '/login';
            return;
        }

        const user = getUser();
        if (!user || user.role !== 'admin') {
            alert('Accès refusé - Vous devez être administrateur');
            window.location.href = '/';
            return;
        }

        const response = await apiCall('/api/admin/users', {
            method: 'GET'
        });

        if (!response || !response.ok) {
            document.getElementById('user-table-body').innerHTML =
                '<tr><td colspan="5">Erreur lors du chargement (accès refusé ou token invalide)</td></tr>';
            return;
        }

        const users = await response.json();
        const tbody = document.getElementById('user-table-body');
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.id}</td>
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td><span class="badge-${u.role}">${u.role}</span></td>
                <td>${u.address || '-'}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Erreur:', err);
        document.getElementById('user-table-body').innerHTML =
            '<tr><td colspan="5">Erreur lors du chargement</td></tr>';
    }
});
