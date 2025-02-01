document.addEventListener("DOMContentLoaded", async () => {
    const absenceTable = document.getElementById("absence-table");
    const editAbsencesButton = document.getElementById("editAbsencesButton");
    const addAbsenceButton = document.getElementById("addAbsenceButton");
    const saveAbsencesButton = document.getElementById("saveAbsencesButton");

    //Dohvati trenutno prijavljenog korisnika
    let currentUser = await fetchCurrentUser();

    //Sakrij gumbe ako korisnik nije nastavnik
    const userRole = localStorage.getItem("role");

    //if (currentUser.role === "nastavnik") {
    if (userRole === "nastavnik") {
        console.log("Korisnik je nastavnik, prikazujem gumbe!");
        editAbsencesButton.classList.remove("hidden");
        addAbsenceButton.classList.remove("hidden");
        saveAbsencesButton.classList.remove("hidden");
    } else {
        console.log("Korisnik nije nastavnik, skrivam gumbe!");
        editAbsencesButton.style.display = "none";
        addAbsenceButton.style.display = "none";
        saveAbsencesButton.style.display = "none";
    }
    //Dohvati i prikaži izostanke
    await fetchAndRenderAbsences();

    //Dugme za uređivanje omogućava promjene u tablici
    editAbsencesButton.addEventListener("click", () => enableEditing());

    //Dohvaćanje i prikaz izostanaka
    async function fetchAndRenderAbsences() {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("Nema tokena! Korisnik nije prijavljen.");
            alert("Morate se prijaviti!");
            window.location.href = "/frontend/index.html";
            return;
        }
        try {
            const response = await fetch("http://localhost:5000/absences", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Greška pri dohvaćanju izostanaka.");
            }
            const absenceTable = document.getElementById("absence-table");
   
            data.forEach((absence) => {
                let row = document.createElement("tr");
                row.innerHTML = 
                `<td>${absence.date}</td>
                <td>${absence.type}</td>
                <td>${absence.note}</td>
                <td><button class="deleteRowButton" data-id="${absence._id ? absence._id : ''}">🗑</button></td>`;
                console.log("Generiran red sa ID-om:", absence._id || "Novi red bez ID-a"); //Debugging
                absenceTable.appendChild(row);
            });
            //Dodaj event listenere za brisanje samo ako postoji ispravan ID
            document.querySelectorAll(".deleteRowButton").forEach((button) => {
                const absenceId = button.getAttribute("data-id");
                if (absenceId) {
                    console.log("Dugme postavljeno s ID-om:", absenceId);
                    button.addEventListener("click", deleteAbsence);
                } else {
                    console.log("Dugme bez ID-a, ne dodajem event listener.");
                }
            });
        } catch (error) {
            console.error("Greška:", error.message);
            alert("Greška pri dohvaćanju izostanaka.");
        }
    }
  

    // Omogućuje uređivanje polja u tablici
    function enableEditing() {
        document.querySelectorAll("#absence-table td").forEach((cell) => {
            cell.contentEditable = true;
        });
        saveAbsencesButton.style.display = "inline-block";
        addAbsenceButton.style.display = "inline-block";
    }
    //Dodavanje novog reda
    addAbsenceButton.addEventListener("click", () => {
        let newRow = document.createElement("tr");
        newRow.innerHTML = 
        `<td contenteditable="true">Unesi datum</td>
        <td contenteditable="true">Opravdani/Neopravdani</td>
        <td contenteditable="true">Unesi napomenu</td>
        <td><button class="deleteRowButton">🗑</button></td>`;
        absenceTable.appendChild(newRow);
        //Dodaj event listener za brisanje samo za nove redove
        newRow.querySelector(".deleteRowButton").addEventListener("click", () => {
            newRow.remove(); // Ukloni novi red ako nije spremljen u bazu
        });
    });

    //Spremanje izostanaka
    saveAbsencesButton.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        const studentEmail = document.getElementById("studentEmail").value; //Email učenika

        if (!studentEmail) {
            alert("Unesite email učenika!");
            return;
        }

        let rows = [];
        document.querySelectorAll("#absence-table tr").forEach((row) => {
            let columns = row.querySelectorAll("td");
            if (columns.length > 0) {
                rows.push({
                    date: columns[0].innerText.trim(),
                    type: columns[1].innerText.trim(),
                    note: columns[2].innerText.trim(),
                });
            }
        });

        console.log("Podaci koji se šalju na server:", rows); // Debugging

        const response = await fetch("http://localhost:5000/absences/update", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({  username: studentEmail, data: rows }),
        });

        const result = await response.json();
        console.log("Odgovor servera:", result); // Debugging

        if (response.ok) {
            alert("Izostanci uspješno spremljeni!");
            await fetchAndRenderAbsences();
        } else {
            alert(`Greška: ${result.message}`);
        }
    });

    //Dohvati trenutno prijavljenog korisnika
    async function fetchCurrentUser() {
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.error("Nema tokena! Korisnik nije prijavljen.");
        return { username: "", role: "student" };
      }
      try {
        const response = await fetch("http://localhost:5000/current-user", {
            method: "GET",
            headers: { 
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
              }
          });
  
          if (!response.ok) {
              throw new Error("Neispravan token ili nije prijavljen korisnik.");
          }
  
          const data = await response.json();
          console.log("Trenutni korisnik:", data);
           //Spremi role u localStorage za kasniju upotrebu
          localStorage.setItem("role", data.role || "student");

          //Dodaj provjeru je li korisnik nastavnik
          //const isTeacher = data.email === "anetakalabric65@gmail.com";
          return { username: data.username || "", role: data.role || "student" };
          //return data;
          } catch (error) {
            console.error("Greška pri dohvaćanju trenutnog korisnika:", error.message);
            return { username: "", role: ""};
        }
    }
    console.log("Trenutni korisnik:", currentUser);

    //Brisanje izostanka
    async function deleteAbsence(event) {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("Nema tokena! Korisnik nije prijavljen.");
            alert("Morate se prijaviti!");
            window.location.href = "/frontend/index.html";
            return;
        }
        if (!event) {
            console.error("Greška: Event nije proslijeđen!");
            return;
        }
        const button = event.target ? event.target.closest("button") : null;
        if (!button) {
            console.error("Kliknuti element nije dugme!");
            return;
        }
        const id = button.getAttribute("data-id");
        if (!id || id === "null" || id.trim() === "") {
            console.error("Greška: ID izostanka nije ispravno postavljen!", id);
            alert("Greška pri brisanju izostanka! ID nije ispravan.");
            return;
        }
        console.log(`Brišem izostanak s ID: ${id}`); // Debugging
        try {
            //Ispravan način korištenja `fetch()`
            const response = await fetch(`http://localhost:5000/absences/delete/${id}`, {
                method: "DELETE",
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok) {
                const errorData = await response.json(); //Dohvati poruku greške sa servera
                throw new Error(errorData.message || "Brisanje neuspješno! Provjeri server.");
            }
            const result = await response.json();
            console.log("Odgovor servera:", result);
            alert("Izostanak uspješno obrisan!");
            await fetchAndRenderAbsences();
        } catch (error) {
            console.error("Greška pri brisanju:", error.message);
            alert(`Greška pri brisanju: ${error.message}`);
        }
    }
});
