function updateDisplay() {
    chrome.storage.sync.get('birthDatetime', ({ birthDatetime }) => {
      if (!birthDatetime) return;
      const birth = new Date(birthDatetime);
      const now = new Date();
      const diff = now - birth;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30.4375);
      const years = Math.floor(months / 12);
  
      const display = `${years}y ${months % 12}m ${days % 30}d\n${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
      document.getElementById('timeDisplay').innerText = display;
    });
  }
  setInterval(updateDisplay, 1000);
  updateDisplay();