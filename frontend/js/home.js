const logoutButton = document.getElementById('logoutButton');

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
      });

      if (response.ok) {
        localStorage.removeItem("token"); // Briše token iz localStorage-a
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
    window.location.href = "/frontend/pages/profil.html"; // Preusmjeravanje na profil.html
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
      window.location.href = '/frontend/home.html'
    } else if (sectionName === 'Predmeti') {
      window.location.href = '/frontend/pages/predmeti.html'
    } else if (sectionName === 'Izostanci') {
      window.location.href = '/frontend/pages/izostanci.html'
    } else if (sectionName === 'Raspored') {
      window.location.href = '/frontend/pages/raspored.html'
    } else if (sectionName === 'Kalendar nastave') {
      window.location.href = '/frontend/pages/kalendar-nastave.html'
    }
  });
});

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Nema tokena! Korisnik nije prijavljen.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/current-user", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("Neispravan token ili nije prijavljen korisnik.");

    const user = await response.json();
    console.log("Trenutni korisnik:", user);

    // Postavi ime korisnika
    document.getElementById("user-name").textContent = `${user.firstName} ${user.lastName}`;

    const profilePicture = document.getElementById("profile-picture");

    // Ako postoji slika, koristi novu
    if (user.profileImage) {
      profilePicture.src = `http://localhost:5000/uploads/${user.profileImage}?t=${new Date().getTime()}`;
    } else {
      profilePicture.src = "/uploads/school.jpg"; // Ako nema slike, koristi default
    }


  } catch (error) {
    console.error("Greška pri dohvaćanju korisnika:", error.message);
  }
});

//  OTVARANJE MODALA ZA PROFILNU SLIKU
function openProfileEdit() {
  document.getElementById("profile-edit-modal").style.display = "flex";
}

//  ZATVARANJE MODALA
function closeProfileEdit() {
  document.getElementById("profile-edit-modal").style.display = "none";
}

//  PROMJENA PROFILNE SLIKE
async function uploadProfilePicture() {
  const fileInput = document.getElementById("profile-upload");
  const file = fileInput.files[0];

  if (!file) {
    alert("Odaberite sliku!");
    return;
  }

  const formData = new FormData();
  formData.append("profileImage", file);

  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:5000/update-profile", {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);

      //  Ažuriraj prikazanu profilnu sliku
      document.getElementById("profile-picture").src = `http://localhost:5000/uploads/${result.profileImage}?t=${new Date().getTime()}`;

      //  Zatvori modal
      closeProfileEdit();
    } else {
      throw new Error(result.message);
    }

  } catch (error) {
    console.error("Greška pri uploadu slike:", error.message);
    alert("Greška pri učitavanju slike.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Nema tokena! Korisnik nije prijavljen.");
    return;
  }

  try {
    //  Dohvati podatke o trenutnom korisniku
    const userResponse = await fetch("http://localhost:5000/current-user", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!userResponse.ok) throw new Error("Neispravan token ili nije prijavljen korisnik.");
    const user = await userResponse.json();

    //  Ako je korisnik nastavnik, prikaži sekciju za nasumični odabir
    if (user.role === "nastavnik") {
      document.getElementById("random-student-section").classList.remove("hidden");
    }

    //  Dodaj event listener za dugme
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
        console.error("Greška pri odabiru učenika:", error.message);
        document.getElementById("randomStudentDisplay").textContent = "Nije moguće dohvatiti učenika.";
      }
    });

  } catch (error) {
    console.error("Greška pri dohvaćanju korisnika:", error.message);
  }
});

