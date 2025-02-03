// Definicija važnih datuma
const events = {
    '2023-09-04': { type: 'event', name: 'Početak nastave' },
    '2023-10-30': { type: 'holiday', name: 'Jesenski odmor počinje' },
    '2023-11-01': { type: 'holiday', name: 'Dan svih svetih' },
    '2023-11-02': { type: 'event', name: 'Nastavak nastave' },
    '2023-12-22': { type: 'event', name: 'Kraj 1. polugodišta' },
    '2023-12-25': { type: 'holiday', name: 'Božić' },
    '2023-12-26': { type: 'holiday', name: 'Sveti Stjepan' },
    '2023-12-27': { type: 'holiday', name: 'Početak zimskog odmora' },
    '2024-01-01': { type: 'holiday', name: 'Nova godina' },
    '2024-01-06': { type: 'holiday', name: 'Sveta tri kralja' },
    '2024-01-08': { type: 'event', name: 'Početak 2. polugodišta' },
    '2024-02-19': { type: 'holiday', name: 'Drugi dio zimskog odmora počinje' },
    '2024-02-26': { type: 'event', name: 'Nastavak nastave' },
    '2024-03-28': { type: 'holiday', name: 'Proljetni odmor počinje' },
    '2024-04-01': { type: 'holiday', name: 'Uskrsni ponedjeljak' },
    '2024-04-08': { type: 'event', name: 'Nastavak nastave' },
    '2024-05-01': { type: 'holiday', name: 'Praznik rada' },
    '2024-06-20': { type: 'holiday', name: 'Tijelovo' },
    '2024-06-21': { type: 'event', name: 'Kraj nastave' },
  };
  
function generateCalendar(startYear, endYear) {
    const calendarContainer = document.getElementById('calendar');
  
    // Provjera postoji li element
    if (!calendarContainer) {
      console.error('Element with ID "calendar" not found.');
      return;
    }
  
    const monthNames = [
      'Siječanj', 'Veljača', 'Ožujak', 'Travanj', 'Svibanj', 'Lipanj',
      'Srpanj', 'Kolovoz', 'Rujan', 'Listopad', 'Studeni', 'Prosinac'
    ];
    const dayNames = ['P', 'U', 'S', 'Č', 'P', 'S', 'N'];
  
    // Mjeseci koje treba prikazati
    const monthsToShow = [
      { year: startYear, months: [8, 9, 10, 11] }, // Rujan - Prosinac 2023.
      { year: endYear, months: [0, 1, 2, 3, 4, 5] } // Siječanj - Lipanj 2024.
    ];
  
    monthsToShow.forEach(({ year, months }) => {
      months.forEach(month => {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'month';
  
        const monthHeader = document.createElement('div');
        monthHeader.className = 'month-header';
        monthHeader.textContent = `${monthNames[month]} ${year}`;
        monthDiv.appendChild(monthHeader);
  
        const daysDiv = document.createElement('div');
        daysDiv.className = 'days';
  
        // Dodavanje naziva dana u tjednu
        dayNames.forEach(day => {
          const dayDiv = document.createElement('div');
          dayDiv.className = 'day';
          dayDiv.textContent = day;
          daysDiv.appendChild(dayDiv);
        });
  
        // Prvi dan u mjesecu
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
  
        // Dodavanje praznih ćelija za dane prije prvog dana u mjesecu
        for (let i = 0; i < firstDay; i++) {
          const emptyCell = document.createElement('div');
          emptyCell.className = 'day empty';
          daysDiv.appendChild(emptyCell);
        }
  
        // Popunjavanje dana u mjesecu
        for (let day = 1; day <= daysInMonth; day++) {
          const dayCell = document.createElement('div');
          dayCell.className = 'day';
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
          if (events[dateKey]) {
            dayCell.classList.add(events[dateKey].type);
            dayCell.title = events[dateKey].name;
          }
  
          dayCell.textContent = day;
          daysDiv.appendChild(dayCell);
        }
  
        monthDiv.appendChild(daysDiv);
        calendarContainer.appendChild(monthDiv); // Dodavanje mjeseca u glavni kontejner
      });
    });
  }
  
  // Generiranje kalendara za školsku godinu 2023./2024.
  generateCalendar(2023, 2024);
  