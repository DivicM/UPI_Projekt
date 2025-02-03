document.addEventListener("DOMContentLoaded", async () => {

    const absenceTable = document.getElementById("absence-table");
    const editAbsencesButton = document.getElementById("editAbsencesButton");
    const addAbsenceButton = document.getElementById("addAbsenceButton");
    const saveAbsencesButton = document.getElementById("saveAbsencesButton");
    const studentEmailInput = document.getElementById("studentEmail");
    const fetchAbsencesButton = document.getElementById("fetchAbsences");
    const chartCanvas = document.getElementById("absenceChart").getContext("2d");


    let absencesData = [];
    let currentUser = await fetchCurrentUser();

    if (!currentUser) {
        console.error("❌ Nema prijavljenog korisnika!");
        return;
    }

    if (currentUser.role === "nastavnik") {
        editAbsencesButton.classList.remove("hidden");
        addAbsenceButton.classList.remove("hidden");
        saveAbsencesButton.classList.remove("hidden");

        fetchAbsencesButton.addEventListener("click", async () => {
            const studentEmail = studentEmailInput.value.trim();
            if (!studentEmail) {
                alert("Unesite email učenika!");
                return;
            }
            await fetchAndRenderAbsences(studentEmail);
        });

    } else {
        await fetchAndRenderAbsences(currentUser.username);
        studentEmailInput.style.display = "none";
        fetchAbsencesButton.style.display = "none";
        editAbsencesButton.style.display = "none";
        addAbsenceButton.style.display = "none";
        saveAbsencesButton.style.display = "none";

    }
    const profile = document.getElementById('profile');

    if (profile) {
        profile.addEventListener('click', () => {
            window.location.href = "/frontend/pages/profil.html"; // Preusmjeravanje na profil.html
        });
    }

    addAbsenceButton.addEventListener("click", () => {
        let newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td contenteditable="true">${new Date().toISOString().split('T')[0]}</td>
          <td contenteditable="true">1</td>
          <td contenteditable="true">Neopravdano</td>
          <td contenteditable="true">-</td>
          <td><button class="deleteAbsenceButton">🗑</button></td>
      `;
        absenceTable.appendChild(newRow);
    });

    saveAbsencesButton.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        const studentEmail = studentEmailInput.value.trim() || currentUser.username;

        let updatedAbsences = [];
        document.querySelectorAll("#absence-table tr").forEach(row => {
            const columns = row.querySelectorAll("td");
            if (columns.length > 0) {
                updatedAbsences.push({
                    date: columns[0].innerText,
                    hours: parseInt(columns[1].innerText),
                    type: columns[2].innerText,
                    note: columns[3].innerText
                });
            }
        });

        const response = await fetch("http://localhost:5000/absences/update", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: studentEmail, data: updatedAbsences })
        });

        const result = await response.json();
        alert(result.message);
        await fetchAndRenderAbsences(studentEmail);
    });

    async function fetchAndRenderAbsences(studentEmail) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/absences?studentEmail=${studentEmail}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Greška ${response.status}: ${await response.text()}`);
            }

            absencesData = await response.json();
            absenceTable.innerHTML = "";

            absencesData.forEach((absence, index) => {
                let row = document.createElement("tr");
                row.innerHTML = `
                  <td contenteditable="true">${absence.date}</td>
                  <td contenteditable="true">${absence.hours}</td>
                  <td contenteditable="true">${absence.type}</td>
                  <td contenteditable="true">${absence.note}</td>
                  <td><button class="deleteAbsenceButton" data-index="${index}">🗑</button></td>
              `;
                absenceTable.appendChild(row);
            });

            document.querySelectorAll(".deleteAbsenceButton").forEach(button => {
                button.addEventListener("click", async (event) => {
                    const index = event.target.dataset.index;
                    await deleteAbsence(absencesData[index]._id);
                });
            });

            renderAbsenceChart(absencesData);

        } catch (error) {
            console.error("❌ Greška pri dohvaćanju izostanaka:", error.message);
        }
    }

    async function deleteAbsence(absenceId) {
        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`http://localhost:5000/absences/delete/${absenceId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Greška pri brisanju: ${await response.text()}`);
            }

            alert("Izostanak uspješno obrisan!");
            await fetchAndRenderAbsences(currentUser.username);

        } catch (error) {
            console.error("❌ Greška pri brisanju:", error.message);
            alert(error.message);
        }
    }

    function renderAbsenceChart(absences) {
        if (window.absenceChart instanceof Chart) {
            window.absenceChart.destroy();
        }

        const ctx = document.getElementById("absenceChart").getContext("2d");

        const labels = ["Opravdani", "Neopravdani"];
        const data = [
            absences.filter(a => a.type === "Opravdano").reduce((sum, a) => sum + a.hours, 0),
            absences.filter(a => a.type === "Neopravdano").reduce((sum, a) => sum + a.hours, 0)
        ];

        window.absenceChart = new Chart(ctx, {
            type: "pie",
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: ["green", "red"]
                }]
            }
        });
    }

    async function fetchCurrentUser() {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("❌ Nema tokena! Korisnik nije prijavljen.");
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
            console.error("❌ Greška pri dohvaćanju korisnika:", error.message);
            return null;
        }
    }
    if (currentUser.role === "student") {
        await fetchAndDisplayAbsenceWarning(currentUser.username);
    } else {
        document.querySelector(".warning").remove();
    }
});

const PRAG_IZOSTANAKA = 50; //  Prag u satima

async function fetchAndDisplayAbsenceWarning(username) {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("❌ Greška: Nema tokena! Korisnik nije prijavljen.");
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
        console.log(`📌 Ukupan broj sati izostanaka:`, totalHours);

        const warningText = document.getElementById("warning-text");
        const warningSection = document.querySelector(".warning");

        //  Logika za prikaz poruka
        if (totalHours < PRAG_IZOSTANAKA) {
            warningText.innerText = "Broj izostanaka je u granici normale.";
            warningSection.style.backgroundColor = "#d4edda"; // Zeleno
        } else if (totalHours === PRAG_IZOSTANAKA) {
            warningText.innerText = "⚠ Nesmiješ više izostati!";
            warningSection.style.backgroundColor = "#fff3cd"; // Žuto
        } else {
            warningText.innerText = "❌ Prešao si dopušteni prag izostanaka!";
            warningSection.style.backgroundColor = "#f8d7da"; // Crveno
        }

    } catch (error) {
        console.error("❌ Greška pri dohvaćanju upozorenja:", error.message);
    }
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