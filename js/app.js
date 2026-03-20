// === DOM Elements ===
const burger = document.getElementById('burger');
const sidebar = document.getElementById('sidebar');
const sidebarClose = document.getElementById('sidebarClose');
const overlay = document.getElementById('overlay');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const sidebarThemeToggle = document.getElementById('sidebarThemeToggle');
const sidebarThemeIcon = document.getElementById('sidebarThemeIcon');

// === Sidebar ===
function openSidebar() {
  sidebar.classList.add('open');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

burger.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
overlay.addEventListener('click', closeSidebar);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});

// === Theme ===
function getTheme() {
  return localStorage.getItem('theme') || 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = theme === 'dark' ? '☀️' : '🌙';
  themeIcon.textContent = icon;
  sidebarThemeIcon.textContent = icon;
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

themeToggle.addEventListener('click', toggleTheme);
sidebarThemeToggle.addEventListener('click', toggleTheme);

// Apply saved theme on load
applyTheme(getTheme());
