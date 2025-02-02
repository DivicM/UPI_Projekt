document.addEventListener("DOMContentLoaded", () => {
  const gradesData = [
    { date: "2023-09-15", grade: 5, note: "Odličan rezultat na testu" },
    { date: "2023-10-05", grade: 4, note: "Domaća zadaća" },
  ];

  const notesData = ["Priprema za test iz trigonometrije", "Ponoviti funkcije"];

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
});
