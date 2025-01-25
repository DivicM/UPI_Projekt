document.addEventListener("DOMContentLoaded", () => {
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
  });
  