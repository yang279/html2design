import { frame, sidebarContent, setIframeDoc } from '../shared/state.js';

export function injectAnnotations() {
  try {
    const doc = frame.contentDocument;
    if (!doc) throw new Error('cross-origin');
    setIframeDoc(doc);
    const fn = doc.defaultView.renderAnnotations;
    if (!fn) {
      sidebarContent.innerHTML = '<div class="empty-tip"><span>ℹ️</span>该页面无标注渲染函数</div>';
      return;
    }
    fn(true);

    const annotations = doc.defaultView.__annotations || [];
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
  } catch (e) {
    sidebarContent.innerHTML = '<div class="empty-tip"><span>🔒</span>跨域限制，无法读取标注数据</div>';
  }
}

export function removeAnnotations() {
  try {
    const doc = frame.contentDocument;
    if (!doc) return;
    setIframeDoc(doc);
    const fn = doc.defaultView.renderAnnotations;
    if (fn) fn(false);
  } catch(e) {}
}