//UKUPNI PROSJEK
document.addEventListener("DOMContentLoaded", async () => {
  const studentEmailInput = document.getElementById("studentEmail");
  const fetchGradesButton = document.getElementById("fetchGrades");
  const averageGradeElement = document.getElementById("averageGrade"); // Dodano

  const currentUser = await fetchCurrentUser();

  if (!currentUser) {
    console.error("Greška: Nema prijavljenog korisnika!");
    return;
  }

  // Ako je korisnik učenik, prikaži njegov grafikon i prosjek odmah
  if (currentUser.role === "student") {
    await fetchAndRenderChart(currentUser.username);
    await fetchAndUpdateAverageGrade(currentUser.username);
    studentEmailInput.style.display = "none"; // Sakrij input za unos e-maila
    fetchGradesButton.style.display = "none"; // Sakrij gumb za prikaz ocjena
  }

  // Ako je korisnik nastavnik, omogućuje unos e-maila i dohvaćanje ocjena
  if (currentUser.role === "nastavnik") {
    fetchGradesButton.addEventListener("click", async () => {
      const studentEmail = studentEmailInput.value.trim();
      if (!studentEmail) {
        alert("Unesite email učenika!");
        return;
      }
      await fetchAndRenderChart(studentEmail);
      await fetchAndUpdateAverageGrade(studentEmail);
    });
  }
});

/**
* Dohvati i prikaži prosjek ocjena učenika
*/
async function fetchAndUpdateAverageGrade(studentEmail) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Greška: Nema tokena! Korisnik nije prijavljen.");
      return;
    }
    const response = await fetch(`http://localhost:5000/grades/average/${studentEmail}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Greška ${response.status}: ${errorText}`);
    }
    const gradeData = await response.json();

    // Računa ukupni prosjek svih predmeta
    const grades = Object.values(gradeData).map(avg => avg === "Nema ocjena" ? 0 : parseFloat(avg));
    const overallAverage = grades.length > 0 ? (grades.reduce((sum, g) => sum + g, 0) / grades.length).toFixed(2) : "--";

    // Ažurira prikaz prosjeka
    document.getElementById("averageGrade").textContent = overallAverage;

  } catch (error) {
    console.error("Greška pri dohvaćanju prosjeka ocjena:", error.message);
  }
}

//IZOSTANCI CARD
document.addEventListener("DOMContentLoaded", async () => {
  const absenceCounter = document.getElementById("absence-count"); // Element za prikaz izostanaka
  const studentEmailInput = document.getElementById("studentEmail"); // Input za unos emaila
  const fetchAbsencesButton = document.getElementById("fetchGrades"); // Gumb za prikaz izostanaka
  const currentUser = await fetchCurrentUser(); // Dohvati prijavljenog korisnika

  if (!currentUser) {
    console.error("Greška: Nema prijavljenog korisnika!"); 
    return;
  }

  // Ako je korisnik učenik, odmah prikaži njegove izostanke
  if (currentUser.role === "student") {
    await fetchAndDisplayAbsences(currentUser.username);
    studentEmailInput.style.display = "none"; // Sakrij input za unos emaila
    fetchAbsencesButton.style.display = "none"; // Sakrij gumb jer učenik vidi samo svoje podatke
  }

  // Ako je korisnik nastavnik, omogući unos emaila učenika
  if (currentUser.role === "nastavnik") {
    fetchAbsencesButton.addEventListener("click", async () => {
      const username = studentEmailInput.value.trim();
      if (!username) {
        alert("Unesite email učenika!");
        return;
      }
      await fetchAndDisplayAbsences(username);
    });
  }
});

/**
*  Dohvati i prikaži ukupan broj sati izostanaka
*/
async function fetchAndDisplayAbsences(username) {
  try {
    const token = localStorage.getItem("token"); // Dohvati JWT token

    if (!token) {
      console.error("Greška: Nema tokena! Korisnik nije prijavljen.");
      return;
    }

    const response = await fetch(`http://localhost:5000/absences/total/${username}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Greška ${response.status}: ${errorText}`);
    }

    const { totalHours } = await response.json();
    console.log("Ukupni izostanci:", totalHours);

    document.getElementById("absence-count").innerText = totalHours; // Postavi ukupan broj sati
  } catch (error) {
    console.error("Greška pri dohvaćanju izostanaka:", error.message);
    alert("Neuspjelo dohvaćanje podataka za izostanke!");
  }
}
document.getElementById("fetchGrades").addEventListener("click", async () => {
  const studentEmail = document.getElementById("studentEmail").value.trim();
  if (!studentEmail) {
    alert("Unesite email učenika!");
    return;
  }

  await fetchAndDisplayAbsences(studentEmail);
});




