// Dohvati token iz URL-a
const token = new URLSearchParams(window.location.search).get('token');

// Provjeri je li token prisutan u URL-u
if (!token) {
    alert('Invalid or missing token!');
    window.location.href = '/'; // Preusmjeri korisnika na početnu stranicu
} else {
    // Pronađi hidden polje u formi i postavi vrijednost tokena
    const tokenInput = document.getElementById('token');
    if (tokenInput) {
        tokenInput.value = token;
        console.log('Token set in hidden input:', token); // Debugging log
    } else {
        console.error('Hidden input field not found!');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('newPassword');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordMessage = document.getElementById('passwordMessage');

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        let strength = 0;

        if (password.length >= 8) strength++; // 8+ znakova
        if (/[A-Z]/.test(password)) strength++; // Veliko slovo
        if (/[0-9]/.test(password)) strength++; // Broj
        if (/[\W]/.test(password)) strength++; // Specijalni znak (!@#$%^&*)

        passwordStrength.value = strength;

        // Poruka za korisnika
        const messages = ["Too weak ❌", "Weak ⚠️", "Good ✅", "Strong 💪"];
        passwordMessage.textContent = messages[strength];

        // Boja progress bara
        const colors = ["red", "orange", "yellow", "green"];
        passwordStrength.style.backgroundColor = colors[strength];
    });
});
