import { frame, sidebarContent, getIframeDoc, setIframeDoc, getCurrentMode } from '../shared/state.js';

export function addCodeListeners() {
  try {
    const doc = frame.contentDocument;
    if (!doc) return;
    setIframeDoc(doc);
    doc.addEventListener('mouseover', codeHoverHandler, true);
    doc.addEventListener('click', codeClickHandler, true);
  } catch(e) {}
}

export function removeCodeListeners() {
  try {
    const doc = getIframeDoc();
    if (!doc) return;
    doc.removeEventListener('mouseover', codeHoverHandler, true);
    doc.removeEventListener('click', codeClickHandler, true);
    clearHighlight();
  } catch(e) {}
}

function codeHoverHandler(e) {
  if (getCurrentMode() !== 'code') return;
  const iframeDoc = getIframeDoc();
  const el = e.target;
  if (el === iframeDoc.body || el === iframeDoc.documentElement) return;

  const overlay = document.getElementById('selectedOverlay');
  const elRect = el.getBoundingClientRect();
  
  const iframe = document.getElementById('pageFrame');
  const iframeRect = iframe.getBoundingClientRect();
  
  const mainArea = document.getElementById('mainArea');
  const mainRect = mainArea.getBoundingClientRect();
  
  const deviceFrame = document.getElementById('deviceFrame');
  const zoom = deviceFrame ? parseFloat(deviceFrame.style.transform.replace('scale(', '').replace(')', '')) || 1 : 1;
  
  const left = (iframeRect.left - mainRect.left) + (elRect.left / zoom);
  const top = (iframeRect.top - mainRect.top) + (elRect.top / zoom);
  const width = elRect.width / zoom;
  const height = elRect.height / zoom;

  overlay.style.display = 'block';
  overlay.style.left = left + 'px';
  overlay.style.top = top + 'px';
  overlay.style.width = width + 'px';
  overlay.style.height = height + 'px';
}

function codeClickHandler(e) {
  if (getCurrentMode() !== 'code') return;
  const iframeDoc = getIframeDoc();
  const el = e.target;
  if (el === iframeDoc.body || el === iframeDoc.documentElement) return;
  e.preventDefault();
  e.stopPropagation();
  showCodeInfo(el);
}

let currentCodeTab = 'js';

function showCodeInfo(el) {
  const iframeDoc = getIframeDoc();
  const computedStyle = iframeDoc.defaultView.getComputedStyle(el);
  const tagName = el.tagName.toLowerCase();
  const idAttr = el.id ? '#' + el.id : '';
  const classAttr = el.className ? '.' + el.className.toString().trim().split(/\s+/).join('.') : '';
  const selector = tagName + idAttr + classAttr;

  let cssContent = '';
  cssContent += `<div class="info-section" style="margin-bottom:12px;"><div class="info-section-title">元素选择器</div><div class="selector-box" onclick="copyToClipboard(this.innerText)" style="cursor:pointer;" title="点击复制">${selector}</div></div>`;
  
  const importantProps = ['display','flex-direction','justify-content','align-items','width','height','padding','margin','background','color','font-size','font-weight','border-radius','border','gap','position','overflow','z-index','flex','grid-template-columns'];
  let styles = '';
  importantProps.forEach(p => {
    const v = computedStyle.getPropertyValue(p);
    if (v) styles += `${p}: ${v};\n`;
  });
  cssContent += `<div class="info-section"><div class="info-section-title">Computed Styles</div><div class="code-block" onclick="copyToClipboard(this.innerText)" style="cursor:pointer;" title="点击复制">${styles}</div></div>`;
  
  sidebarContent.innerHTML = `
    <div class="code-card">
      <div class="code-card-header">
        <div class="code-card-title">代码推荐</div>
        <div class="code-card-actions">
          <button class="code-action-btn" onclick="exportCode()">导出</button>
          <button class="code-action-btn" onclick="copyCode()">传送文本</button>
        </div>
      </div>
      <div class="code-content">${cssContent}</div>
    </div>
    <div id="toast" class="toast" style="display:none;">复制成功</div>
  `;
  
  window.currentCssContent = styles;
}

window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('复制成功');
  }).catch(err => {
    console.error('复制失败:', err);
  });
};

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.style.display = 'block';
  toast.style.opacity = '1';
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 300);
  }, 2000);
}

function getEventHandlers(el) {
  const results = [];
  const types = ['click','mouseover','mouseout','mouseenter','mouseleave','change','input','submit','load','scroll','keydown','keyup','focus','blur','touchstart','touchend'];
  types.forEach(type => {
    const handlers = getListeners(el, type);
    handlers.forEach(h => results.push({ type, handler: h }));
  });
  return results;
}

function getListeners(el, type) {
  try {
    const listeners = window.getEventListeners ? window.getEventListeners(el) : null;
    if (listeners && listeners[type]) return listeners[type].map(l => l.listener);
  } catch(e) {}
  const inline = el.getAttribute('on' + type);
  if (inline) return [new Function('event', inline)];
  return [];
}

function clearHighlight() {
  const overlay = document.getElementById('selectedOverlay');
  overlay.style.display = 'none';
}

window.exportCode = function() {
  const content = window.currentJsContent || '';
  const blob = new Blob([content.replace(/<[^>]+>/g, '')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'code-export.txt';
  a.click();
  URL.revokeObjectURL(url);
};

window.copyCode = function() {
  const content = window.currentJsContent || '';
  const text = content.replace(/<[^>]+>/g, '');
  navigator.clipboard.writeText(text).then(() => {
    alert('已复制到剪贴板');
  }).catch(err => {
    console.error('复制失败:', err);
  });
};
