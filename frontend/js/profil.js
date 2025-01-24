//Upravljanje formom za uređivanje profila
const editProfileForm = document.getElementById('editProfileForm');

if (editProfileForm) {
  editProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Sprečavanje default ponašanja (refresh stranice)

    // Dohvaćanje unesenih podataka iz forme
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

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
      alert('Došlo je do greške pri ažuriranju podataka.');
    }
  });
}
