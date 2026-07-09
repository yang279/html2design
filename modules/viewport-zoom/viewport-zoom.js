import { setZoom } from '../viewport/viewport.js';

export function initViewportZoom() {
  const select = document.getElementById('zoomSelect');
  select.addEventListener('change', () => {
    setZoom(parseFloat(select.value));
  });
}
