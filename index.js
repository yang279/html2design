import { frame, setIframeDoc } from './modules/shared/state.js';
import { updatePageTitle } from './modules/nav/nav.js';
import { initViewport } from './modules/viewport/viewport.js';
import { initViewportSize } from './modules/viewport-size/viewport-size.js';
import { initViewportZoom } from './modules/viewport-zoom/viewport-zoom.js';
import { initDevicePreset } from './modules/device-preset/device-preset.js';
import { initSidebar, renderAnnotationsList } from './modules/sidebar/sidebar.js';
import { initModeSwitcher, applyMode } from './modules/mode-switcher/mode-switcher.js';
import { loadAnnotationData } from './modules/annotation/annotation.js';
import './modules/annotation-popup/annotation-popup.js';

async function init() {
  await loadAnnotationData();
  
  initViewport();
  initViewportSize();
  initViewportZoom();
  initDevicePreset();
  initSidebar();
  initModeSwitcher();
  
  applyMode();
}

init();

function onFrameLoad() {
  setIframeDoc(null);
  updatePageTitle();
  applyMode();
}

frame.addEventListener('load', onFrameLoad);
