document.addEventListener('DOMContentLoaded', () => {
    // Podaci o izostancima
    const absences = [
        { date: '2023-09-12', type: 'Opravdani', note: 'Prehlada' },
        { date: '2023-10-05', type: 'Neopravdani', note: 'Kašnjenje' },
        { date: '2023-11-10', type: 'Opravdani', note: 'Pregled kod doktora' },
        { date: '2024-01-20', type: 'Neopravdani', note: 'Bez opravdanja' },
        { date: '2024-03-15', type: 'Opravdani', note: 'Sportsko natjecanje' },
    ];
  
    const absenceTypes = ['Opravdani', 'Neopravdani'];
  
    const absenceLimit = 5; // Granica za upozorenje
  
    // Elementi DOM-a
    const absenceTable = document.getElementById('absence-table');
    const absenceTypesList = document.getElementById('absence-types-list');
    const warningText = document.getElementById('warning-text');
    const filterButton = document.getElementById('filterButton');
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
  
    // Funkcija za prikaz tablice izostanaka
    const renderAbsences = (data) => {
      absenceTable.innerHTML = '';
      data.forEach(absence => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${absence.date}</td>
          <td>${absence.type}</td>
          <td>${absence.note}</td>
        `;
        absenceTable.appendChild(row);
      });
    };
  
    // Funkcija za prikaz vrsta izostanaka
    const renderAbsenceTypes = () => {
      absenceTypesList.innerHTML = '';
      absenceTypes.forEach(type => {
        const li = document.createElement('li');
        li.textContent = type;
        absenceTypesList.appendChild(li);
      });
    };
  
    // Funkcija za upozorenje
    const checkWarning = () => {
      const totalAbsences = absences.length;
      if (totalAbsences > absenceLimit) {
        warningText.textContent = `Pažnja! Ukupno ${totalAbsences} izostanaka. Premašili ste granicu od ${absenceLimit}.`;
        warningText.style.color = 'red';
      } else {
        warningText.textContent = 'Broj izostanaka je u granici normale.';
        warningText.style.color = 'black';
      }
    };
  
    // Funkcija za filtriranje po vremenskom periodu
    const filterAbsences = () => {
      const fromDate = new Date(fromDateInput.value);
      const toDate = new Date(toDateInput.value);
      const filteredAbsences = absences.filter(absence => {
        const absenceDate = new Date(absence.date);
        return absenceDate >= fromDate && absenceDate <= toDate;
      });
      renderAbsences(filteredAbsences);
    };
  
    // Funkcija za crtanje grafa
    const renderChart = () => {
      const ctx = document.getElementById('absenceChart').getContext('2d');
      const counts = absenceTypes.map(type =>
        absences.filter(absence => absence.type === type).length
      );
  
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: absenceTypes,
          datasets: [{
            label: 'Broj izostanaka',
            data: counts,
            backgroundColor: ['#4CAF50', '#FF5733'],
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
          }
        }
      });
    };
  
    // Inicijalizacija
    renderAbsences(absences);
    renderAbsenceTypes();
    checkWarning();
    renderChart();
  
    // Event listener za filter
    filterButton.addEventListener('click', filterAbsences);
  });
  