const subjectName = document.body.dataset.subject || window.location.pathname.split("/").pop().replace(".html", "").replaceAll("-", "");
console.log("📌 Trenutno odabrani predmet:", subjectName);

document.addEventListener("DOMContentLoaded", async () => {
  const gradesTable = document.getElementById("grades-table");
  const editGradesButton = document.getElementById("editGradesButton");
  const addRowButton = document.getElementById("addRowButton");
  const saveGradesButton = document.getElementById("saveGradesButton");
  const fetchGradesButton = document.getElementById("fetchGrades");
  const currentUser = await fetchCurrentUser();

  // Ako je korisnik nastavnik, prikaži gumbe
  if (currentUser.role === "nastavnik") {
      editGradesButton.classList.remove("hidden");
      addRowButton.classList.remove("hidden");
      saveGradesButton.classList.remove("hidden");
      fetchGradesButton.addEventListener("click", async () => {
        studentEmail = getCurrentStudentEmail();
        await fetchAndRenderGrades();
  })
    
  } else {
    console.warn("⛔ Korisnik NIJE nastavnik – skrivam gumbe!");
  }

  await fetchAndRenderGrades();
  
  editGradesButton.addEventListener("click", () => enableEditing());

  async function fetchAndRenderGrades() {
    try {
        const token = localStorage.getItem("token"); // ✅ Dohvati JWT token
        const studentEmail = await getCurrentStudentEmail();
        
        if (!token) {
            console.error("❌ Nema tokena! Korisnik nije prijavljen.");
            return;
        }
        if (!studentEmail) {
            console.warn("⛔ Nema emaila učenika!");
            return;
        }

        const response = await fetch(`http://localhost:5000/grades/${subjectName}/${studentEmail}`, {
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

        const grades = await response.json();
        console.log("📌 Dohvaćene ocjene:", grades);
        
        if (!Array.isArray(grades)) {
            throw new Error("Podaci nisu u JSON formatu!");
        }

        
        gradesTable.innerHTML = ""; // Očisti tablicu

        grades.forEach((entry, index) => {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td contenteditable="true">${entry.date}</td>
                <td contenteditable="true">${entry.grade}</td>
                <td contenteditable="true">${entry.note}</td>
                <button class="deleteRowButton" data-index="${index}">🗑</button>
            `;
            gradesTable.appendChild(row);
        });

        // Omogući brisanje redova
        document.querySelectorAll(".deleteRowButton").forEach((button) => {
            button.addEventListener("click", async (event) => {
                const index = event.target.dataset.index;
                await deleteRow(index);
            });
        });

    } catch (error) {
        console.error("❌ Greška pri dohvaćanju ocjena:", error.message);
    }
  }

  function enableEditing() {
      document.querySelectorAll("#grades-table td").forEach((cell) => {
          cell.contentEditable = true;
      });

      saveGradesButton.style.display = "inline-block";
      addRowButton.style.display = "inline-block";
  }

  addRowButton.addEventListener("click", () => {
      let newRow = document.createElement("tr");
      newRow.innerHTML = `
          <td contenteditable="true">Unesi datum</td>
          <td contenteditable="true">Unesi ocjenu</td>
          <td contenteditable="true">Unesi bilješku</td>
          <button class="deleteRowButton">🗑</button>
      `;
      gradesTable.appendChild(newRow);
  });

  saveGradesButton.addEventListener("click", async () => {
    const token = localStorage.getItem("token");  
    const studentEmail = getCurrentStudentEmail();

    if (!studentEmail) {
        alert("Unesite email učenika!");
        return;
    }

    let rows = [];
    document.querySelectorAll("#grades-table tr").forEach((row) => {
        let columns = row.querySelectorAll("td");
        if (columns.length > 0) {
            rows.push({
                date: columns[0].innerText,
                grade: columns[1].innerText,
                note: columns[2].innerText,
            });
        }
    });

    const response = await fetch(`http://localhost:5000/grades/${subjectName}/${studentEmail}`, {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ grades: rows }),
    });

    const result = await response.json();
    alert(result.message);
    await fetchAndRenderGrades(); // 🔄 Ponovno učitaj ocjene
  });

  async function fetchCurrentUser() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("❌ Nema tokena! Korisnik nije prijavljen.");
        return { username: "", role: "student" }; // Student je default
    }

    try {
        const response = await fetch("http://localhost:5000/current-user", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Neispravan token ili nije prijavljen korisnik.");
        const data = await response.json();
        console.log("📌 Trenutni korisnik:", data);
        return { username: data.username, role: data.role || "student" };

    } catch (error) {
        console.error("❌ Greška pri dohvaćanju korisnika:", error.message);
        return { username: "", role: "student" };
    }
  }

  async function deleteRow(index) {
    const token = localStorage.getItem("token");
    const studentEmail = getCurrentStudentEmail();

    if (!studentEmail) {
        alert("Unesite email učenika!");
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/grades/${subjectName}/${studentEmail}/${index}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Greška pri brisanju: ${errorData.message}`);
        }

        alert("Ocjena uspješno obrisana!");
        await fetchAndRenderGrades(); // Ponovno učitavanje nakon brisanja

    } catch (error) {
        console.error("❌ Greška pri brisanju:", error.message);
        alert(error.message);
    }
  }

  async function getCurrentStudentEmail() {
    const currentUser = await fetchCurrentUser();
    if (currentUser.role === "student") {
        return currentUser.username; // Automatski dohvaća email prijavljenog učenika
    }
    const emailInput = document.getElementById("studentEmail");
    return emailInput ? emailInput.value.trim() : "";
  }

});

// Ažuriranje bilješki
document.addEventListener("DOMContentLoaded", async () => {
    const notesList = document.getElementById("notes-list");
    const editNotesButton = document.getElementById("editNotesButton");
    const addNoteButton = document.getElementById("addNoteButton");
    const saveNotesButton = document.getElementById("saveNotesButton");
    const currentUser = await fetchCurrentUser();

    // Ako je korisnik nastavnik, prikaži gumbe
    if (currentUser.role === "nastavnik") {
        editNotesButton.classList.remove("hidden");
        addNoteButton.classList.remove("hidden");
        saveNotesButton.classList.remove("hidden");
    } else {
        console.warn("⛔ Korisnik NIJE nastavnik – skrivam gumbe!");
    }
    await fetchAndRenderNotes("notes");

    editNotesButton.addEventListener("click", () => enableEditingNotes());

    addNoteButton.addEventListener("click", () => {
        let newNote = document.createElement("li");
        newNote.innerHTML = `
          <span contenteditable="true">Unesi novu bilješku</span>
          <button class="deleteRowButton">🗑</button>
      `;
        notesList.appendChild(newNote);
    });

    saveNotesButton.addEventListener("click", async () => {
        const studentEmail = document.getElementById("studentEmail").value; //  Email učenika
        if (!studentEmail) {
            alert("Unesite email učenika!");
            return;
        }
        const token = localStorage.getItem("token");
        let notes = [];
        document.querySelectorAll("#notes-list li span").forEach((note) => {
            notes.push(note.innerText.trim());
        });

        const response = await fetch(`http://localhost:5000/${subjectName}/update`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: studentEmail, dataType: "notes", data: notes }),
        });

        const result = await response.json();
        alert(result.message);
        await fetchAndRenderNotes("notes"); // Ponovno učitaj bilješke nakon spremanja
    });

    async function fetchAndRenderNotes(dataType) {
        const response = await fetch(`http://localhost:5000/${subjectName}/${dataType}`);
        const notes = await response.json();
        const notesList = document.getElementById("notes-list");
        notesList.innerHTML = ""; // Očisti listu prije punjenja

        notes.forEach((note, index) => {
            let li = document.createElement("li");
            li.innerHTML = `
              <span contenteditable="true">${note}</span>
              <button class="deleteRowButton" data-index="${index}">🗑</button>`;
            notesList.appendChild(li);
        });

        // Dodaj funkcionalnost za brisanje bilješki
        document.querySelectorAll(".deleteRowButton").forEach((button) => {
            button.addEventListener("click", async (event) => {
                const index = event.target.dataset.index;
                await fetch(`http://localhost:5000/${subjectName}/delete/${dataType}/${index}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "username": currentUser.username, // Dodaj email u header
                    }
                });

                if (response.ok) {
                    alert("Red uspješno obrisan!");
                    await fetchAndRenderNotes("notes");
                } else {
                    const errorData = await response.json();
                    alert(`Greška: ${errorData.message}`);
                }
            });
        });
    }

    function enableEditingNotes() {
        document.querySelectorAll("#notes-list span").forEach((note) => {
            note.contentEditable = true;
        });

        const saveNotesButton = document.getElementById("saveNotesButton");
        const addNoteButton = document.getElementById("addNoteButton");

        saveNotesButton.style.display = "inline-block";
        addNoteButton.style.display = "inline-block";
    }

    async function fetchCurrentUser() {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("❌ Nema tokena! Korisnik nije prijavljen.");
            return { username: "", role: "student" }; // Student je default
        }

        try {
            const response = await fetch("http://localhost:5000/current-user", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Neispravan token ili nije prijavljen korisnik.");
            const data = await response.json();
            console.log("📌 Trenutni korisnik:", data);
            return { username: data.username, role: data.role || "student" };

        } catch (error) {
            console.error("❌ Greška pri dohvaćanju korisnika:", error.message);
            return { username: "", role: "student" };
        }
    }

});
document.addEventListener("DOMContentLoaded", async () => {
    const curriculumList = document.getElementById("curriculum-list");
    const editCurriculumButton = document.getElementById("editCurriculumButton");
    const addCurriculumButton = document.getElementById("addCurriculumButton");
    const saveCurriculumButton = document.getElementById("saveCurriculumButton");

    const currentUser = await fetchCurrentUser();

    // Ako je korisnik nastavnik, prikaži gumbe
    if (currentUser.role === "nastavnik") {
        editCurriculumButton.classList.remove("hidden");
        addCurriculumButton.classList.remove("hidden");
        saveCurriculumButton.classList.remove("hidden");
    } else {
        console.warn("⛔ Korisnik NIJE nastavnik – skrivam gumbe!");
    }

    await fetchAndRenderCurriculum("curriculum");

    // Omogući uređivanje obrađenog gradiva
    editCurriculumButton.addEventListener("click", () => enableEditingCurriculum());

    // Omogući dodavanje novog gradiva
    addCurriculumButton.addEventListener("click", () => {
        let newTopic = document.createElement("li");
        newTopic.innerHTML = `
          <span contenteditable="true">Unesi novo gradivo</span>
          <button class="deleteRowButton">🗑</button>
      `;
        curriculumList.appendChild(newTopic);
    });

    // Omogući spremanje gradiva
    saveCurriculumButton.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        let curriculum = [];
        document.querySelectorAll("#curriculum-list li span").forEach((topic) => {
            curriculum.push(topic.innerText.trim());
        });

        const response = await fetch(`http://localhost:5000/${subjectName}/update`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: currentUser.username, dataType: "curriculum", data: curriculum }),
        });

        const result = await response.json();
        alert(result.message);
        await fetchAndRenderCurriculum("curriculum"); // Ponovno učitaj gradivo nakon spremanja
    });
    async function fetchAndRenderCurriculum(dataType) {
        const response = await fetch(`http://localhost:5000/${subjectName}/${dataType}`);
        const curriculum = await response.json();

        const curriculumList = document.getElementById("curriculum-list");
        curriculumList.innerHTML = ""; // Očisti listu prije punjenja

        curriculum.forEach((topic, index) => {
            let li = document.createElement("li");
            li.innerHTML = `
            <span contenteditable="true">${topic}</span>
            <button class="deleteRowButton" data-index="${index}">🗑</button>
            `;
            curriculumList.appendChild(li);
        });

        // Omogući brisanje gradiva
        document.querySelectorAll(".deleteRowButton").forEach((button) => {
            button.addEventListener("click", async (event) => {
                const index = event.target.dataset.index;

                await fetch(`http://localhost:5000/${subjectName}/delete/${dataType}/${index}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "username": currentUser.username, // Dodaj email u header
                    }
                });
                if (response.ok) {
                    alert("Red uspješno obrisan!");
                    await fetchAndRenderCurriculum("curriculum");
                } else {
                    const errorData = await response.json();
                    alert(`Greška: ${errorData.message}`);
                }

            });
        });
    }
    function enableEditingCurriculum() {
        document.querySelectorAll("#curriculum-list span").forEach((topic) => {
            topic.contentEditable = true;
        });

        const saveCurriculumButton = document.getElementById("saveCurriculumButton");
        const addCurriculumButton = document.getElementById("addCurriculumButton");

        saveCurriculumButton.style.display = "inline-block";
        addCurriculumButton.style.display = "inline-block";
    }
});

async function fetchCurrentUser() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("❌ Nema tokena! Korisnik nije prijavljen.");
        return { username: "", role: "student" }; // Student je default
    }

    try {
        const response = await fetch("http://localhost:5000/current-user", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Neispravan token ili nije prijavljen korisnik.");
        const data = await response.json();
        console.log("📌 Trenutni korisnik:", data);
        return { username: data.usernamer, role: data.role || "student" };

    } catch (error) {
        console.error("❌ Greška pri dohvaćanju korisnika:", error.message);
        return { username: "", role: "student" };
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const finalExamList = document.getElementById("final-exam-list");
    const editFinalExamButton = document.getElementById("editFinalExamButton");
    const addFinalExamButton = document.getElementById("addFinalExamButton");
    const saveFinalExamButton = document.getElementById("saveFinalExamButton");

    const currentUser = await fetchCurrentUser();
    console.log("Prijavljeni korisnik:", currentUser);

    // Ako je korisnik nastavnik, prikaži gumbe
    if (currentUser.role === "nastavnik") {
        editFinalExamButton.classList.remove("hidden");
        addFinalExamButton.classList.remove("hidden");
        saveFinalExamButton.classList.remove("hidden");
    } else {
        console.warn("⛔ Korisnik NIJE nastavnik – skrivam gumbe!");
    }

    await fetchAndRenderFinalExam("finalExam");

    // Omogući uređivanje materijala za završni ispit
    editFinalExamButton.addEventListener("click", () => enableEditingFinalExam());

    // Omogući dodavanje novog materijala
    addFinalExamButton.addEventListener("click", () => {
        let newMaterial = document.createElement("li");
        newMaterial.innerHTML = `
          <span contenteditable="true">Unesi novi materijal</span>
          <button class="deleteRowButton">🗑</button>
      `;
        finalExamList.appendChild(newMaterial);
    });


    // Omogući spremanje materijala
    saveFinalExamButton.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        let finalExamMaterials = [];
        document.querySelectorAll("#final-exam-list li span").forEach((material) => {
            finalExamMaterials.push(material.innerText.trim());
        });

        const response = await fetch(`http://localhost:5000/${subjectName}/update`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username: currentUser.username, dataType: "finalExam", data: finalExamMaterials }),
        });

        const result = await response.json();
        alert(result.message);
        await fetchAndRenderFinalExam("finalExam"); // Ponovno učitaj materijale nakon spremanja
    });
    async function fetchAndRenderFinalExam(dataType) {
        const response = await fetch(`http://localhost:5000/${subjectName}/${dataType}`);
        const finalExamMaterials = await response.json();

        const finalExamList = document.getElementById("final-exam-list");
        finalExamList.innerHTML = ""; // Očisti listu prije punjenja

        finalExamMaterials.forEach((material, index) => {
            let li = document.createElement("li");
            li.innerHTML = `
            <span contenteditable="true">${material}</span>
            <button class="deleteRowButton" data-index="${index}">🗑</button>
        `;
            finalExamList.appendChild(li);
        });

        // Omogući brisanje materijala
        document.querySelectorAll(".deleteRowButton").forEach((button) => {
            button.addEventListener("click", async (event) => {
                const index = event.target.dataset.index;

                await fetch(`http://localhost:5000/${subjectName}/delete/${dataType}/${index}`, {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json",
                        "username": currentUser.username, // Dodaj email u header
                    }
                });
                if (response.ok) {
                    alert("Red uspješno obrisan!");
                    await fetchAndRenderFinalExam("finalExam");
                } else {
                    const errorData = await response.json();
                    alert(`Greška: ${errorData.message}`);
                }
            });
        });
    }
    function enableEditingFinalExam() {
        document.querySelectorAll("#final-exam-list span").forEach((material) => {
            material.contentEditable = true;
        });

        const saveFinalExamButton = document.getElementById("saveFinalExamButton");
        const addFinalExamButton = document.getElementById("addFinalExamButton");

        saveFinalExamButton.style.display = "inline-block";
        addFinalExamButton.style.display = "inline-block";
    }
});
async function fetchCurrentUser() {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("❌ Nema tokena! Korisnik nije prijavljen.");
        return { username: "", role: "student" }; // Student je default
    }

    try {
        const response = await fetch("http://localhost:5000/current-user", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Neispravan token ili nije prijavljen korisnik.");
        const data = await response.json();
        console.log("📌 Trenutni korisnik:", data);
        return { username: data.username, role: data.role || "student" };

    } catch (error) {
        console.error("❌ Greška pri dohvaćanju korisnika:", error.message);
        return { username: "", role: "student" };
    }
}
