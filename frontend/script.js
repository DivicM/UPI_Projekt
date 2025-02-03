const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const registerLink = document.getElementById('registerLink');
const registerFormElement = document.getElementById('registerFormElement');
const successMessage = document.getElementById('successMessage');
const formTitle = document.getElementById('formTitle');
const toggleText = document.getElementById('toggleText');



const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
const forgotPasswordRequestForm = document.getElementById('forgotPasswordRequestForm');
const resetPasswordForm = document.getElementById('resetPasswordForm');
const resetPasswordFormElement = document.getElementById('resetPasswordFormElement');
const resetMessage = document.getElementById('resetMessage');
const resetSuccessMessage = document.getElementById('resetSuccessMessage');

// Prikazivanje forme za resetiranje lozinke
forgotPasswordLink.addEventListener('click', () => {
  loginForm.style.display = 'none';
  forgotPasswordForm.style.display = 'block';
});

// Slanje zahtjeva za resetiranje lozinke
forgotPasswordRequestForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('resetEmail').value;

  const response = await fetch('http://localhost:5000/request-reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (response.ok) {
    resetMessage.style.display = 'block';
    resetMessage.innerText = 'Reset link sent to your email.';
  } else {
    resetMessage.style.display = 'block';
    resetMessage.innerText = 'Failed to send reset link. Please try again.';
  }
});

// Resetiranje lozinke pomoću tokena
resetPasswordFormElement.addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword !== confirmPassword) {
    resetSuccessMessage.style.display = 'block';
    resetSuccessMessage.innerText = 'Passwords do not match!';
    return;
  }

  const token = new URLSearchParams(window.location.search).get('token'); // Preuzimanje tokena iz URL-a
  const response = await fetch('http://localhost:5000/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  if (response.ok) {
    resetSuccessMessage.style.display = 'block';
    resetSuccessMessage.innerText = 'Password reset successful! You can now log in.';
  } else {
    resetSuccessMessage.style.display = 'block';
    resetSuccessMessage.innerText = 'Failed to reset password. Token may be invalid or expired.';
  }
});


// Prebacivanje na registracijsku formu
registerLink.addEventListener('click', () => {
  loginForm.style.display = 'none';
  registerForm.style.display = 'block';
  formTitle.innerText = 'Register';
  toggleText.style.display = 'none';
});

// Login forma
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  //const role = document.getElementById('role').value;

  const response = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const data = await response.json();
    console.log("📌 Novi token:", data.token); //  Debugging
    localStorage.setItem("token", data.token); //  Sprema token u localStorage
    localStorage.setItem("role", data.role); //  Spremi ulogu korisnika

    alert('Login successful!');
    window.location.href = 'home.html'; // Preusmjeravanje na novu stranicu
  } else {
    alert('Netočna prijava!');
  }
});


document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault(); // Sprječava zadano ponašanje obrasca (sprečava ponovno učitavanje stranice)

  const firstName = document.getElementById("registerFirstName").value;
  const lastName = document.getElementById("registerLastName").value;
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;
  const role = document.getElementById("role").value; // Uzima rolu iz selekta

  const response = await fetch("http://localhost:5000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, lastName, username, password, role }) //  Role se šalje na backend
  });

  const data = await response.json();
  console.log("📌 Odgovor servera:", data);

  if (response.ok) {
    alert("Registracija uspješna!");
    window.location.href = "index.html";
  } else {
    alert(`❌ Greška: ${data.message}`);
  }
});

document.addEventListener('DOMContentLoaded', () => {

  const passwordInput = document.getElementById('registerPassword');
  const passwordStrength = document.getElementById('registerPasswordStrength');
  const passwordMessage = document.getElementById('registerPasswordMessage');

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
async function fetchCurrentUser() {
  const token = localStorage.getItem("token"); //  Dohvati token iz localStorage-a
  if (!token) return { email: "" }; // Ako nema tokena, korisnik nije prijavljen

  const response = await fetch("http://localhost:5000/current-user", {
    headers: { "Authorization": `Bearer ${token}` }, // Šaljemo token u zaglavlju
  });

  return response.ok ? await response.json() : { email: "" };
}
