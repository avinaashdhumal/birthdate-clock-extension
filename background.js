// Background service worker for Birth Clock Extension
console.log('Birth Clock Extension - Background script loaded');

// Initialize extension when Chrome starts
chrome.runtime.onStartup.addListener(() => {
  console.log('Chrome startup detected, loading user birthdate...');
  loadUserBirthdate();
});

// Initialize extension when extension is installed or enabled
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // First time installation
    console.log('First time installation detected');
    showWelcomeNotification();
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('Extension updated to version:', chrome.runtime.getManifest().version);
  }
  
  loadUserBirthdate();
});

// Load user birthdate and set up notifications
function loadUserBirthdate() {
  chrome.storage.sync.get(['userBirthdate', 'formattedDate'], function(result) {
    if (chrome.runtime.lastError) {
      console.error('Error loading user birthdate:', chrome.runtime.lastError);
      return;
    }
    
    if (result.userBirthdate) {
      console.log('User birthdate found:', result.userBirthdate);
      const birthDate = new Date(result.userBirthdate);
      setupBirthdayNotification(birthDate);
      setupMilestoneNotifications(birthDate);
    } else {
      console.log('No user birthdate found');
    }
  });
}

// Show welcome notification for first-time users
function showWelcomeNotification() {
  chrome.notifications.create('welcome', {
    type: 'basic',
    iconUrl: 'icon.png',
    title: 'Welcome to Birth Clock!',
    message: 'Click on the extension icon to set your birth date and start tracking your life time.',
    priority: 1
  });
}

// Set up birthday notification
function setupBirthdayNotification(birthDate) {
  const nextBirthday = getNextBirthdayTimestamp(birthDate);
  
  // Clear existing birthday alarm
  chrome.alarms.clear('birthdayReminder');
  
  // Create new birthday alarm
  chrome.alarms.create('birthdayReminder', { 
    when: nextBirthday 
  });
  
  console.log('Birthday reminder set for:', new Date(nextBirthday));
}

// Set up milestone notifications (every 1000 days, 10000 days, etc.)
function setupMilestoneNotifications(birthDate) {
  const now = new Date();
  const diffTime = now - birthDate;
  const currentDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate next milestone (every 1000 days)
  const nextMilestone = Math.ceil(currentDays / 1000) * 1000;
  const daysUntilMilestone = nextMilestone - currentDays;
  const milestoneDate = new Date(now.getTime() + (daysUntilMilestone * 24 * 60 * 60 * 1000));
  
  // Clear existing milestone alarm
  chrome.alarms.clear('milestoneReminder');
  
  // Set milestone alarm
  chrome.alarms.create('milestoneReminder', {
    when: milestoneDate.getTime()
  });
  
  console.log(`Next milestone (${nextMilestone} days) set for:`, milestoneDate);
}

// Get timestamp for next birthday
function getNextBirthdayTimestamp(birthDate) {
  const today = new Date();
  const thisYear = today.getFullYear();
  
  // Create birthday for this year
  const birthdayThisYear = new Date(thisYear, birthDate.getMonth(), birthDate.getDate(), 
                                   birthDate.getHours(), birthDate.getMinutes());
  
  // If birthday has passed this year, set for next year
  if (birthdayThisYear <= today) {
    birthdayThisYear.setFullYear(thisYear + 1);
  }
  
  return birthdayThisYear.getTime();
}

// Calculate age for birthday notification
function calculateAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age + 1; // Next birthday age
}

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('Alarm triggered:', alarm.name);
  
  if (alarm.name === 'birthdayReminder') {
    handleBirthdayNotification();
  } else if (alarm.name === 'milestoneReminder') {
    handleMilestoneNotification();
  }
});

// Handle birthday notification
function handleBirthdayNotification() {
  chrome.storage.sync.get(['userBirthdate'], function(result) {
    if (result.userBirthdate) {
      const birthDate = new Date(result.userBirthdate);
      const age = calculateAge(birthDate);
      
      chrome.notifications.create('birthday', {
        type: 'basic',
        iconUrl: 'icon.png',
        title: '🎉 Happy Birthday!',
        message: `Congratulations on turning ${age}! Another year of amazing life experiences.`,
        priority: 2
      });
      
      // Set up next year's birthday reminder
      setupBirthdayNotification(birthDate);
    }
  });
}

// Handle milestone notification
function handleMilestoneNotification() {
  chrome.storage.sync.get(['userBirthdate'], function(result) {
    if (result.userBirthdate) {
      const birthDate = new Date(result.userBirthdate);
      const now = new Date();
      const diffTime = now - birthDate;
      const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      chrome.notifications.create('milestone', {
        type: 'basic',
        iconUrl: 'icon.png',
        title: '🎯 Life Milestone Reached!',
        message: `You've been alive for ${totalDays.toLocaleString()} days! That's incredible!`,
        priority: 1
      });
      
      // Set up next milestone
      setupMilestoneNotifications(birthDate);
    }
  });
}

// Handle notification clicks
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log('Notification clicked:', notificationId);
  
  // Open new tab with clock when notification is clicked
  chrome.tabs.create({
    url: chrome.runtime.getURL('clock.html')
  });
  
  // Clear the notification
  chrome.notifications.clear(notificationId);
});

// Listen for storage changes to update alarms
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.userBirthdate) {
    console.log('Birthdate changed, updating notifications...');
    
    if (changes.userBirthdate.newValue) {
      const newBirthDate = new Date(changes.userBirthdate.newValue);
      setupBirthdayNotification(newBirthDate);
      setupMilestoneNotifications(newBirthDate);
    } else {
      // Birthdate was removed, clear alarms
      chrome.alarms.clearAll();
      console.log('Birthdate removed, cleared all alarms');
    }
  }
});

// Handle extension icon click (though this is mainly handled by popup)
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked');
  chrome.runtime.openOptionsPage();
});

// Periodic check for milestones (every hour)
chrome.alarms.create('hourlyCheck', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'hourlyCheck') {
    // Check if any special milestones are approaching
    checkSpecialMilestones();
  }
});

// Check for special milestones (10000 days, 25 years, etc.)
function checkSpecialMilestones() {
  chrome.storage.sync.get(['userBirthdate'], function(result) {
    if (!result.userBirthdate) return;
    
    const birthDate = new Date(result.userBirthdate);
    const now = new Date();
    const diffTime = now - birthDate;
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalHours = Math.floor(diffTime / (1000 * 60 * 60));
    
    // Check for special day milestones
    const specialDays = [5000, 7500, 10000, 12500, 15000, 20000, 25000];
    const specialHours = [100000, 200000, 250000, 500000, 750000, 1000000];
    
    if (specialDays.includes(totalDays)) {
      chrome.notifications.create(`special-${totalDays}`, {
        type: 'basic',
        iconUrl: 'icon.png',
        title: '🌟 Special Milestone!',
        message: `Amazing! You've lived ${totalDays.toLocaleString()} days!`,
        priority: 2
      });
    }
    
    if (specialHours.includes(totalHours)) {
      chrome.notifications.create(`special-hours-${totalHours}`, {
        type: 'basic',
        iconUrl: 'icon.png',
        title: '⏰ Hours Milestone!',
        message: `Incredible! You've lived ${totalHours.toLocaleString()} hours!`,
        priority: 1
      });
    }
  });
}

// Keep service worker alive
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'keepAlive') {
    sendResponse({ status: 'alive' });
  }
  return true;
});

console.log('Birth Clock Extension - Background script initialized');