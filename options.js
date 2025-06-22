document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.sync.get('birthDatetime', ({ birthDatetime }) => {
      if (birthDatetime) document.getElementById('birthDatetime').value = birthDatetime;
    });
    document.getElementById('save').addEventListener('click', () => {
      const val = document.getElementById('birthDatetime').value;
      chrome.storage.sync.set({ birthDatetime: val }, () => alert('Saved!'));
    });
  });
  