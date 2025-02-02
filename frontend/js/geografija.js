document.addEventListener("DOMContentLoaded", () => {
  const gradesData = [
    { date: '15. rujna 2023.', grade: 5, note: 'Test iz Evrope' },
    { date: '3. studenog 2023.', grade: 4, note: 'Rad na projektu: Klimatske promene' },
    { date: '18. siječnja 2024.', grade: 5, note: 'Usmeni odgovor o Aziji' },
    { date: '11. ožujka 2024.', grade: 4, note: 'Test iz geografskih pojmova' },
    { date: '30. svibnja 2024.', grade: 5, note: 'Završni test' },
  ];

  const notesData = [
    'Ponoviti glavne gradove Evrope i Azije.',
    'Pregledati klimatske zone i njihova obeležja.',
    'Razraditi zadatke iz atlasa za geografsku orijentaciju.',
  ];

  const curriculumData = [
    'Kontinenti: Evropa, Azija, Afrika, Amerika, Australija i Antarktik',
    'Klimatske zone: tropska, umerena i polarna',
    'Geografski pojmovi: meridijani, paralele, geografska dužina i širina',
    'Stanovništvo i privreda: distribucija stanovništva i ekonomske aktivnosti',
    'Ekosistemi: odnosi između ljudi i prirode',
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
