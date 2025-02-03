
//Upravljanje formom za uređivanje profila
const editProfileForm = document.getElementById('editProfileForm');

if (editProfileForm) {
  editProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Sprečavanje default ponašanja (refresh stranice)

    // Dohvaćanje unesenih podataka iz forme
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const token = localStorage.getItem("token");
    // Provjera je li sve popunjeno
    if (!fullName || !username || !password) {
        alert('Sva polja su obavezna!');
        return;
    }

    // Slanje podataka na server za spremanje promjena
    const response = await fetch('http://localhost:5000/updateProfile', {
        method: 'POST',
        headers: {
          "Authorization": `Bearer ${token}`,
            "Content-Type": 'application/json',
        },
        body: JSON.stringify({ fullName, username, password }),
    });

    if (response.ok) {
      alert('Podaci su uspješno ažurirani!');
      window.location.href = "/frontend/home.html"; // Vrati korisnika na početnu stranicu
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
        window.location.href = "/frontend/index.html"; // Preusmjeri na login stranicu
      } else {
        alert('Došlo je do greške pri odjavi.');
      }
    } catch (error) {
      console.error('Greška pri odjavi:', error);
      alert('Došlo je do greške pri odjavi.');
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
      console.error("❌ Nema tokena! Korisnik nije prijavljen.");
      return;
  }

  try {
      const response = await fetch("http://localhost:5000/current-user", {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Neispravan token ili nije prijavljen korisnik.");
      
      const user = await response.json();

      // Postavi ime korisnika
      document.getElementById("user-name").textContent = `${user.firstName} ${user.lastName}`;

      // Postavi profilnu sliku
      if (user.profileImage) {
        document.getElementById("profile-picture").src = `http://localhost:5000/uploads/${user.profileImage}`;
    }
  } catch (error) {
      console.error("❌ Greška pri dohvaćanju korisnika:", error.message);
  }
});