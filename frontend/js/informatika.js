document.addEventListener("DOMContentLoaded", () => {
  const gradesData = [
    { date: '10. rujna 2023.', grade: 5, note: 'Projekt: Izrada web stranice' },
    { date: '15. studenog 2023.', grade: 4, note: 'Test iz osnova programiranja' },
    { date: '20. rujna 2024.', grade: 5, note: 'Usmeni odgovor o algoritmima' },
    { date: '15. ožujka 2024.', grade: 4, note: 'Projekt: Baza podataka' },
    { date: '21. svibnja 2024.', grade: 5, note: 'Završni test' },
  ];

  const notesData = [
    'Ponoviti osnove HTML-a i CSS-a.',
    'Pregledati koncepte petlji i funkcija u programiranju.',
    'Vežbati rad sa bazama podataka i SQL upitima.',
  ];
  const curriculumData = [
    'Osnove HTML-a i CSS-a: struktura i stilizacija stranica',
    'Osnove programiranja: promenljive, petlje i funkcije',
    'Algoritmi: sortiranje i pretraživanje',
    'Baze podataka: kreiranje i manipulacija SQL-om',
    'Osnove računalnih mreža i sigurnosti',
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
});

