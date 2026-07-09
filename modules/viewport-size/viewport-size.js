import { getSize, setSize } from '../viewport/viewport.js';
import { resetToCustom } from '../device-preset/device-preset.js';

export function initViewportSize() {
  const widthInput = document.getElementById('viewportWidth');
  const heightInput = document.getElementById('viewportHeight');

  const { width, height } = getSize();
  widthInput.value = Math.round(width);
  heightInput.value = Math.round(height);

  function apply() {
    const w = parseInt(widthInput.value, 10);
    const h = parseInt(heightInput.value, 10);
    if (w > 0 && h > 0) {
      setSize(w, h);
      resetToCustom();
    }
  }

  widthInput.addEventListener('change', apply);
  heightInput.addEventListener('change', apply);
}
