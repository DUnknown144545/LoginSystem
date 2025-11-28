export function showMessage(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = `message ${type} show`;
  setTimeout(() => el.classList.remove("show"), 5000);
}
