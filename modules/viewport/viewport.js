const wrap = document.getElementById('iframeWrap');
const viewport = document.getElementById('deviceViewport');
const deviceFrame = document.getElementById('deviceFrame');

let zoom = 1;
let width = 0;
let height = 0;

function render() {
  deviceFrame.style.width = width + 'px';
  deviceFrame.style.height = height + 'px';
  deviceFrame.style.transform = `scale(${zoom})`;
  viewport.style.width = (width * zoom) + 'px';
  viewport.style.height = (height * zoom) + 'px';
}

export function getSize() {
  return { width, height };
}

export function setSize(w, h) {
  width = w;
  height = h;
  render();
}

export function getZoom() {
  return zoom;
}

export function setZoom(value) {
  zoom = value;
  render();
}

export function initViewport() {
  const style = getComputedStyle(wrap);
  const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  width = wrap.clientWidth - paddingX;
  height = wrap.clientHeight - paddingY;
  render();
}
