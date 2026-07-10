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

function showCodeInfo(el) {
  const iframeDoc = getIframeDoc();
  const computedStyle = iframeDoc.defaultView.getComputedStyle(el);
  const tagName = el.tagName.toLowerCase();
  const idAttr = el.id ? '#' + el.id : '';
  const classAttr = el.className ? '.' + el.className.toString().trim().split(/\s+/).join('.') : '';
  const selector = tagName + idAttr + classAttr;

  let styles = '';
  const importantProps = ['display','flex-direction','justify-content','align-items','width','height','padding','margin','background','color','font-size','font-weight','border-radius','border','gap','position','overflow','z-index','flex','grid-template-columns'];
  importantProps.forEach(p => {
    const v = computedStyle.getPropertyValue(p);
    if (v) styles += `<span class="hl-prop">${p}</span>: <span class="hl-val">${v}</span>;\n`;
  });

  let html = '';
  const inlineStyles = el.getAttribute('style');
  if (inlineStyles) {
    html += `<div class="info-section"><div class="info-section-title">Inline Style</div><div class="code-block">${inlineStyles}</div></div>`;
  }

  html += `<div class="info-section"><div class="info-section-title">Computed Styles</div><div class="code-block">${styles}</div></div>`;

  html += `<div class="info-section"><div class="info-section-title">元素选择器</div><div class="selector-box">${selector}</div></div>`;

  html += `<div class="info-section"><div class="info-section-title">DOM 属性</div>`;
  const attrs = Array.from(el.attributes).filter(a => a.name !== 'style' && a.name !== 'class' && a.name !== 'id');
  attrs.forEach(a => {
    html += `<div class="info-row"><span class="info-label">${a.name}</span><span class="info-value">${a.value.slice(0, 80)}</span></div>`;
  });
  html += '</div>';

  const events = getEventHandlers(el);
  if (events.length) {
    html += `<div class="info-section"><div class="info-section-title">相关 JS 代码</div><div class="code-block">`;
    events.forEach(ev => {
      const code = ev.handler.toString().slice(0, 300);
      html += `<span class="hl-comment">// ${ev.type} 事件</span>\n<span class="hl-func">${code}</span>\n\n`;
    });
    html += '</div></div>';
  }

  html += `<div class="info-section"><div class="info-section-title">元素文本</div><div class="text-preview">${(el.innerText || '').slice(0, 200).replace(/</g,'&lt;')}</div></div>`;

  sidebarContent.innerHTML = html;
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
