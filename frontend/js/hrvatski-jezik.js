/*document.addEventListener("DOMContentLoaded", () => {
    const gradesData = [
        { date: '12. rujna 2023.', grade: 4, note: 'Esej: "Šuma Striborova"' },
        { date: '15. studenog 2023.', grade: 5, note: 'Test iz pravopisa' },
        { date: '25. siječnja 2024.', grade: 3, note: 'Usmeni odgovor: "Zlatarovo zlato"' },
        { date: '10. ožujka 2024.', grade: 4, note: 'Analiza pjesme A.G. Matoša' },
        { date: '28. svibnja 2024.', grade: 5, note: 'Završni test' },
    ];
  
    const notesData = [
        'Ponoviti pravopisna pravila (č/ć, ije/je).',
        'Pregledati analize lektira: "Zlatarovo zlato" i "Šuma Striborova".',
        'Pripremiti uvod i zaključak za pisanje eseja.',
    ];

    const curriculumData = [
        'Gramatika: vrste rečenica, pravopis i sintaksa',
        'Lektire: "Šuma Striborova", "Zlatarovo zlato", "Povratak Filipa Latinovicza"',
        'Pisanje eseja: uvod, razrada i zaključak',
        'Analiza pjesama: Matoš, Šenoa, Ujević',
        'Hrvatski književni jezik i dijalekti',
      ];
  
    // Popunjavanje tablice ocjenama
    const gradesTable = document.getElementById("grades-table");
    gradesData.forEach((entry) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${entry.date}</td>
        <td>${entry.grade}</td>
        <td>${entry.note}</td>
      `;
      gradesTable.appendChild(row);
    });
  
    // Popunjavanje bilješki
    const notesList = document.getElementById("notes-list");
    notesData.forEach((note) => {
      const li = document.createElement("li");
      li.textContent = note;
      notesList.appendChild(li);
    });

    // Popunjavanje gradiva
  const curriculumList = document.getElementById('curriculum-list');
  data.curriculum.forEach((topic) => {
    const li = document.createElement('li');
    li.textContent = topic;
    curriculumList.appendChild(li);
  });
  });*/
  
  //ažuriranje ocjena, bilješki i gradiva
