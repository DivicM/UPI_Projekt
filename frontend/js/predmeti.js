const subjectsList = document.getElementById('subjects');
const searchInput = document.getElementById('searchInput');

async function loadSubjects() {
  try {
    const response = await fetch('http://localhost:5000/subjects');
    const subjects = await response.json();

    renderSubjects(subjects); // Prikaz svih predmeta

    // Dodavanje funkcionalnosti pretrage
    searchInput.addEventListener('input', () => {
      const searchQuery = searchInput.value.toLowerCase();
      const filteredSubjects = subjects.filter((subject) =>
        subject.name.toLowerCase().includes(searchQuery)
      );
      renderSubjects(filteredSubjects);
    });
  } catch (error) {
    console.error('Greška pri dohvaćanju predmeta:', error);
  }
}

function renderSubjects(subjects) {
  subjectsList.innerHTML = ''; // Očisti trenutnu listu
  subjects.forEach((subject) => {
    const card = document.createElement('div');
    card.classList.add('card');

    card.innerHTML = `
      <a href="${subject.name.toLowerCase().replace(/\s+/g, '-')}.html">
      <div class="icon">${subject.icon}</div>
      <h3>${subject.name}</h3>
      <p>Profesor: ${subject.teacher}</p>
    `;

    subjectsList.appendChild(card);
  });
}

loadSubjects();


// Logout funkcionalnost
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    const response = await fetch('http://localhost:5000/logout', { method: 'POST' });
    if (response.ok) {
      alert('Odjavili ste se!');
      window.location.href = '/frontend/index.html';
    } else {
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