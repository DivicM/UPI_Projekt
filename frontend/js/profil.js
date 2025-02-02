
//Upravljanje formom za uređivanje profila
const editProfileForm = document.getElementById('editProfileForm');

if (editProfileForm) {
  editProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Sprečavanje default ponašanja (refresh stranice)

    // Dohvaćanje unesenih podataka iz forme
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Provjera je li sve popunjeno
    if (!fullName || !email || !password) {
      alert('Sva polja su obavezna!');
      return;
    }

    // Slanje podataka na server za spremanje promjena
    const response = await fetch('http://localhost:5000/updateProfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fullName, email, password }),
    });

    if (response.ok) {
      alert('Podaci su uspješno ažurirani!');
      window.location.href = 'home.html'; // Vrati korisnika na početnu stranicu
    } else {
      const errorData = await response.json();
      alert(errorData.message || 'Došlo je do greške pri ažuriranju podataka.');
    }
  });
}
const logoutButton = document.getElementById('logoutButton');

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
      });

      if (response.ok) {
        alert('Odjavili ste se!');
        window.location.href = '/frontend/index.html'; // Preusmjeri na login stranicu
      } else {
        alert('Došlo je do greške pri odjavi.');
      }
    } catch (error) {
      console.error('Greška pri odjavi:', error);
      alert('Došlo je do greške pri odjavi.');
    }
  });
}

