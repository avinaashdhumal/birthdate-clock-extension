// Birth Clock Extension - Options Page
document.addEventListener('DOMContentLoaded', function() {
  initializeOptionsPage();
});

const saveButton = document.getElementById('save');
const resetButton = document.getElementById('resetButton');
const birthDatetime = document.getElementById('birthDatetime');
const successMessage = document.getElementById('successMessage');

// Initialize options page
function initializeOptionsPage() {
  loadBirthdateFromStorage();
  setupEventListeners();
}

// Load existing data when page loads
function loadBirthdateFromStorage() {
  chrome.storage.sync.get(['userBirthdate'], function(result) {
      if (chrome.runtime.lastError) {
          console.error('Error loading from storage:', chrome.runtime.lastError);
          return;
      }
      
      if (result.userBirthdate) {
          birthDatetime.value = result.userBirthdate;
          birthDatetime.style.borderColor = '#48bb78';
          console.log('Loaded birthdate:', result.userBirthdate);
      }
  });
}

// Save birthdate to Chrome storage
function saveBirthdateToStorage(datetime) {
  const birthdateData = {
      userBirthdate: datetime,
      savedAt: new Date().toISOString(),
      formattedDate: formatBirthdate(datetime)
  };

  chrome.storage.sync.set(birthdateData, function() {
      if (chrome.runtime.lastError) {
          console.error('Error saving to storage:', chrome.runtime.lastError);
          showErrorMessage('Failed to save. Please try again.');
      } else {
          console.log('Birthdate saved successfully:', birthdateData);
      }
  });
}

// Format birthdate for display and calculations
function formatBirthdate(datetime) {
  const date = new Date(datetime);
  const now = new Date();
  
  return {
      full: date.toLocaleString(),
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      age: calculateAge(date),
      ageInDays: calculateAgeInDays(date),
      ageInHours: calculateAgeInHours(date),
      ageInMinutes: calculateAgeInMinutes(date),
      ageInSeconds: calculateAgeInSeconds(date),
      zodiacSign: getZodiacSign(date),
      nextBirthday: getNextBirthday(date),
      daysUntilBirthday: getDaysUntilBirthday(date)
  };
}

// Calculate age in years
function calculateAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  return age;
}

// Calculate age in days
function calculateAgeInDays(birthDate) {
  const today = new Date();
  const diffTime = Math.abs(today - birthDate);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate age in hours
function calculateAgeInHours(birthDate) {
  const today = new Date();
  const diffTime = Math.abs(today - birthDate);
  return Math.floor(diffTime / (1000 * 60 * 60));
}

// Calculate age in minutes
function calculateAgeInMinutes(birthDate) {
  const today = new Date();
  const diffTime = Math.abs(today - birthDate);
  return Math.floor(diffTime / (1000 * 60));
}

// Calculate age in seconds
function calculateAgeInSeconds(birthDate) {
  const today = new Date();
  const diffTime = Math.abs(today - birthDate);
  return Math.floor(diffTime / 1000);
}

// Get zodiac sign
function getZodiacSign(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const signs = [
      {sign: 'Capricorn', start: [12, 22], end: [1, 19]},
      {sign: 'Aquarius', start: [1, 20], end: [2, 18]},
      {sign: 'Pisces', start: [2, 19], end: [3, 20]},
      {sign: 'Aries', start: [3, 21], end: [4, 19]},
      {sign: 'Taurus', start: [4, 20], end: [5, 20]},
      {sign: 'Gemini', start: [5, 21], end: [6, 20]},
      {sign: 'Cancer', start: [6, 21], end: [7, 22]},
      {sign: 'Leo', start: [7, 23], end: [8, 22]},
      {sign: 'Virgo', start: [8, 23], end: [9, 22]},
      {sign: 'Libra', start: [9, 23], end: [10, 22]},
      {sign: 'Scorpio', start: [10, 23], end: [11, 21]},
      {sign: 'Sagittarius', start: [11, 22], end: [12, 21]}
  ];

  for (let i = 0; i < signs.length; i++) {
      const sign = signs[i];
      if ((month === sign.start[0] && day >= sign.start[1]) || 
          (month === sign.end[0] && day <= sign.end[1])) {
          return sign.sign;
      }
  }
  return 'Unknown';
}

// Get next birthday
function getNextBirthday(birthDate) {
  const today = new Date();
  const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  
  if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  return nextBirthday.toLocaleDateString();
}

// Get days until birthday
function getDaysUntilBirthday(birthDate) {
  const today = new Date();
  const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  
  if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  const diffTime = nextBirthday - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Show error message
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
  errorDiv.style.display = 'flex';
  document.querySelector('.settings-container').appendChild(errorDiv);
  
  setTimeout(() => {
      errorDiv.remove();
  }, 3000);
}

// Setup event listeners
function setupEventListeners() {
  // Save button click
  saveButton.addEventListener('click', function() {
      if (!birthDatetime.value) {
          // Shake animation for empty input
          birthDatetime.style.animation = 'shake 0.5s ease-in-out';
          birthDatetime.focus();
          setTimeout(() => {
              birthDatetime.style.animation = '';
          }, 500);
          return;
      }

      // Validate date is not in future
      const selectedDate = new Date(birthDatetime.value);
      const now = new Date();
      
      if (selectedDate > now) {
          birthDatetime.style.animation = 'shake 0.5s ease-in-out';
          showErrorMessage('Birthdate cannot be in the future!');
          setTimeout(() => {
              birthDatetime.style.animation = '';
          }, 500);
          return;
      }

      // Loading state
      saveButton.classList.add('loading');
      saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

      // Save to Chrome storage
      setTimeout(() => {
          saveBirthdateToStorage(birthDatetime.value);
          
          saveButton.classList.remove('loading');
          saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
          successMessage.style.display = 'flex';

          // Reset button after 2 seconds
          setTimeout(() => {
              saveButton.innerHTML = '<i class="fas fa-save"></i> Save Settings';
              successMessage.style.display = 'none';
          }, 2000);
      }, 1000);
  });

  // Reset button click
  resetButton.addEventListener('click', function() {
      if (confirm('Are you sure you want to reset your birthdate? This action cannot be undone.')) {
          resetBirthdate();
      }
  });

  // Input validation styling
  birthDatetime.addEventListener('input', function() {
      if (this.value) {
          this.style.borderColor = '#48bb78';
      } else {
          this.style.borderColor = '#e2e8f0';
      }
  });

  // Keyboard shortcut for reset (Ctrl+R)
  document.addEventListener('keydown', function(e) {
      if (e.ctrlKey && e.key === 'r') {
          e.preventDefault();
          if (confirm('Are you sure you want to reset your birthdate?')) {
              resetBirthdate();
          }
      }
  });
}

// Reset birthdate data
function resetBirthdate() {
  chrome.storage.sync.remove(['userBirthdate', 'savedAt', 'formattedDate'], function() {
      if (chrome.runtime.lastError) {
          console.error('Error clearing storage:', chrome.runtime.lastError);
          showErrorMessage('Failed to reset data. Please try again.');
      } else {
          birthDatetime.value = '';
          birthDatetime.style.borderColor = '#e2e8f0';
          
          // Show success message
          const successDiv = document.createElement('div');
          successDiv.className = 'success-message';
          successDiv.innerHTML = '<i class="fas fa-check-circle"></i> Data reset successfully!';
          successDiv.style.display = 'flex';
          document.querySelector('.settings-container').appendChild(successDiv);
          
          setTimeout(() => {
              successDiv.remove();
          }, 2000);
          
          console.log('Birthdate data cleared');
      }
  });
}