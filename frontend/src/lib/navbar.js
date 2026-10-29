import { getUserName, logout } from './auth.js';

export function renderNavbar() {
  const navContainer = document.getElementById('navbar');
  if (!navContainer) return;

  // Clear container safely
  navContainer.textContent = '';

  // Top aesthetic announcement banner
  const banner = document.createElement('div');
  banner.className = 'top-banner';
  banner.textContent = '⚡ Real-Time AI Spam & Sentiment Analysis Engine';
  navContainer.appendChild(banner);

  const wrapper = document.createElement('header');
  wrapper.className = 'navbar-wrapper';

  const inner = document.createElement('div');
  inner.className = 'navbar-inner';

  // Brand
  const brand = document.createElement('a');
  brand.className = 'nav-brand';
  brand.href = '/index.html';
  brand.textContent = 'TextGuard ';

  const brandBadge = document.createElement('span');
  brandBadge.className = 'nav-brand-badge';
  brandBadge.textContent = 'AI';
  brand.appendChild(brandBadge);

  // Navigation Links
  const links = document.createElement('nav');
  links.className = 'nav-links';

  const currentPath = window.location.pathname;

  const navItems = [
    { label: 'Analyze', href: '/index.html' },
    { label: 'History', href: '/history.html' },
    { label: 'Stats', href: '/stats.html' },
  ];

  navItems.forEach(item => {
    const link = document.createElement('a');
    link.className = 'nav-link';
    link.href = item.href;
    link.textContent = item.label;

    if (
      currentPath.endsWith(item.href) ||
      (item.href === '/index.html' && (currentPath === '/' || currentPath.endsWith('/index.html')))
    ) {
      link.classList.add('active');
    }

    links.appendChild(link);
  });

  // User Info & Logout
  const userSection = document.createElement('div');
  userSection.className = 'nav-user';

  const usernameSpan = document.createElement('span');
  usernameSpan.className = 'nav-username';
  usernameSpan.textContent = getUserName();

  const logoutBtn = document.createElement('button');
  logoutBtn.className = 'btn btn-logout';
  logoutBtn.textContent = 'Logout';
  logoutBtn.addEventListener('click', () => {
    logout();
  });

  userSection.appendChild(usernameSpan);
  userSection.appendChild(logoutBtn);

  inner.appendChild(brand);
  inner.appendChild(links);
  inner.appendChild(userSection);
  wrapper.appendChild(inner);

  navContainer.appendChild(wrapper);
}

