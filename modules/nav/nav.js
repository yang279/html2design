import { frame } from '../shared/state.js';

function loadPage() {
  const url = document.getElementById('urlInput').value.trim();
  if (!url) return;
  frame.src = url;
}

function loadQuick(url) {
  document.getElementById('urlInput').value = url;
  loadPage();
}

export function initNav() {
  document.getElementById('loadBtn').addEventListener('click', loadPage);
  document.querySelectorAll('.nav-links [data-url]').forEach(link => {
    link.addEventListener('click', () => loadQuick(link.dataset.url));
  });
}
