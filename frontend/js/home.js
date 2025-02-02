// Učitavanje grafikona ocjena
const ctx = document.getElementById('gradesChart').getContext('2d');
const gradesChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Matematika', 'Hrvatski', 'Engleski', 'Informatika', 'Biologija', 'Kemija', 'Fizika', 'Povijest', 'Geografija', 'Vjeronauk', 'TZK', 'Likovna kultura', 'Glazbena kultura'],
    datasets: [{
      label: 'Ocjene',
      data: [5, 4, 5, 5, 4, 3, 3, 4, 4, 5, 5, 5, 5],
      backgroundColor: [
        '#4CAF50', '#FFC107', '#F44336', '#03A9F4', '#9C27B0', '#673AB7', '#C2185B', '#3949AB', '#CE93D8'
      ],
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

const logoutButton = document.getElementById('logoutButton');

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
      });

      if (response.ok) {
        localStorage.removeItem("token"); // 📌 Briše token iz localStorage-a
        alert('Odjavili ste se!');
        window.location.href = 'index.html'; // Preusmjeri na login stranicu
      } else {
        alert('Došlo je do greške pri odjavi.');
      }
    } catch (error) {
      console.error('Greška pri odjavi:', error);
      alert('Došlo je do greške pri odjavi.');
    }
  });
}


// Povezivanje gumba za "View Profile"
const profile = document.getElementById('profile');

if (profile) {
  profile.addEventListener('click', () => {
    window.location.href = '/frontend/pages/profil.html'; // Preusmjeravanje na profil.html
  });
}
// Funkcije za svaku opciju
const sidebarLinks = document.querySelectorAll('.menu ul li a');

sidebarLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault(); // Sprečava default ponašanje (ako koristiš "#" kao href)
    const sectionName = link.textContent.trim();

     // Upravljanje prema imenu sekcije
     if (sectionName === 'Home') {
        window.location.href='/frontend/home.html'
      } else if (sectionName === 'Predmeti') {
        window.location.href='/frontend/pages/predmeti.html'
      } else if (sectionName === 'Izostanci') {
        window.location.href='/frontend/pages/izostanci.html'
      } else if (sectionName === 'Raspored') {
        window.location.href='/frontend/pages/raspored.html'
      } else if (sectionName === 'Kalendar nastave') {
        window.location.href='/frontend/pages/kalendar-nastave.html'
      }
    });
  });

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
        document.getElementById("profile-picture").src = `http://localhost:5000/uploads/${user.profileImage}`;

    } catch (error) {
        console.error("❌ Greška pri dohvaćanju korisnika:", error.message);
    }
});
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
      console.error("❌ Nema tokena! Korisnik nije prijavljen.");
      return;
  }

  try {
      // 🛠 Dohvati podatke o trenutnom korisniku
      const userResponse = await fetch("http://localhost:5000/current-user", {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
      });

      if (!userResponse.ok) throw new Error("Neispravan token ili nije prijavljen korisnik.");
      const user = await userResponse.json();

      // ✅ Ako je korisnik nastavnik, prikaži sekciju za nasumični odabir
      if (user.role === "nastavnik") {
          document.getElementById("random-student-section").classList.remove("hidden");
      }

      // 🛠 Dodaj event listener za dugme
      document.getElementById("randomStudentButton").addEventListener("click", async () => {
 
        try {
              const response = await fetch("http://localhost:5000/random-student", {
                  method: "GET",
                  headers: { "Authorization": `Bearer ${token}` }
              });

              if (!response.ok) throw new Error("Greška pri dohvaćanju učenika.");

              const student = await response.json();
              document.getElementById("randomStudentDisplay").textContent = `🎉 Odabran učenik: ${student.firstName} ${student.lastName}`;

          } catch (error) {
              console.error("❌ Greška pri odabiru učenika:", error.message);
              document.getElementById("randomStudentDisplay").textContent = "⚠️ Nije moguće dohvatiti učenika.";
          }
      });

  } catch (error) {
      console.error("❌ Greška pri dohvaćanju korisnika:", error.message);
  }
});


