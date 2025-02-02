document.addEventListener("DOMContentLoaded", () => {
  const gradesData = [
    { date: '19. rujna 2023.', grade: 5, note: 'Laboratorijska vežba: kiseline i baze' },
    { date: '10 studenog 2023.', grade: 4, note: 'Test iz periodnog sustava elemenata' },
    { date: '26. siječnja 2024.', grade: 3, note: 'Usmeni odgovor: kemijske reakcije' },
    { date: '17. ožujka 2024.', grade: 5, note: 'Projekt: analitička kemija' },
    { date: '24. svibnja 2024.', grade: 5, note: 'Završni test' },
  ];

  const notesData = [
    'Ponoviti osnovne kemijske reakcije: sinteza, razgradnja, zamjena.',
    'Naučiti glavne elemente periodnog sustava.',
    'Pregledati laboratorijske vežbe sa praktičnim primerima.',
  ];

  const curriculumData = [
    'Kemijske reakcije: vrste i primjeri',
    'Periodni sustav elemenata: svojstva i grupe',
    'Stanja tvari: plinovito, tekuće i čvrsto',
    'Kiseline i baze: svojstva i neutralizacija',
    'Analitička kemija: metode i primjena',
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
  curriculumData.forEach((topic) => {
    const li = document.createElement('li');
    li.textContent = topic;
    curriculumList.appendChild(li);
  });
});
