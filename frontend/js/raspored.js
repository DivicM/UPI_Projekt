document.addEventListener('DOMContentLoaded', () => {
    const schedule = [];
    const scheduleTable = document.getElementById('schedule-table');
    const warningText = document.getElementById('warning-text');
    const form = document.getElementById('add-schedule-form');
  
    // Funkcija za prikaz rasporeda
    const renderSchedule = () => {
      scheduleTable.innerHTML = '';
      schedule.forEach((entry) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${entry.day}</td>
          <td>${entry.subject}</td>
          <td>${entry.startTime}</td>
          <td>${entry.endTime}</td>
        `;
        scheduleTable.appendChild(row);
      });
    };
  
    // Funkcija za proveru preklapanja
    const checkOverlap = () => {
      for (let i = 0; i < schedule.length; i++) {
        for (let j = i + 1; j < schedule.length; j++) {
          if (
            schedule[i].day === schedule[j].day &&
            schedule[i].startTime < schedule[j].endTime &&
            schedule[i].endTime > schedule[j].startTime
          ) {
            warningText.textContent = `Upozorenje: Preklapanje termina između "${schedule[i].subject}" i "${schedule[j].subject}" na dan ${schedule[i].day}.`;
            warningText.style.color = 'red';
            return;
          }
        }
      }
      warningText.textContent = 'Nema preklapanja termina.';
      warningText.style.color = 'black';
    };
  
    // Dodavanje novog termina
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const day = document.getElementById('day').value;
      const subject = document.getElementById('subject').value;
      const startTime = document.getElementById('startTime').value;
      const endTime = document.getElementById('endTime').value;
  
      if (startTime >= endTime) {
        alert('Greška: Vrijeme početka mora biti prije vremena kraja.');
        return;
      }
  
      schedule.push({ day, subject, startTime, endTime });
      renderSchedule();
      checkOverlap();
      form.reset();
    });
  });
  