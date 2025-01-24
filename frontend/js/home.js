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
        '#4CAF50', '#FFC107', '#F44336', '#03A9F4', '#9C27B0'
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

// Logout funkcionalnost
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    const response = await fetch('http://localhost:5000/logout', {
      method: 'POST',
    });

    if (response.ok) {
      alert('Odjavili ste se!');
      window.location.href = 'index.html';
    } else {
      alert('Došlo je do greške pri odjavi!');
    }
  });
} else {
  console.error('Logout button not found in the DOM.');
}

// Povezivanje gumba za "View Profile"
const profile = document.getElementById('profile');

if (profile) {
  profile.addEventListener('click', () => {
    window.location.href = 'profil.html'; // Preusmjeravanje na profil.html
  });
}