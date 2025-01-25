document.addEventListener("DOMContentLoaded", () => {
    const gradesData = [
        { date: '25. rujna 2023.', grade: 5, note: 'Test iz mehanike' },
        { date: '11. listopada 2023.', grade: 4, note: 'Laboratorijska vežba iz optike' },
        { date: '30. siječna 2024.', grade: 3, note: 'Usmeni odgovor o zakonima termodinamike' },
        { date: '12. ožujka 2024.', grade: 5, note: 'Eksperiment sa elektromagnetnim poljem' },
        { date: '28. svibnja 2024.', grade: 4, note: 'Završni test' },
    ];
  
    const notesData = [
        'Ponoviti zakone kretanja i zakon gravitacije.',
        'Pregledati zadatke iz laboratorijskih vežbi.',
        'Pripremiti pitanja iz termodinamike za završni ispit.',
    ];

    const curriculumData = [
        'Mehanika: zakoni kretanja i gravitacije',
        'Optika: refleksija, refrakcija i svojstva svetlosti',
        'Termodinamika: zakoni termodinamike i primena',
        'Elektromagnetizam: elektromagnetna polja i indukcija',
        'Astronomija: osnovni pojmovi o svemiru i galaksijama',
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
  