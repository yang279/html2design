import { sidebarContent, sidebarTitle, getCurrentMode, setCurrentMode } from '../shared/state.js';
import { injectAnnotations, removeAnnotations } from '../annotation/annotation.js';
import { addCodeListeners, removeCodeListeners } from '../code-inspector/code-inspector.js';

export function applyMode() {
  const overlay = document.getElementById('selectedOverlay');
  const sidebar = document.getElementById('sidebar');
  const currentMode = getCurrentMode();

  if (currentMode === 'interact') {
    overlay.style.display = 'none';
    removeCodeListeners();
    removeAnnotations();
    sidebar.classList.add('mode-hidden');
  } else if (currentMode === 'annotation') {
    overlay.style.display = 'none';
    removeCodeListeners();
    sidebar.classList.remove('mode-hidden');
    sidebarTitle.textContent = '标注数据';
    injectAnnotations();
  } else if (currentMode === 'code') {
    removeAnnotations();
    overlay.style.display = 'none';
    sidebar.classList.remove('mode-hidden');
    sidebarTitle.textContent = '代码推荐';
    addCodeListeners();
    sidebarContent.innerHTML = '<div class="empty-tip"><span>🎯</span>点击页面中的元素<br>查看样式与代码信息</div>';
  }
}

function switchMode(btn) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  setCurrentMode(btn.dataset.mode);
  applyMode();
}

export function initModeSwitcher() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => switchMode(btn));
  });
}
