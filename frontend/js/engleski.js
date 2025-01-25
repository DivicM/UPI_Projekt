document.addEventListener("DOMContentLoaded", () => {
    const gradesData = [
        { date: '12.. rujna 2023.', grade: 4, note: 'Esej na temu "My favoritw Place' },
        { date: '9. listopada 2023.', grade: 5, note: 'Test iz gramatike' },
        { date: '7. studenog 2023.', grade: 3, note : 'Usmeni odgovor o knjizi "Animal Farm'},
        { date: '20. siječnja 2024.', grade: 4, note: 'Prezentacija na engleskom' },
        { date: '17. ožujak 2024.,', grade: 5, note: 'Usmeni odgovor' },
        { date: '25. svibnja 2024.', grade: 5, note: 'Završni test' },
    ];
  
    const notesData = [
        'Ponoviti pravila za pasiv i kondicionalne rečenice.',
        'Vežbati pisanje eseja - fokus na uvodu i zaključku.',
        'Pročitati zadatke iz udžbenika: vežbe za vokabular.',
      ];
    
    const curriculumData = [
        'Gramatika: pasiv, kondicionali, frazalni glagoli',
        'Eseji: struktura i pisanje kreativnih tekstova',
        'Knjige: "Animal Farm" i "The Great Gatsby"',
        'Konverzacija: debate na engleskom jeziku',
        'Pisanje formalnih pisama i izveštaja',
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
  