import { frame, sidebarContent, setIframeDoc } from '../shared/state.js';

let annotationData = null;

export async function loadAnnotationData() {
  try {
    const response = await fetch('annotation.json');
    annotationData = await response.json();
    return annotationData;
  } catch(e) {
    console.error('Failed to load annotations:', e);
    return null;
  }
}

export function getAnnotationData() {
  return annotationData;
}

export function getCurrentPageAnnotations(page) {
  if (!annotationData || !annotationData.annotations) return [];
  return annotationData.annotations[page] || [];
}

export function getAllAnnotations() {
  if (!annotationData || !annotationData.annotations) return [];
  return [
    ...annotationData.annotations.home || [],
    ...annotationData.annotations.detail || []
  ];
}

export function injectAnnotations() {
  try {
    const doc = frame.contentDocument;
    if (!doc) throw new Error('cross-origin');
    setIframeDoc(doc);
    
    updateIframeAnnotations();
  } catch (e) {
    sidebarContent.innerHTML = '<div class="empty-tip"><span>🔒</span>跨域限制，无法读取标注数据</div>';
  }
}

function updateIframeAnnotations() {
  try {
    const doc = frame.contentDocument;
    if (!doc) return;
    
    const currentPage = doc.defaultView.getCurrentPage ? doc.defaultView.getCurrentPage() : 'home';
    const currentAnnotations = getCurrentPageAnnotations(currentPage);
    
    doc.defaultView.__currentAnnotations = currentAnnotations;
    
    const fn = doc.defaultView.renderAnnotations;
    if (fn) fn(true);
  } catch(e) {}
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

window.addEventListener('message', (e) => {
  if (e.data.type === 'pageChanged') {
    updateIframeAnnotations();
  }
});
