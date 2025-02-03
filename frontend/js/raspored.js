// Predmeti sa profesorima i ikonama
const subjects = [
    { name: 'Matematika'},
    { name: 'Hrvatski jezik'},
    { name: 'Engleski jezik'},
    { name: 'Informatika'},
    { name: 'Biologija'},
    { name: 'Kemija'},
    { name: 'Fizika'},
    { name: 'Povijest'},
    { name: 'Geografija'},
    { name: 'Tehnička kultura'},
    { name: 'Njemački jezik'},
    { name: 'Vjeronauk'},
    { name: 'TZK'},
    { name: 'Likovna kultura'},
    { name: 'Glazbena kultura'},
  ];
  
  // Satnica
  const times = [
    '08:00 - 08:45',
    '08:50 - 09:35',
    '09:40 - 10:25',
    '10:45 - 11:30',
    '11:35 - 12:20',
    '12:25 - 13:10',
  ];
  
  // Generisanje rasporeda za svaki dan
  const schedule = {
    Ponedjeljak: ['Matematika', 'Hrvatski jezik', 'Engleski jezik', 'Biologija', 'TZK', 'Kemija'],
    Utorak: ['Fizika', 'Tehnička kultura', 'Geografija', 'Hrvatski jezik', 'Informatika', 'Likovna kultura'],
    Srijeda: ['Matematika', 'Povijest', 'Engleski jezik', 'Kemija', 'Biologija', 'Vjeronauk'],
    Četvrtak: ['Geografija', 'Fizika', 'Informatika', 'Hrvatski jezik', 'Glazbena kultura', 'TZK'],
    Petak: ['Matematika', 'Engleski jezik', 'Biologija', 'Kemija', 'Tehnička kultura', 'Povijest'],
  };
  
  // Funkcija za kreiranje reda u tabeli
  const createRow = (time, days) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${time}</td>` + days.map(day => {
      const subject = subjects.find(s => s.name === day);
      return `
        <td>
          <div class="subject">
            <span>${day}</span>
          </div>
        </td>
      `;
    }).join('');
    return row;
  };
  
  // Generisanje tabele
  document.addEventListener('DOMContentLoaded', () => {
    const scheduleTable = document.getElementById('schedule-table');
  
    // Kreiranje redova u tabeli
    times.forEach((time, index) => {
      const days = Object.keys(schedule).map(day => schedule[day][index]);
      const row = createRow(time, days);
      scheduleTable.appendChild(row);
    });
  });
  