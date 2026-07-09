import { frame, setIframeDoc } from './modules/shared/state.js';
import { initNav } from './modules/nav/nav.js';
import { initSidebar } from './modules/sidebar/sidebar.js';
import { initModeSwitcher, applyMode } from './modules/mode-switcher/mode-switcher.js';

initNav();
initSidebar();
initModeSwitcher();

frame.addEventListener('load', () => {
  setIframeDoc(null);
  applyMode();
});
