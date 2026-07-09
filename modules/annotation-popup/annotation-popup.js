let popupEl = null;
let hideTimeout = null;

function initPopup() {
  if (!popupEl) {
    popupEl = document.getElementById('annotationPopup');
    if (popupEl) {
      popupEl.addEventListener('mouseenter', () => {
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
      });
      popupEl.addEventListener('mouseleave', () => {
        popupEl.style.display = 'none';
      });
    }
  }
}

function showPopup(data) {
  initPopup();
  if (!popupEl) return;
  
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  
  popupEl.innerHTML = `
    <div class="annotation-popup-author">${data.author}</div>
    <div class="annotation-popup-time">${data.time}</div>
    <div class="annotation-popup-content">${data.content}</div>
  `;
  
  popupEl.style.display = 'block';
  popupEl.style.top = data.top + 'px';
  popupEl.style.left = data.left + 'px';
  
  if (data.left + 240 > window.innerWidth) {
    popupEl.style.left = (data.left - 248) + 'px';
  }
  
  if (parseFloat(popupEl.style.top) + 150 > window.innerHeight) {
    popupEl.style.top = (data.top - 158) + 'px';
  }
}

function hidePopup() {
  initPopup();
  if (!popupEl) return;
  
  hideTimeout = setTimeout(() => {
    if (popupEl && !popupEl.matches(':hover')) {
      popupEl.style.display = 'none';
    }
  }, 150);
}

window.addEventListener('message', (e) => {
  if (e.data.type === 'showAnnotationPopup') {
    showPopup(e.data.payload);
  } else if (e.data.type === 'hideAnnotationPopup') {
    hidePopup();
  }
});

export { showPopup, hidePopup };