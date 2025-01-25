document.addEventListener("DOMContentLoaded", () => {
    const gradesData = [
        { date: '15. rujna 2023.', grade: 5, note: 'Test iz algebre' },
        { date: '1. listopada 2023.', grade: 4, note: 'Domaći zadatak' },
        { date: '3. prosinca 2023.', grade: 3, note: 'Kontrolni iz funkcija' },
        { date: '15. veljače 2024.,', grade: 5, note: 'Usmeni odgovor' },
        { date: '10. svibnja 2024.', grade: 4, note: 'Završni test iz geometrije' },
    ];
  
    const notesData = [
        'Priprema za završni ispit: ponoviti trigonometrijske funkcije.',
        'Proveriti definicije i svojstva linearnih funkcija.',
        'Pregledati zadatke sa kontrolnih i popraviti greške.',
      ];
    
      const curriculumData = [
        'Uvod u algebru: osnovni pojmovi i operacije',
        'Linearna i kvadratna funkcija',
        'Geometrija: trouglovi, površina i zapremina',
        'Trigonometrija: osnovne funkcije i njihova primena',
        'Statistika i verovatnoća',
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