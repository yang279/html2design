const frame = document.getElementById('pageFrame');
const sidebarContent = document.getElementById('sidebarContent');
const sidebarTitle = document.getElementById('sidebarTitle');
let currentMode = 'interact';
let iframeDoc = null;

function loadPage() {
  const url = document.getElementById('urlInput').value.trim();
  if (!url) return;
  frame.src = url;
}
function loadQuick(url) {
  document.getElementById('urlInput').value = url;
  loadPage();
}
function toggleSidebar() {
  const sb = document.getElementById('sidebar');
  const btn = sb.querySelector('.sidebar-toggle');
  sb.classList.toggle('collapsed');
  btn.textContent = sb.classList.contains('collapsed') ? '▶' : '◀';
}

function switchMode(btn) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentMode = btn.dataset.mode;
  applyMode();
}

function applyMode() {
  const overlay = document.getElementById('selectedOverlay');

  if (currentMode === 'interact') {
    overlay.style.display = 'none';
    removeCodeListeners();
    removeAnnotations();
    sidebarTitle.textContent = '页面基础信息';
    readInfo();
  } else if (currentMode === 'annotation') {
    overlay.style.display = 'none';
    removeCodeListeners();
    sidebarTitle.textContent = '标注数据';
    injectAnnotations();
  } else if (currentMode === 'code') {
    removeAnnotations();
    overlay.style.display = 'none';
    sidebarTitle.textContent = '代码推荐';
    addCodeListeners();
    sidebarContent.innerHTML = '<div class="empty-tip"><span>🎯</span>点击页面中的元素<br>查看样式与代码信息</div>';
  }
}

function injectAnnotations() {
  try {
    iframeDoc = frame.contentDocument;
    if (!iframeDoc) throw new Error('cross-origin');
    const fn = iframeDoc.defaultView.renderAnnotations;
    if (!fn) {
      sidebarContent.innerHTML = '<div class="empty-tip"><span>ℹ️</span>该页面无标注渲染函数</div>';
      return;
    }
    fn(true);

    const annotations = iframeDoc.defaultView.__annotations || [];
    let html = '';
    annotations.forEach(a => {
      html += `<div style="margin-bottom:12px;padding:10px;background:rgba(0,0,0,0.04);border-radius:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="color:#ff6900;font-weight:600;font-size:13px;">📌 标注 #${a.id}</span>
          <span style="color:#999;font-size:12px;">${a.author}</span>
        </div>
        <div style="color:#999;font-size:12px;margin-top:2px;">${a.time}</div>
        <div style="color:#333;font-size:13px;margin-top:6px;line-height:1.5;">${a.content}</div>
      </div>`;
    });
    sidebarContent.innerHTML = html;
  } catch (e) {
    sidebarContent.innerHTML = '<div class="empty-tip"><span>🔒</span>跨域限制，无法读取标注数据</div>';
  }
}

function removeAnnotations() {
  try {
    iframeDoc = frame.contentDocument;
    if (!iframeDoc) return;
    const fn = iframeDoc.defaultView.renderAnnotations;
    if (fn) fn(false);
  } catch(e) {}
}

function addCodeListeners() {
  try {
    iframeDoc = frame.contentDocument;
    if (!iframeDoc) return;
    iframeDoc.addEventListener('mouseover', codeHoverHandler, true);
    iframeDoc.addEventListener('click', codeClickHandler, true);
  } catch(e) {}
}

function removeCodeListeners() {
  try {
    if (!iframeDoc) return;
    iframeDoc.removeEventListener('mouseover', codeHoverHandler, true);
    iframeDoc.removeEventListener('click', codeClickHandler, true);
    clearHighlight();
  } catch(e) {}
}

function codeHoverHandler(e) {
  if (currentMode !== 'code') return;
  const el = e.target;
  if (el === iframeDoc.body || el === iframeDoc.documentElement) return;

  const overlay = document.getElementById('selectedOverlay');
  const elRect = el.getBoundingClientRect();

  overlay.style.display = 'block';
  overlay.style.left = elRect.left + 'px';
  overlay.style.top = elRect.top + 'px';
  overlay.style.width = elRect.width + 'px';
  overlay.style.height = elRect.height + 'px';
}

