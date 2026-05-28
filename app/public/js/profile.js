document.addEventListener("DOMContentLoaded", async () => {
    if (!isLoggedIn()) {
        alert("Vous devez être connecté pour accéder à cette page");
        window.location.href = "/login";
        return;
    }

    await loadProfile();

    document
        .getElementById("address-form")
        .addEventListener("submit", updateAddress);
    document
        .getElementById("photo-form")
        .addEventListener("submit", uploadPhoto);
});

async function loadProfile() {
    try {
        const response = await apiCall("/api/profile", {
            method: "GET",
        });

        if (!response || !response.ok) {
            showMessage(
                "Erreur lors du chargement du profil",
                "error",
            );
            return;
        }

        const profile = await response.json();

        document.getElementById("username").textContent =
            profile.username;
        document.getElementById("email").textContent =
            profile.email;
        document.getElementById("role").textContent = profile.role;
        document.getElementById("address").value =
            profile.address || "";

        if (profile.photo_path) {
            const photoContainer =
                document.getElementById("photo-container");
            photoContainer.innerHTML = `<img src="${profile.photo_path}" alt="Photo de profil" style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover;">`;
        }
    } catch (err) {
        console.error("Erreur:", err);
        showMessage("Impossible de charger le profil", "error");
    }
}

async function updateAddress(e) {
    e.preventDefault();

    const address = document.getElementById("address").value;

    if (!address) {
        showMessage("Veuillez entrer une adresse", "error");
        return;
    }

    try {
        const response = await apiCall("/api/profile", {
            method: "POST",
            body: JSON.stringify({ address }),
        });

        if (!response || !response.ok) {
            showMessage("Erreur lors de la mise à jour", "error");
            return;
        }

        showMessage("Adresse mise à jour avec succès", "success");
    } catch (err) {
        console.error("Erreur:", err);
        showMessage("Erreur lors de la mise à jour", "error");
    }
}

async function uploadPhoto(e) {
    e.preventDefault();

    const photoInput = document.getElementById("photo");
    if (!photoInput.files || photoInput.files.length === 0) {
        showMessage("Veuillez sélectionner une photo", "error");
        return;
    }

    const formData = new FormData();
    formData.append("photo", photoInput.files[0]);

    try {
        const token = getToken();
        const headers = token
            ? { Authorization: `Bearer ${token}` }
            : {};

        const response = await fetch("/api/profile/photo", {
            method: "POST",
            headers,
            body: formData,
        });

        if (!response.ok) {
            showMessage("Erreur lors de l'upload", "error");
            return;
        }

        const data = await response.json();
        showMessage("Photo mise à jour avec succès", "success");

        await loadProfile();
        photoInput.value = "";
    } catch (err) {
        console.error("Erreur:", err);
        showMessage("Erreur lors de l'upload", "error");
    }
}

function showMessage(message, type) {
    const msgEl = document.getElementById("status-message");
    msgEl.textContent = message;
    msgEl.className = "message " + type;
    setTimeout(() => {
        msgEl.textContent = "";
        msgEl.className = "message";
    }, 4000);
}