//CHART OCJENA
document.addEventListener("DOMContentLoaded", async () => {

  const studentEmailInput = document.getElementById("studentEmail"); // Input za unos emaila
  const fetchGradesButton = document.getElementById("fetchGrades"); // Ispravan ID gumba

  const currentUser = await fetchCurrentUser(); // Dohvati prijavljenog korisnika

  if (!currentUser) {
    console.error("Greška: Nema prijavljenog korisnika!");
    return;
  }

  // Ako je korisnik učenik, odmah prikaži njegov chart
  if (currentUser.role === "student") {
    await fetchAndRenderChart(currentUser.username);
    studentEmailInput.style.display = "none"; // Sakrij input za unos emaila
    fetchGradesButton.style.display = "none"; // Sakrij gumb jer učenik vidi samo svoje ocjene
  }

  // Ako je korisnik nastavnik, omogući unos emaila učenika
  if (currentUser.role === "nastavnik") {
    fetchGradesButton.addEventListener("click", async () => {
      const studentEmail = studentEmailInput.value.trim();
      if (!studentEmail) {
        alert("Unesite email učenika!");
        return;
      }
      await fetchAndRenderChart(studentEmail);
    });
  }
});

/**
*  Dohvati i prikaži chart za određenog učenika
*/
async function fetchAndRenderChart(studentEmail) {
  try {
    const token = localStorage.getItem("token"); // Dohvati JWT token

    if (!token) {
      console.error("Greška: Nema tokena! Korisnik nije prijavljen.");
      return;
    }
    const response = await fetch(`http://localhost:5000/grades/average/${studentEmail}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Greška ${response.status}: ${errorText}`);
    }

    const gradeData = await response.json();
    console.log("Dohvaćeni podaci za chart:", gradeData);

    renderChart(gradeData);
  } catch (error) {
    console.error("Greška pri dohvaćanju ocjena:", error.message);
    alert("Neuspjelo dohvaćanje podataka za graf!");
  }
}

/**
*  Generira chart s prosječnim ocjenama učenika
*/
function renderChart(gradeData) {
  const chartCanvas = document.getElementById("gradesChart");
  if (!chartCanvas) {
    console.error("Element #gradesChart nije pronađen!");
    return;
  }
  const ctx = chartCanvas.getContext("2d");

  const subjects = Object.keys(gradeData);
  const averages = Object.values(gradeData).map(avg => avg === "Nema ocjena" ? 0 : parseFloat(avg));
  const colors = [
    "rgba(255, 99, 132, 0.6)",   // Crvena
    "rgba(54, 162, 235, 0.6)",   // Plava
    "rgba(255, 206, 86, 0.6)",   // Žuta
    "rgba(75, 192, 192, 0.6)",   // Tirkizna
    "rgba(153, 102, 255, 0.6)",  // Ljubičasta
    "rgba(255, 159, 64, 0.6)",   // Narančasta
    "rgba(46, 204, 113, 0.6)",   // Zelena
    "rgba(91, 28, 21, 0.6)",    // Tamnocrvena
    "rgba(52, 152, 219, 0.6)",   // Svijetloplava
    "rgba(241, 196, 15, 0.6)",   // Zlatna
    "rgba(155, 89, 182, 0.6)",   // Tamnoljubičasta
    "rgba(52, 73, 94, 0.6)",     // Tamnosiva
  ];
  if (window.gradesChart && typeof window.gradesChart.destroy === "function") {
    window.gradesChart.destroy(); // Uništi prethodni graf ako postoji
  }

  const backgroundColors = subjects.map((_, index) => colors[index % colors.length]);

  window.gradesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: subjects,
      datasets: [{
        label: "Prosječna ocjena",
        data: averages,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace("0.6", "1")),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 5
        }
      }
    }
  });
}

/**
*  Dohvaća prijavljenog korisnika iz tokena
*/
async function fetchCurrentUser() {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Nema tokena! Korisnik nije prijavljen.");
    return null;
  }

  try {
    const response = await fetch("http://localhost:5000/current-user", {
      method: "GET",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!response.ok) throw new Error("Neispravan token ili nije prijavljen korisnik.");
    return await response.json();
  } catch (error) {
    console.error("Greška pri dohvaćanju korisnika:", error.message);
    return null;
  }
}




