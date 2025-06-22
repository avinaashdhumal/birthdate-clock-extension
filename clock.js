function speakGreeting() {
    const hour = new Date().getHours();
    let greeting = "Hello";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";
    else greeting = "Good evening";
    const utter = new SpeechSynthesisUtterance(`${greeting}, welcome back.`);
    utter.volume = 0.7;
    utter.rate = 1;
    speechSynthesis.speak(utter);
  }
  
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
  
      const yearsLine = `${years}y ${months % 12}m ${days % 30}d`;
      const timeLine = `${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
      document.getElementById('yearsLine').innerText = yearsLine;
      document.getElementById('timeLine').innerText = timeLine;
  
      const hourStr = now.getHours().toString().padStart(2, '0');
      const minStr = now.getMinutes().toString().padStart(2, '0');
      document.getElementById('mainTime').innerText = `${hourStr}:${minStr}`;
    });
  }
  
  function updateMeta() {
    const now = new Date();
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    document.getElementById('dayText').innerText = `${days[now.getDay()]} ${now.getDate()}`;
    document.getElementById('tempText').innerText = '28°';
  }
  
  function setBackgroundByTime() {
    const hour = new Date().getHours();
    const body = document.getElementById("body");
    if (hour < 6) body.style.background = "#0b0c10";
    else if (hour < 12) body.style.background = "#111927";
    else if (hour < 18) body.style.background = "#212f45";
    else body.style.background = "#0f172a";
  }
  
  setInterval(() => {
    updateDisplay();
    updateMeta();
    setBackgroundByTime();
  }, 1000);
  
  updateDisplay();
  updateMeta();
  setBackgroundByTime();
  speakGreeting();
  