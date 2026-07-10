import { getAllAnnotations, getCurrentPageAnnotations, getAnnotationData } from '../annotation/annotation.js';

let currentTab = 'all';

export function initSidebar() {
  const sb = document.getElementById('sidebar');
  const btn = sb.querySelector('.sidebar-toggle');
  btn.addEventListener('click', () => {
    sb.classList.toggle('collapsed');
    btn.textContent = sb.classList.contains('collapsed') ? '▶' : '◀';
  });
  
  initTabs();
  
  window.addEventListener('message', (e) => {
    if (e.data.type === 'pageChanged') {
      switchToCurrentPageTab();
      renderAnnotationsList(e.data.payload.currentPage);
    }
  });
}

function switchToCurrentPageTab() {
  const tabs = document.querySelectorAll('.sidebar-tab');
  tabs.forEach(t => t.classList.remove('active'));
  
  const currentTabBtn = document.querySelector('.sidebar-tab[data-tab="current"]');
  if (currentTabBtn) {
    currentTabBtn.classList.add('active');
    currentTab = 'current';
  }
}

function initTabs() {
  const sidebarContent = document.getElementById('sidebarContent');
  
  const tabsHTML = `
    <div class="sidebar-tabs" style="display: none;">
      <button class="sidebar-tab active" data-tab="all">全部</button>
      <button class="sidebar-tab" data-tab="current">当前页</button>
    </div>
  `;
  
  const tabsContainer = document.createElement('div');
  tabsContainer.innerHTML = tabsHTML;
  sidebarContent.parentElement.insertBefore(tabsContainer.firstElementChild, sidebarContent);
  
  const tabs = document.querySelectorAll('.sidebar-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      
      const iframe = document.getElementById('pageFrame');
      if (iframe && iframe.contentDocument) {
        const currentPage = iframe.contentDocument.defaultView.getCurrentPage ? 
          iframe.contentDocument.defaultView.getCurrentPage() : 'home';
        renderAnnotationsList(currentPage);
      }
    });
  });
}

export function renderAnnotationsList(currentPage = 'home') {
  const sidebarContent = document.getElementById('sidebarContent');
  
  let annotations;
  if (currentTab === 'all') {
    annotations = getAllAnnotations();
  } else {
    annotations = getCurrentPageAnnotations(currentPage);
  }
  
  if (!annotations || annotations.length === 0) {
    sidebarContent.innerHTML = `<div class="empty-tip"><span>ℹ️</span>暂无${currentTab === 'current' ? '当前页' : ''}标注数据</div>`;
    return;
  }
  
  let html = '';
  annotations.forEach(a => {
    html += `<div class="annotation-card">
      <div class="annotation-header">
        <span class="annotation-id">📌 标注 #${a.id}</span>
        <span class="annotation-author">${a.author}</span>
      </div>
      <div class="annotation-time">${a.time}</div>
      <div class="annotation-content">${a.content}</div>
    </div>`;
  });
  sidebarContent.innerHTML = html;
}
