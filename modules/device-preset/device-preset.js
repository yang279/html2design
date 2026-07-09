import { getSize, setSize, initViewport } from '../viewport/viewport.js';

export function resetToCustom() {
  document.getElementById('devicePreset').value = 'responsive';
}

export function initDevicePreset() {
  const select = document.getElementById('devicePreset');
  const widthInput = document.getElementById('viewportWidth');
  const heightInput = document.getElementById('viewportHeight');

  select.addEventListener('change', () => {
    const option = select.selectedOptions[0];
    const width = parseInt(option.dataset.width, 10);
    const height = parseInt(option.dataset.height, 10);

    if (width && height) {
      setSize(width, height);
      widthInput.value = width;
      heightInput.value = height;
    } else {
      initViewport();
      const size = getSize();
      widthInput.value = Math.round(size.width);
      heightInput.value = Math.round(size.height);
    }
  });
}
