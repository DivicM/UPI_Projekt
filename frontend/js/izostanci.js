/*document.addEventListener('DOMContentLoaded', () => {
    // Podaci o izostancima
    const absences = [
        { date: '2023-09-12', type: 'Opravdani', note: 'Prehlada' },
        { date: '2023-10-05', type: 'Neopravdani', note: 'Kašnjenje' },
        { date: '2023-11-10', type: 'Opravdani', note: 'Pregled kod doktora' },
        { date: '2024-01-20', type: 'Neopravdani', note: 'Bez opravdanja' },
        { date: '2024-03-15', type: 'Opravdani', note: 'Sportsko natjecanje' },
    ];
  
    const absenceTypes = ['Opravdani', 'Neopravdani'];
  
    const absenceLimit = 5; // Granica za upozorenje
  
    // Elementi DOM-a
    const absenceTable = document.getElementById('absence-table');
    const absenceTypesList = document.getElementById('absence-types-list');
    const warningText = document.getElementById('warning-text');
    const filterButton = document.getElementById('filterButton');
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
  
    // Funkcija za prikaz tablice izostanaka
    const renderAbsences = (data) => {
      absenceTable.innerHTML = '';
      data.forEach(absence => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${absence.date}</td>
          <td>${absence.type}</td>
          <td>${absence.note}</td>
        `;
        absenceTable.appendChild(row);
      });
    };
  
    // Funkcija za prikaz vrsta izostanaka
    const renderAbsenceTypes = () => {
      absenceTypesList.innerHTML = '';
      absenceTypes.forEach(type => {
        const li = document.createElement('li');
        li.textContent = type;
        absenceTypesList.appendChild(li);
      });
    };
  
    // Funkcija za upozorenje
    const checkWarning = () => {
      const totalAbsences = absences.length;
      if (totalAbsences > absenceLimit) {
        warningText.textContent = `Pažnja! Ukupno ${totalAbsences} izostanaka. Premašili ste granicu od ${absenceLimit}.`;
        warningText.style.color = 'red';
      } else {
        warningText.textContent = 'Broj izostanaka je u granici normale.';
        warningText.style.color = 'black';
      }
    };
  
    // Funkcija za filtriranje po vremenskom periodu
    const filterAbsences = () => {
      const fromDate = new Date(fromDateInput.value);
      const toDate = new Date(toDateInput.value);
      const filteredAbsences = absences.filter(absence => {
        const absenceDate = new Date(absence.date);
        return absenceDate >= fromDate && absenceDate <= toDate;
      });
      renderAbsences(filteredAbsences);
    };
  
    // Funkcija za crtanje grafa
    const renderChart = () => {
      const ctx = document.getElementById('absenceChart').getContext('2d');
      const counts = absenceTypes.map(type =>
        absences.filter(absence => absence.type === type).length
      );
  
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: absenceTypes,
          datasets: [{
            label: 'Broj izostanaka',
            data: counts,
            backgroundColor: ['#4CAF50', '#FF5733'],
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
          }
        }
      });
    };
  
    // Inicijalizacija
    renderAbsences(absences);
    renderAbsenceTypes();
    checkWarning();
    renderChart();
  
    // Event listener za filter
    filterButton.addEventListener('click', filterAbsences);
  });
  */
 /* document.addEventListener("DOMContentLoaded", async () => {
    const absenceTable = document.getElementById("absence-table");
    const editAbsencesButton = document.getElementById("editAbsencesButton");
    const addRowButton = document.getElementById("addRowButton");
    const saveAbsencesButton = document.getElementById("saveAbsencesButton");
    const fetchAbsencesButton = document.getElementById("fetchAbsences");
    const studentEmailInput = document.getElementById("studentEmail");

    const currentUser = await fetchCurrentUser();

    if (!currentUser) {
        console.error("❌ Greška: Nema prijavljenog korisnika!");
        return;
    }

    if (currentUser.role === "student") {
        studentEmailInput.style.display = "none";
        fetchAbsencesButton.style.display = "none";
        await fetchAndRenderAbsences(currentUser.username);
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
    }

    editAbsencesButton.addEventListener("click", () => enableEditing());
    addAbsenceButton.addEventListener("click", () => addRow());
    saveAbsencesButton.addEventListener("click", async () => await saveAbsences());
});


async function fetchAndRenderAbsences(studentEmail) {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("❌ Nema tokena! Korisnik nije prijavljen.");
        alert("Morate se prijaviti!");
        window.location.href = "/frontend/index.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/absences?username=${studentEmail}`, {
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
        absenceTable.innerHTML = "";

        data.forEach((absence) => {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td contenteditable="false">${absence.date}</td>
                <td contenteditable="false">${absence.type}</td>
                <td contenteditable="false">${absence.note}</td>
                <td><button class="deleteRowButton" data-id="${absence._id}">🗑</button></td>
            `;
            absenceTable.appendChild(row);
        });

        document.querySelectorAll(".deleteRowButton").forEach((button) => {
            button.addEventListener("click", async (event) => {
                await deleteAbsence(event.target.dataset.id);
                await fetchAndRenderAbsences(studentEmail);
            });
        });

        renderAbsenceChart(data);

    } catch (error) {
        console.error("❌ Greška:", error.message);
        alert("Greška pri dohvaćanju izostanaka.");
    }
}


function renderAbsenceChart(absences) {
    const ctx = document.getElementById("absenceChart").getContext("2d");

    if (!ctx) {
        console.error("⛔ Element #absenceChart nije pronađen!");
        return;
    }

    if (window.absenceChart && typeof window.absenceChart.destroy === "function") {
        window.absenceChart.destroy();
    }

    const absenceTypes = ["Opravdani", "Neopravdani"];
    const counts = absenceTypes.map(type =>
        absences.filter(absence => absence.type === type).length
    );

    window.absenceChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: absenceTypes,
            datasets: [{
                label: "Broj izostanaka",
                data: counts,
                backgroundColor: ["#4CAF50", "#FF5733"]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}


function enableEditing() {
    document.querySelectorAll("#absence-table td").forEach((cell) => {
        cell.contentEditable = true;
    });

    document.getElementById("saveAbsencesButton").style.display = "inline-block";
    document.getElementById("addRowButton").style.display = "inline-block";
}


function addRow() {
    const absenceTable = document.getElementById("absence-table");
    let newRow = document.createElement("tr");
    newRow.innerHTML = `
        <td contenteditable="true">Unesi datum</td>
        <td contenteditable="true">Opravdani/Neopravdani</td>
        <td contenteditable="true">Unesi bilješku</td>
        <td><button class="deleteRowButton">🗑</button></td>
    `;
    absenceTable.appendChild(newRow);
}


async function saveAbsences() {
    const token = localStorage.getItem("token");
    const studentEmail = document.getElementById("studentEmail").value.trim();

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

    try {
        const response = await fetch("http://localhost:5000/absences/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ username: studentEmail, data: rows }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Greška pri spremanju izostanaka.");
        }

        alert("Izostanci uspješno spremljeni!");
        await fetchAndRenderAbsences(studentEmail);

    } catch (error) {
        console.error("❌ Greška pri spremanju izostanaka:", error.message);
        alert(`Greška: ${error.message}`);
    }
}


async function deleteAbsence(absenceId) {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("❌ Nema tokena! Korisnik nije prijavljen.");
        alert("Morate se prijaviti!");
        window.location.href = "/frontend/index.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/absences/delete/${absenceId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Greška pri brisanju izostanka.");
        }

        alert("Izostanak uspješno obrisan!");

    } catch (error) {
        console.error("❌ Greška pri brisanju izostanka:", error.message);
        alert(`Greška: ${error.message}`);
    }
}


async function fetchCurrentUser() {
    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    const response = await fetch("http://localhost:5000/current-user", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });

    return response.ok ? await response.json() : null;
}*/


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

const PRAG_IZOSTANAKA = 50; // 🎯 Prag u satima

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

        // 🎯 Logika za prikaz poruka
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

/*document.addEventListener("DOMContentLoaded", async () => {
  const currentUser = await fetchCurrentUser();

  if (currentUser.role === "student") {
      await fetchAndDisplayAbsenceWarning(currentUser.username);
  } else {
      document.querySelector(".warning").remove();
  }
});
*/

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