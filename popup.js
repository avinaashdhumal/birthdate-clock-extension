document.getElementById('openClock').onclick = () => {
    window.open('clock.html', '_blank');
  };
  document.getElementById('openSettings').onclick = () => {
    chrome.runtime.openOptionsPage();
  };
  