document.addEventListener("DOMContentLoaded", () => {
    const gradesData = [
        { date: '20. rujna 2023.', grade: 5, note: 'Test iz ćelijske biologije' },
        { date: '2. listopada 2023.', grade: 4, note: 'Praktična vježba iz gramatike' },
        { date: '5. studenog 2023.', grade: 3, note : 'Usmeni odgovor iz anatomije'},
        { date: '15. siječnja 2024.', grade: 4, note: 'Zadaci iz ekologije' },
        { date: '10. ožujak 2024.,', grade: 5, note: 'Usmeni odgovor' },
        { date: '20. svibnja 2024.', grade: 5, note: 'Završni test' },
    ];
  
    const notesData = [
        'Ponoviti sistem organa kod ljudi.',
        'Pripremiti se za završni ispit: pitanja iz genetike i ekologije.',
        'Pregledati laboratorijske vežbe iz ćelijske biologije.',
      ];
    
    const curriculumData = [
        'Ćelijska biologija: građa i funkcija ćelije',
        'Genetika: osnovni principi naslednosti',
        'Ekologija: međuzavisnost organizama i okoline',
        'Ljudska anatomija: organi i sistemi',
        'Evolucija i adaptacije u prirodi',
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
  