document.addEventListener("DOMContentLoaded", () => {
    const gradesData = [
        { date: '15. rujna 2023.', grade: 4, note: 'Test iz teorije muzike' },
        { date: '5. studenog 2023.', grade: 5, note: 'Prezentacija o klasičnoj muzici' },
        { date: '20. siječnja 2024.', grade: 4, note: 'Usmeni odgovor o poznatim kompozitorima' },
        { date: '10. ožujka 2024.', grade: 5, note: 'Izvođenje pesme na satu' },
        { date: '17. svibnja 2024.', grade: 5, note: 'Završni test' },
      ];
  
    const notesData = [
        'Ponoviti intervale i akorde iz teorije muzike.',
        'Pripremiti prezentaciju o poznatim kompozitorima.',
        'Vježbati izvođenje pjesama za završni ispit.',
        ];
    
    const curriculumData= [
            'Teorija muzike: intervali, akordi i ritmika',
            'Poznati kompozitori: Beethoven, Mozart, Bach',
            'Klasična muzika: epohe i stilovi',
            'Izvođenje: solo i grupno pjevanje',
            'Analiza pjesama i melodija',
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
  