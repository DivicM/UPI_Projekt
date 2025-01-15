function prijava(email, password) {
    console.log('Pozvana funkcija prijava.');
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;
    

    
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:5500/studenti', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    // Pošalji podatke na server
    xhr.send(JSON.stringify({ korisnicko_ime: email, lozinka: password }));

    // Čekaj odgovor od servera
    xhr.onreadystatechange = function () {
        console.log('Promjena stanja:', xhr.readyState, xhr.status);

        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                var response = JSON.parse(xhr.responseText);
                console.log(response);

                if (response.success) {
                    // Uspješna prijava, pohrani e-mail u lokalnu pohranu
                    console.log('Uspješna prijava:', response.student);
                    window.localStorage.setItem('email', email);

                   

                    // Preusmjerite korisnika na drugu stranicu ili izvršite druge radnje
                    window.location.href = 'ocjene.html';
                   
                } else {
                    // Pogrešno korisničko ime ili lozinka
                    console.error('Pogrešno korisničko ime ili lozinka:', response.message);
                    document.getElementById('email').value="";
                    document.getElementById('password').value="";
                    // Prikazati upozorenje korisniku
                    alert('Pogrešno korisničko ime ili lozinka.');
                }
            } else {
                console.log('Greška u komunikaciji sa serverom. Status:', xhr.status);
                // Prikazati upozorenje korisniku
                alert('Greška u komunikaciji sa serverom.');
            }
        }
    };
}