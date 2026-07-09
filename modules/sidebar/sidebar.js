export function initSidebar() {
  const sb = document.getElementById('sidebar');
  const btn = sb.querySelector('.sidebar-toggle');
  btn.addEventListener('click', () => {
    sb.classList.toggle('collapsed');
    btn.textContent = sb.classList.contains('collapsed') ? '▶' : '◀';
  });
}