function codeClickHandler(e) {
  if (currentMode !== 'code') return;
  const el = e.target;
  if (el === iframeDoc.body || el === iframeDoc.documentElement) return;
  e.preventDefault();
  e.stopPropagation();
  showCodeInfo(el);
}

function showCodeInfo(el) {
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

  html += `<div class="info-section"><div class="info-section-title">元素选择器</div><div style="font-size:13px;color:#333;font-weight:500;padding:8px;background:rgba(0,0,0,0.04);border-radius:6px;word-break:break-all;">${selector}</div></div>`;

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

  html += `<div class="info-section"><div class="info-section-title">元素文本</div><div style="font-size:12px;color:#666;padding:8px;background:rgba(0,0,0,0.04);border-radius:6px;max-height:60px;overflow:auto;">${(el.innerText || '').slice(0, 200).replace(/</g,'&lt;')}</div></div>`;

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

function readInfo() {
  try {
    const doc = frame.contentDocument;
    if (!doc) throw new Error('cross-origin');
    iframeDoc = doc;
    const title = doc.title || '无标题';
    const lang = doc.documentElement.lang || '未知';
    const charset = doc.characterSet || '未知';
    const links = doc.querySelectorAll('a[href]').length;
    const images = doc.querySelectorAll('img').length;
    const scripts = doc.querySelectorAll('script').length;
    const styles = doc.querySelectorAll('style,link[rel="stylesheet"]').length;
    const metaDesc = getMeta(doc, 'description');
    const metaKeywords = getMeta(doc, 'keywords');
    const metaAuthor = getMeta(doc, 'author');
    const bodyText = doc.body ? doc.body.innerText.slice(0, 200) : '';
    const allTags = Array.from(doc.querySelectorAll('*')).map(e => e.tagName.toLowerCase());
    const uniqueTags = [...new Set(allTags)].sort();

    sidebarContent.innerHTML = `
      <div class="info-section">
        <div class="info-section-title">基本信息</div>
        <div class="info-row"><span class="info-label">标题</span><span class="info-value">${title}</span></div>
        <div class="info-row"><span class="info-label">语言</span><span class="info-value">${lang}</span></div>
        <div class="info-row"><span class="info-label">编码</span><span class="info-value">${charset}</span></div>
        <div class="info-row"><span class="info-label">描述</span><span class="info-value">${metaDesc || '无'}</span></div>
        <div class="info-row"><span class="info-label">关键词</span><span class="info-value">${metaKeywords || '无'}</span></div>
        <div class="info-row"><span class="info-label">作者</span><span class="info-value">${metaAuthor || '无'}</span></div>
      </div>
      <div class="info-section">
        <div class="info-section-title">资源统计</div>
        <div class="info-row"><span class="info-label">链接</span><span class="info-value">${links}</span></div>
        <div class="info-row"><span class="info-label">图片</span><span class="info-value">${images}</span></div>
        <div class="info-row"><span class="info-label">脚本</span><span class="info-value">${scripts}</span></div>
        <div class="info-row"><span class="info-label">样式</span><span class="info-value">${styles}</span></div>
      </div>
      <div class="info-section">
        <div class="info-section-title">页面预览</div>
        <div class="info-value" style="text-align:left;font-size:12px;color:#666;line-height:1.6;padding:8px;background:rgba(0,0,0,0.04);border-radius:6px;">${bodyText.replace(/</g,'&lt;') || '无文本内容'}...</div>
      </div>
      <div class="info-section">
        <div class="info-section-title">标签集合 (${uniqueTags.length})</div>
        <div class="info-tags">${uniqueTags.map(t => '<span class="info-tag">' + t + '</span>').join('')}</div>
      </div>
    `;
  } catch (e) {
    sidebarContent.innerHTML = '<div class="empty-tip"><span>🔒</span>跨域限制，无法读取页面信息<br><small style="color:#aaa;margin-top:8px;display:block">仅可分析同源页面</small></div>';
  }
}

function getMeta(doc, name) {
  const el = doc.querySelector('meta[name="' + name + '"]');
  return el ? el.getAttribute('content') : '';
}

frame.addEventListener('load', () => {
  iframeDoc = null;
  applyMode();
});
