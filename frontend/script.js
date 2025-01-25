const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const registerLink = document.getElementById('registerLink');
const registerFormElement = document.getElementById('registerFormElement');
const successMessage = document.getElementById('successMessage');
const formTitle = document.getElementById('formTitle');
const toggleText = document.getElementById('toggleText');

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

  const response = await fetch('http://localhost:5000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    alert('Login successful!');
    window.location.href = 'home.html'; // Preusmjeravanje na novu stranicu
  } else {
    alert('Invalid credentials!');
  }
});

// Register forma
registerFormElement.addEventListener('submit', async (e) => {
  e.preventDefault();
  const firstName = document.getElementById('registerFirstName').value;
  const lastName = document.getElementById('registerLastName').value;
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;

  const response = await fetch('http://localhost:5000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, username, password }),
  });

  if (response.ok) {
    registerForm.style.display = 'none';
    successMessage.style.display = 'block';
  } else {
    alert('Registration failed!');
  }
});
