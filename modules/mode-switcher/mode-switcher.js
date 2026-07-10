import { sidebarContent, sidebarTitle, getCurrentMode, setCurrentMode } from '../shared/state.js';
import { injectAnnotations, removeAnnotations } from '../annotation/annotation.js';
import { addCodeListeners, removeCodeListeners } from '../code-inspector/code-inspector.js';
import { renderAnnotationsList } from '../sidebar/sidebar.js';

export function applyMode() {
  const overlay = document.getElementById('selectedOverlay');
  const sidebar = document.getElementById('sidebar');
  const currentMode = getCurrentMode();
  const tabs = document.querySelector('.sidebar-tabs');

  if (currentMode === 'interact') {
    overlay.style.display = 'none';
    removeCodeListeners();
    removeAnnotations();
    sidebar.classList.add('mode-hidden');
    if (tabs) tabs.style.display = 'none';
  } else if (currentMode === 'annotation') {
    overlay.style.display = 'none';
    removeCodeListeners();
    sidebar.classList.remove('mode-hidden');
    sidebarTitle.textContent = '标注数据';
    injectAnnotations();
    if (tabs) tabs.style.display = 'flex';
    
    setTimeout(() => {
      const iframe = document.getElementById('pageFrame');
      if (iframe && iframe.contentDocument) {
        const currentPage = iframe.contentDocument.defaultView.getCurrentPage ? 
          iframe.contentDocument.defaultView.getCurrentPage() : 'home';
        renderAnnotationsList(currentPage);
      }
    }, 100);
  } else if (currentMode === 'code') {
    removeAnnotations();
    overlay.style.display = 'none';
    sidebar.classList.remove('mode-hidden');
    sidebarTitle.textContent = '代码推荐';
    addCodeListeners();
    sidebarContent.innerHTML = '<div class="empty-tip"><span>🎯</span>点击页面中的元素<br>查看样式与代码信息</div>';
    if (tabs) tabs.style.display = 'none';
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
