import { frame } from '../shared/state.js';

const pageTitle = document.getElementById('pageTitle');

export function updatePageTitle() {
  try {
    const doc = frame.contentDocument;
    pageTitle.textContent = (doc && doc.title) || 'PageScope';
  } catch (e) {
    pageTitle.textContent = 'PageScope';
  }
}
