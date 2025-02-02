
//Upravljanje formom za uređivanje profila
const editProfileForm = document.getElementById('editProfileForm');

if (editProfileForm) {
  editProfileForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Sprečavanje default ponašanja (refresh stranice)

    // Dohvaćanje unesenih podataka iz forme
    const fullName = document.getElementById('fullName').value;
    const username = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Provjera je li sve popunjeno
    if (!fullName || !username || !password) {
      alert('Sva polja su obavezna!');
      return;
    }

    // Slanje podataka na server za spremanje promjena
    const response = await fetch('http://localhost:5000/updateProfile', {
      method: 'POST',
      headers: {
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

function openProfileEdit() {
  document.getElementById("profile-edit-modal").style.display = "block";
}

function closeProfileEdit() {
  document.getElementById("profile-edit-modal").style.display = "none";
}

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

      // ✅ Ažuriraj prikazanu profilnu sliku
      document.getElementById("profile-picture").src = `http://localhost:5000/uploads/${result.profileImage}`;

      // ✅ Zatvori modal
      closeProfileEdit();
    } else {
      throw new Error(result.message);
    }

  } catch (error) {
    console.error("❌ Greška pri uploadu slike:", error.message);
    alert("Greška pri učitavanju slike.");
  }
}

// 📌 EVENT LISTENER ZA OTVARANJE MODALA
document.addEventListener("DOMContentLoaded", () => {
  const editProfileButton = document.getElementById("edit-profile-button");

  if (editProfileButton) {
    editProfileButton.addEventListener("click", openProfileEdit);
  }
});

