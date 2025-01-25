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
        window.location.href='./home.html'
      } else if (sectionName === 'Predmeti') {
        window.location.href='./pages/predmeti.html'
      } else if (sectionName === 'Izostnci') {
        window.location.href='./pages/izostanci.html'
      } else if (sectionName === 'Raspored') {
        window.location.href='./pages/raspored.html'
      } else if (sectionName === 'Kalendar nastave') {
        window.location.href='./pages/kalendar-nastave.html'
      }
    });
  });

