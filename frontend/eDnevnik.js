// Provjeri je li korisnik logiran
fetch('http://localhost:5000/isLoggedIn')
  .then((response) => {
    if (!response.ok) {
      // Ako nije logiran, vrati ga na login stranicu
      window.location.href = 'index.html';
    }
  })
  .catch(() => {
    window.location.href = 'index.html'; // Ako je greška, vrati ga na login
  });

  const logoutButton = document.getElementById('logoutButton');

  // Dodaj event listener za klik na gumb
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      // Šaljemo zahtjev na server za logout
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
      });
  
      if (response.ok) {
        alert('Odjavili ste se!');
        window.location.href = 'index.html'; // Vrati korisnika na login
      } else {
        alert('Došlo je do greške pri odjavi!');
      }
    });
  } else {
    console.error('Logout button not found in the DOM.');
  }


// Funkcije za svaku opciju
const sidebarLinks = document.querySelectorAll('.menu ul li a');

sidebarLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault(); // Sprečava default ponašanje (ako koristiš "#" kao href)
    const sectionName = link.textContent.trim();

     // Upravljanje prema imenu sekcije
     if (sectionName === 'Home') {
        window.location.href='./pages/home.html'
      } else if (sectionName === 'Predmeti') {
        window.location.href='./pages/predmeti.html'
      } else if (sectionName === 'Ocjene') {
        window.location.href='./pages/ocjene.html'
      } else if (sectionName === 'Izostanci') {
        window.location.href='./pages/izostanci.html'
      } else if (sectionName === 'Kalendar nastave') {
        window.location.href='./pages/kalendar-nastave.html'
      }

    /*if (buttonText === 'Pregled predmeta') {
        window.location.href = './pages/predmeti.html';
    } else if (buttonText === 'Pregled izostanaka') {
        window.location.href = './pages/izostanci.html';
    } else if (buttonText === 'Pregled rasporeda') {
        window.location.href = './pages/raspored.html';
    } else if (buttonText === 'Pregled ocjena') {
        window.location.href = './pages/ocjene.html';
    } else if (buttonText === 'Pregled vrste izostanka') {
        window.location.href = './pages/vrtse-izostanaka.html';
    } else if (buttonText === 'Pregled bilješke') {
        window.location.href = './pages/biljeske.html';
    } else if (buttonText === 'Upozorenje na broj izostanaka') {
        window.location.href = './pages/upozorenje_izostanci.html';
    } else if (buttonText === 'Prikaz izostanka po vremenskom periodu') {
        window.location.href = './pages/prikaz-izostanaka.html';
    } else if (buttonText === 'Upozorenje na preklapanje') {
        window.location.href = './pages/upozorenje-preklapanje.html';
    } else if (buttonText === 'Pretraga predmeta') {
        window.location.href = './pages/pretraga-predmeta.html';
    } else if (buttonText === 'Graf izostanaka') {
        window.location.href = './pages/graf-izostanaka.html';
    } else if (buttonText === 'Kalendar nastave') {
        window.location.href = './pages/kalendar-nastave.html';
    }*/
  });
});

