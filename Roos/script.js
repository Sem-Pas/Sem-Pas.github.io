const DAYS_OF_WEEK = ['', 'MA', 'DI', 'WO', 'DO', 'VR', 'ZA', 'ZO'];
const TIME_SLOTS = [
  '',
  'Ochtend',
  'Middag',
  'Avond',
  'Laat',
  'Lang',
  'Borstelen',
];
const scheduleOverviewContainer = document.querySelector(
  '.schedule-overview-container'
);

let selectedProfile = '';
let currentWeekStart;
const welcomeText = document.getElementById('welcome-text');
const currentDate = document.getElementById('current-date');
const loginContainer = document.querySelector('.login-container');
const scheduleContainer = document.querySelector('.schedule-container');

// Toegevoegd: Haal opgeslagen gegevens op als ze bestaan
const storedData = JSON.parse(localStorage.getItem('scheduleData')) || {};

function selectProfile(profile) {
  selectedProfile = profile;
  welcomeText.innerText = `Welkom ${selectedProfile}`;
  showSchedule();
  updateHeaderStyle();
}

function goToMainPage() {
  loginContainer.style.display = 'block';
  scheduleContainer.style.display = 'none';
  selectedProfile = ''; // Reset geselecteerd profiel
  welcomeText.innerText = 'Kies je profiel';
  updateHeaderStyle();
}

function showSchedule() {
  loginContainer.style.display = 'none';
  scheduleContainer.style.display = 'flex';
  currentWeekStart = new Date();
  currentWeekStart.setHours(0, 0, 0, 0);
  const dayOfWeek = currentWeekStart.getDay();
  currentWeekStart.setDate(currentWeekStart.getDate() - dayOfWeek);
  updateWeekInfo();
  updateDate();
  updateSchedule();
}

function handleScheduleCellClick(event) {
  const cell = event.target;
  const day = cell.getAttribute('data-day');
  const timeSlot = cell.getAttribute('data-time');

  const weekKey = getWeekNumber(currentWeekStart);
  storedData[weekKey] = storedData[weekKey] || {};
  const cellKey = `${day}-${timeSlot}`;

  if (storedData[weekKey][cellKey] === selectedProfile) {
    // Als de cel al is ingevuld met de huidige gebruiker, verwijder de naam
    delete storedData[weekKey][cellKey];
  } else {
    // Anders, vul de cel met de geselecteerde gebruiker
    storedData[weekKey][cellKey] = selectedProfile;
  }

  localStorage.setItem('scheduleData', JSON.stringify(storedData));

  updateSchedule();
}

function updateSchedule() {
  const scheduleGrid = document.getElementById('schedule-grid');
  scheduleGrid.innerHTML = ''; // Leeg het huidige schema
  createScheduleGrid(); // Creeër een nieuw schema voor de huidige week
  fillScheduledCells();
  markCurrentDay();
}

function fillScheduledCells() {
  const scheduleGrid = document.getElementById('schedule-grid');
  const weekKey = getWeekNumber(currentWeekStart);
  const weekData = storedData[weekKey] || {};

  Object.keys(weekData).forEach((cellKey) => {
    const [day, timeSlot] = cellKey.split('-');
    const cell = document.querySelector(
      `.schedule-cell[data-day="${day}"][data-time="${timeSlot}"]`
    );

    if (cell) {
      cell.innerText = weekData[cellKey];
      cell.classList.add('scheduled-cell');
    }
  });
}

function markCurrentDay() {
  const today = new Date().toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const dayCells = document.querySelectorAll('.schedule-cell[data-day]');
  dayCells.forEach((cell) => {
    const cellDate = new Date(currentWeekStart);
    cellDate.setDate(
      cellDate.getDate() + parseInt(cell.getAttribute('data-day'))
    );

    if (
      cellDate.toLocaleDateString('nl-NL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) === today
    ) {
      cell.classList.add('current-day');
    }
  });
}

function createScheduleGrid() {
  const scheduleGrid = document.getElementById('schedule-grid');
  for (let i = 0; i < TIME_SLOTS.length; i++) {
    for (let j = 0; j < DAYS_OF_WEEK.length; j++) {
      const cell = document.createElement('div');
      cell.classList.add('schedule-cell');
      cell.setAttribute('data-day', j);
      cell.setAttribute('data-time', i);

      if (i === 0 && j > 0) {
        const daySpan = document.createElement('span');
        daySpan.innerText = DAYS_OF_WEEK[j];
        cell.appendChild(daySpan);
      } else if (j === 0 && i > 0) {
        const timeSlotSpan = document.createElement('span');
        timeSlotSpan.innerText = TIME_SLOTS[i];
        cell.appendChild(timeSlotSpan);
      } else if (i > 0 && j > 0) {
        cell.onclick = handleScheduleCellClick;
      }

      scheduleGrid.appendChild(cell);
    }
  }
}

function updateDate() {
  const today = new Date();
  const options = { weekday: 'short', day: '2-digit', month: '2-digit' };
  currentDate.innerText = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  )
    .toLocaleDateString('nl-NL', options)
    .replace('.', '/')
    .replace(/(\d+)\/(\d+)\/(\d+)/, (_, day, month, year) => {
      return `${day}/${month}/${year}`;
    });
}

function updateWeekInfo() {
  const weekInfo = document.getElementById('week-info');
  const startDate = new Date(currentWeekStart);
  startDate.setDate(startDate.getDate() + 1); // Verplaats naar de volgende dag

  const endDate = new Date(
    startDate.getTime() + 6 * 24 * 60 * 60 * 1000
  ).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' });

  const weekNumber = getWeekNumber(startDate); // Update hier

  weekInfo.innerText = `Week ${weekNumber} (${startDate.toLocaleDateString(
    'nl-NL',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
  )} - ${endDate})`;
}

function getWeekNumber(date) {
  // Zorg ervoor dat de datum een geldige datum is
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }

  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000)) + 1;
  const weekNumber = Math.ceil(days / 7);
  return weekNumber;
}

function prevWeek() {
  currentWeekStart = new Date(
    currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000
  );
  updateWeekInfo();
  updateDate();
  updateSchedule();
}

function nextWeek() {
  currentWeekStart = new Date(
    currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000
  );
  updateWeekInfo();
  updateDate();
  updateSchedule();
}

function goToToday() {
  currentWeekStart = new Date();
  currentWeekStart.setHours(0, 0, 0, 0);
  const dayOfWeek = currentWeekStart.getDay();
  currentWeekStart.setDate(currentWeekStart.getDate() - dayOfWeek);
  updateWeekInfo();
  updateDate();
  updateSchedule();
}

// Initialiseer het schema bij het laden van de pagina
updateSchedule();
