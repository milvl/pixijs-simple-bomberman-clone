function showScreen(screenId) {
  const screens = ['menu', 'game', 'controlHints', 'specialThanks'];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (id === screenId) ? 'block' : 'none';
  });
}

function startGame() {
  showScreen('game');
}

function showHowToPlay() {
  showScreen('controlHints');
}

function showCredits() {
  showScreen('specialThanks');
}

function goBack() {
  showScreen('menu');
}