document.addEventListener("DOMContentLoaded", async () => {
  const gradesTable = document.getElementById("grades-table");
  const editGradesButton = document.getElementById("editGradesButton");
  const addRowButton = document.getElementById("addRowButton");
  const saveGradesButton = document.getElementById("saveGradesButton");

  const currentUser = await fetchCurrentUser();

  // Ako je korisnik nastavnik, prikaži gumbe
  if (currentUser.email === "anetakalabric65@gmail.com") {
      editGradesButton.classList.remove("hidden");
      addRowButton.classList.remove("hidden");
      saveGradesButton.classList.remove("hidden");
  }

  // Dohvati ocjene iz servera
  await fetchAndRenderGrades();

  editGradesButton.addEventListener("click", () => enableEditing());

  async function fetchAndRenderGrades() {
      const response = await fetch("http://localhost:5000/biologija/grades");
      const grades = await response.json();

      gradesTable.innerHTML = ""; // Očisti tablicu prije ponovnog punjenja

      grades.forEach((entry, index) => {
          let row = document.createElement("tr");
          row.innerHTML = `
              <td contenteditable="true">${entry.date}</td>
              <td contenteditable="true">${entry.grade}</td>
              <td contenteditable="true">${entry.note}</td>
              <td>
                  <button class="deleteRowButton" data-index="${index}">🗑</button>
              </td>
          `;
          gradesTable.appendChild(row);
      });

      // Omogući brisanje redova
      document.querySelectorAll(".deleteRowButton").forEach((button) => {
          button.addEventListener("click", (event) => {
              deleteRow(event.target.dataset.index);
          });
      });
  }

  function enableEditing() {
      document.querySelectorAll("#grades-table td").forEach((cell) => {
          cell.contentEditable = true;
      });

      saveChangesButton.style.display = "inline-block";
      addRowButton.style.display = "inline-block";
  }

  addRowButton.addEventListener("click", () => {
      let newRow = document.createElement("tr");
      newRow.innerHTML = `
          <td contenteditable="true">Unesi datum</td>
          <td contenteditable="true">Unesi ocjenu</td>
          <td contenteditable="true">Unesi bilješku</td>
          <td><button class="deleteRowButton">🗑</button></td>
      `;
      gradesTable.appendChild(newRow);
  });

  saveGradesButton.addEventListener("click", async () => {
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

      const response = await fetch("http://localhost:5000/biologija/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentUser.email, dataType: "grades", data: rows }),
      });

      const result = await response.json();
      alert(result.message);
      await fetchAndRenderGrades(); // Ponovno učitavanje nakon spremanja
  });

  async function fetchCurrentUser() {
      const response = await fetch("http://localhost:5000/current-user");
      return response.ok ? await response.json() : { email: "" };
  }

  async function deleteRow(index) {
      let response = await fetch("http://localhost:5000/biologija/delete/${index}", {
          method: "DELETE",
      });

      if (response.ok) {
          alert("Red uspješno obrisan!");
          await fetchAndRenderGrades();
      }
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
  if (currentUser.email === "anetakalabric65@gmail.com") {
      editNotesButton.classList.remove("hidden");
      addNoteButton.classList.remove("hidden");
      saveNotesButton.classList.remove("hidden");
  }
  
  // Dohvati bilješke iz servera
  await fetchAndRenderNotes();

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
      let notes = [];
      document.querySelectorAll("#notes-list li span").forEach((note) => {
          notes.push(note.innerText.trim());
      });

      const response = await fetch("http://localhost:5000/biologija/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentUser.email, dataType: "notes", data: notes }),
      });

      const result = await response.json();
      alert(result.message);
      await fetchAndRenderNotes(); // Ponovno učitaj bilješke nakon spremanja
  });

  async function fetchAndRenderNotes() {  
      const response = await fetch("http://localhost:5000/biologija/notes");
      const notes = await response.json();

      const notesList = document.getElementById("notes-list");
      notesList.innerHTML = ""; // Očisti listu prije punjenja

      notes.forEach((note, index) => {
          let li = document.createElement("li");
          li.innerHTML = `
              <span contenteditable="true">${note}</span>
              <button class="deleteRowButton" data-index="${index}">🗑</button>
          `;
          notesList.appendChild(li);
      });

      // Dodaj funkcionalnost za brisanje bilješki
      document.querySelectorAll(".deleteRowButton").forEach((button) => {
          button.addEventListener("click", async (event) => {
              const index = event.target.dataset.index;
              await fetch(`http://localhost:5000/biologija/delete/notes/${index}`, {
                  method: "DELETE",
              });

              await fetchAndRenderNotes(); // Ponovno učitaj bilješke nakon brisanja
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
      const response = await fetch("http://localhost:5000/current-user");
      return response.ok ? await response.json() : { email: "" };
  }
});
document.addEventListener("DOMContentLoaded", async () => {
  const curriculumList = document.getElementById("curriculum-list");
  const editCurriculumButton = document.getElementById("editCurriculumButton");
  const addCurriculumButton = document.getElementById("addCurriculumButton");
  const saveCurriculumButton = document.getElementById("saveCurriculumButton");

  const currentUser = await fetchCurrentUser();

  // Ako je korisnik nastavnik, prikaži gumbe
  if (currentUser.email === "anetakalabric65@gmail.com") {
      editCurriculumButton.classList.remove("hidden");
      addCurriculumButton.classList.remove("hidden");
      saveCurriculumButton.classList.remove("hidden");
  }

  await fetchAndRenderCurriculum();

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
      let curriculum = [];
      document.querySelectorAll("#curriculum-list li span").forEach((topic) => {
          curriculum.push(topic.innerText.trim());
      });

      const response = await fetch("http://localhost:5000/biologija/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentUser.email, dataType: "curriculum", data: curriculum }),
      });

      const result = await response.json();
      alert(result.message);
      await fetchAndRenderCurriculum(); // Ponovno učitaj gradivo nakon spremanja
  });
  async function fetchAndRenderCurriculum() {
    const response = await fetch("http://localhost:5000/biologija/curriculum");
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

            await fetch(`http://localhost:5000/biologija/delete/curriculum/${index}`, {
                method: "DELETE",
            });

            await fetchAndRenderCurriculum(); // Ponovno učitaj gradivo nakon brisanja
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
async function fetchCurrentUser() {
  const response = await fetch("http://localhost:5000/current-user");
  return response.ok ? await response.json() : { email: "" };
}
});

document.addEventListener("DOMContentLoaded", async () => {
  const finalExamList = document.getElementById("final-exam-list");
  const editFinalExamButton = document.getElementById("editFinalExamButton");
  const addFinalExamButton = document.getElementById("addFinalExamButton");
  const saveFinalExamButton = document.getElementById("saveFinalExamButton");

  const currentUser = await fetchCurrentUser();

  // Ako je korisnik nastavnik, prikaži gumbe
  if (currentUser.email === "anetakalabric65@gmail.com") {
      editFinalExamButton.classList.remove("hidden");
      addFinalExamButton.classList.remove("hidden");
      saveFinalExamButton.classList.remove("hidden");
  }

  await fetchAndRenderFinalExam();

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
      let finalExamMaterials = [];
      document.querySelectorAll("#final-exam-list li span").forEach((material) => {
          finalExamMaterials.push(material.innerText.trim());
      });

      const response = await fetch("http://localhost:5000/biologija/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentUser.email, dataType: "finalExam", data: finalExamMaterials }),
      });

      const result = await response.json();
      alert(result.message);
      await fetchAndRenderFinalExam(); // Ponovno učitaj materijale nakon spremanja
  });
  async function fetchAndRenderFinalExam() {
    const response = await fetch("http://localhost:5000/biologija/finalExam");
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

            await fetch(`http://localhost:5000/biologija/delete/finalExam/${index}`, {
                method: "DELETE",
            });

            await fetchAndRenderFinalExam(); // Ponovno učitaj materijale nakon brisanja
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
async function fetchCurrentUser() {
  const response = await fetch("http://localhost:5000/current-user");
  return response.ok ? await response.json() : { email: "" };
}
});
