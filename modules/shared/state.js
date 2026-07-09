export const frame = document.getElementById('pageFrame');
export const sidebarContent = document.getElementById('sidebarContent');
export const sidebarTitle = document.getElementById('sidebarTitle');

let currentMode = 'annotation';
let iframeDoc = null;

export function getCurrentMode() {
  return currentMode;
}
export function setCurrentMode(mode) {
  currentMode = mode;
}
export function getIframeDoc() {
  return iframeDoc;
}
export function setIframeDoc(doc) {
  iframeDoc = doc;
}
