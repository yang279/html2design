import { frame, sidebarContent, setIframeDoc } from '../shared/state.js';

function getMeta(doc, name) {
  const el = doc.querySelector('meta[name="' + name + '"]');
  return el ? el.getAttribute('content') : '';
}

export function readInfo() {
  try {
    const doc = frame.contentDocument;
    if (!doc) throw new Error('cross-origin');
    setIframeDoc(doc);
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
        <div class="info-preview">${bodyText.replace(/</g,'&lt;') || '无文本内容'}...</div>
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
