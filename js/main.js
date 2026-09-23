// Status bar memakai waktu gameplay sebagai sumber kebenaran tunggal.
let gameDate = new Date(2026, 7, 1, 6, 0, 0);

const monthNamesIndo = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

function updateGameStatusTime(day, hour, minute, second) {
  gameDate = new Date(2026, 7, 1, hour, minute, second);
  gameDate.setDate(gameDate.getDate() + day - 1);

  const dateNumber = String(gameDate.getDate()).padStart(2, '0');
  const month = monthNamesIndo[gameDate.getMonth()];
  const year = gameDate.getFullYear();
  const hours = String(gameDate.getHours()).padStart(2, '0');
  const minutes = String(gameDate.getMinutes()).padStart(2, '0');
  const seconds = String(gameDate.getSeconds()).padStart(2, '0');

  const dateElement = document.getElementById('game-date-display');
  const timeElement = document.getElementById('game-time-display');
  if (dateElement) dateElement.innerText = `${dateNumber} ${month} ${year}`;
  if (timeElement) timeElement.innerText = `${hours}:${minutes}:${seconds}`;
}

function advanceGameTime(secondsToAdd = 1) {
  gameDate.setSeconds(gameDate.getSeconds() + secondsToAdd);
  updateGameStatusTime(
    1,
    gameDate.getHours(),
    gameDate.getMinutes(),
    gameDate.getSeconds()
  );
}

updateGameStatusTime(1, 6, 0, 0);
