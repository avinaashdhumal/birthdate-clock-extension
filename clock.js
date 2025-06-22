function speakGreeting() {
  const hour = new Date().getHours();
  let greeting = "Hello";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";
  
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(`${greeting}, welcome back.`);
    utter.volume = 0.7;
    utter.rate = 1;
    speechSynthesis.speak(utter);
  }
}

function updateDisplay() {
  // Load birth date from Chrome storage
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get(['userBirthdate'], function(result) {
      if (chrome.runtime.lastError) {
        console.error('Error loading birthdate:', chrome.runtime.lastError);
        // Fallback to demo date
        calculateAndDisplay('1995-06-15T10:30:00');
        return;
      }
      
      if (result.userBirthdate) {
        console.log('Loaded birthdate from storage:', result.userBirthdate);
        calculateAndDisplay(result.userBirthdate);
      } else {
        console.log('No birthdate found in storage, using demo date');
        // Show message to set birthdate
        showSetBirthdateMessage();
        // Use demo date for display
        calculateAndDisplay('1995-06-15T10:30:00');
      }
    });
  } else {
    console.log('Chrome storage not available, using demo date');
    calculateAndDisplay('1995-06-15T10:30:00');
  }
}

function showSetBirthdateMessage() {
  // Create a subtle notification to set birthdate
  const notification = document.createElement('div');
  notification.id = 'setBirthdateNotification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(100, 210, 255, 0.1);
    border: 1px solid rgba(100, 210, 255, 0.3);
    color: #64d2ff;
    padding: 15px 25px;
    border-radius: 10px;
    font-size: 0.9rem;
    z-index: 1000;
    backdrop-filter: blur(10px);
    cursor: pointer;
    transition: all 0.3s ease;
  `;
  notification.innerHTML = `
    <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
    Click here to set your birth date for accurate calculations
  `;
  
  notification.onclick = function() {
    chrome.runtime.openOptionsPage();
  };
  
  // Add hover effect
  notification.onmouseenter = function() {
    this.style.background = 'rgba(100, 210, 255, 0.2)';
    this.style.transform = 'translateX(-50%) translateY(-2px)';
  };
  
  notification.onmouseleave = function() {
    this.style.background = 'rgba(100, 210, 255, 0.1)';
    this.style.transform = 'translateX(-50%) translateY(0)';
  };
  
  document.body.appendChild(notification);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.style.opacity = '0';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }
  }, 10000);
}

function calculateAndDisplay(birthDatetime) {
  const birth = new Date(birthDatetime);
  const now = new Date();
  
  // Validate birth date
  if (isNaN(birth.getTime())) {
    console.error('Invalid birth date:', birthDatetime);
    return;
  }
  
  if (birth > now) {
    console.error('Birth date is in the future:', birthDatetime);
    return;
  }
  
  const diff = now - birth;
  
  // Calculate time units
  const totalSeconds = Math.floor(diff / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);
  
  // More accurate age calculations
  const years = Math.floor(totalDays / 365.25);
  const remainingDaysAfterYears = totalDays - Math.floor(years * 365.25);
  const months = Math.floor(remainingDaysAfterYears / 30.4375);
  const days = Math.floor(remainingDaysAfterYears % 30.4375);
  const hours = Math.floor(totalHours % 24);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.floor(totalSeconds % 60);

  // Update main counters with animation
  animateCounter('years', years);
  animateCounter('months', months);
  animateCounter('days', days);
  animateCounter('hours', hours);
  
  // Update detail counters
  animateCounter('minutes', minutes);
  animateCounter('seconds', seconds);
  animateCounter('totalDays', totalDays);
  animateCounter('totalHours', totalHours);

  // Update current time
  updateCurrentTime();
}

function animateCounter(elementId, newValue) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const currentValue = parseInt(element.textContent) || 0;
  
  if (currentValue !== newValue) {
    element.style.transform = 'scale(1.1)';
    element.style.transition = 'transform 0.2s ease';
    
    setTimeout(() => {
      if (elementId === 'totalDays' || elementId === 'totalHours') {
        element.textContent = newValue.toLocaleString();
      } else {
        element.textContent = newValue.toString().padStart(2, '0');
      }
      element.style.transform = 'scale(1)';
    }, 100);
  } else {
    if (elementId === 'totalDays' || elementId === 'totalHours') {
      element.textContent = newValue.toLocaleString();
    } else {
      element.textContent = newValue.toString().padStart(2, '0');
    }
  }
}

function updateCurrentTime() {
  const now = new Date();
  const hourStr = now.getHours().toString().padStart(2, '0');
  const minStr = now.getMinutes().toString().padStart(2, '0');
  document.getElementById('mainTime').textContent = `${hourStr}:${minStr}`;
}

function updateMeta() {
  const now = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  const dayText = document.getElementById('dayText');
  if (dayText) {
    dayText.textContent = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
  }
}

function setBackgroundByTime() {
  const hour = new Date().getHours();
  const body = document.getElementById("body");
  
  if (!body) return;
  
  // Time-based background gradients
  if (hour >= 5 && hour < 8) {
    // Early morning - soft sunrise colors
    body.style.background = "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";
  } else if (hour >= 8 && hour < 12) {
    // Morning - bright and energetic
    body.style.background = "linear-gradient(135deg, #16213e 0%, #0f3460 50%, #533483 100%)";
  } else if (hour >= 12 && hour < 17) {
    // Afternoon - warm and productive
    body.style.background = "linear-gradient(135deg, #0f3460 0%,rgb(50, 50, 86) 50%,rgb(25, 22, 99) 100%)";
  } else if (hour >= 17 && hour < 20) {
    // Evening - sunset colors
    body.style.background = "linear-gradient(135deg, #533483 0%, #7b2cbf 50%, #9d4edd 100%)";
  } else if (hour >= 20 && hour < 23) {
    // Night - deep and calm
    body.style.background = "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)";
  } else {
    // Late night/early morning - very dark
    body.style.background = "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)";
  }
}

// Listen for storage changes to update display immediately
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace === 'sync' && changes.userBirthdate) {
      console.log('Birthdate updated in storage, refreshing display');
      
      // Remove the notification if it exists
      const notification = document.getElementById('setBirthdateNotification');
      if (notification) {
        notification.remove();
      }
      
      // Update display with new birthdate
      updateDisplay();
    }
  });
}

// Initialize and set up intervals
function init() {
  console.log('Initializing Birth Clock...');
  
  updateDisplay();
  updateMeta();
  setBackgroundByTime();
  
  // Update every second
  setInterval(() => {
    updateDisplay();
    updateMeta();
  }, 1000);
  
  // Update background every minute (less frequent)
  setInterval(setBackgroundByTime, 60000);
  
  // Speak greeting on load (with delay)
  // setTimeout(speakGreeting, 1000);
}

// Start when page loads
document.addEventListener('DOMContentLoaded', init);

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    // Page became visible, update immediately
    updateDisplay();
    updateMeta();
    setBackgroundByTime();
  }
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Press 'S' to open settings
  if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.openOptionsPage();
    }
  }
  
  // Press 'R' to refresh/reset display
  if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    updateDisplay();
  }
});