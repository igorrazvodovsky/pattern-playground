import { addons } from 'storybook/manager-api';
import lightTheme from './theme';
import darkTheme from './theme-dark';

// The manager theme is fixed at config time, so the OS preference is read once
// at load; a mid-session OS switch needs a reload. The preview itself follows
// the OS live via color-scheme (base.css).
const prefersDark =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

addons.setConfig({
  theme: prefersDark ? darkTheme : lightTheme,
  showToolbar: false,
  sidebar: {
    collapsedRoots: ['foundations', 'operations', 'data-visualization', 'concepts'],
  },
});

// Storybook 10 has no public API for custom sidebar entries (verified against
// Addon_TypesEnum and storybook.js.org/docs/configure/user-interface/sidebar-and-urls).
// DOM-injecting a single anchor is the practical workaround; revisit when an addon slot is exposed.
const PATTERN_SITE_URL =
  (typeof process !== 'undefined' && process.env.STORYBOOK_PATTERN_SITE_URL) ||
  'http://localhost:4321';
const CONTAINER_ID = 'pattern-plgrnd-nav-footer';
const LINK_ID = 'pattern-plgrnd-pattern-site-link';

function injectLink() {
  if (document.getElementById(CONTAINER_ID)) return;
  // #sidebar-bottom-wrapper is a stable id used by Storybook's notification area.
  // Insert just before it so the link sits at the bottom of the tree but above notifications.
  // Fall back to appending to the sidebar container if the id is not yet present.
  const anchorTarget =
    document.getElementById('sidebar-bottom-wrapper') ??
    document.querySelector('[class*="sidebar-container"]');
  if (!anchorTarget) return;

  const container = document.createElement('div');
  container.id = CONTAINER_ID;
  container.style.cssText = [
    // 'border-top:1px solid rgba(38,85,115,0.15)',
    'padding: 8px 10px',
  ].join(';');

  const a = document.createElement('a');
  a.id = LINK_ID;
  a.href = PATTERN_SITE_URL;
  // Iconoteka's sitemap icon, inlined to keep iconify and the icon collection
  // out of the manager bundle.
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('width', '16');
  icon.setAttribute('height', '16');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.style.cssText = 'flex-shrink:0';
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', 'currentColor');
  path.setAttribute(
    'd',
    'M3.975 15.3L3.975 13.875C3.975 12.35 5.2 11.125 6.725 11.125L11.125 11.125L11.125 8.7L9.15 8.7L9.15 3L14.85 3L14.85 8.7L12.875 8.7L12.875 11.125L17.275 11.125C18.8 11.125 20.025 12.35 20.025 13.875L20.025 15.3L22 15.3L22 21L16.3 21L16.3 15.3L18.275 15.3L18.275 13.875C18.275 13.325 17.825 12.875 17.275 12.875L12.875 12.875L12.875 15.3L14.85 15.3L14.85 21L9.15 21L9.15 15.3L11.125 15.3L11.125 12.875L6.725 12.875C6.175 12.875 5.725 13.325 5.725 13.875L5.725 15.3L7.7 15.3L7.7 21L2 21L2 15.3ZM10.875 4.725L10.875 6.975L13.125 6.975L13.125 4.725ZM3.725 17.025L3.725 19.275L5.975 19.275L5.975 17.025ZM10.875 17.025L10.875 19.275L13.125 19.275L13.125 17.025L10.875 17.025ZM18.025 17.025L18.025 19.275L20.275 19.275L20.275 17.025Z',
  );
  icon.appendChild(path);
  const label = document.createTextNode('Patterns');
  a.append(icon, label);
  a.style.cssText = [
    'display:flex',
    'align-items:center',
    'gap:8px',
    'padding: 8px 10px',
    'font-size: 0.9rem',
    'color:inherit',
    'text-decoration:none',
  ].join(';');

  container.appendChild(a);
  if (anchorTarget.id === 'sidebar-bottom-wrapper') {
    anchorTarget.parentElement?.insertBefore(container, anchorTarget);
  } else {
    anchorTarget.appendChild(container);
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState !== 'loading') injectLink();
  else document.addEventListener('DOMContentLoaded', injectLink);
  new MutationObserver(injectLink).observe(document.body, { childList: true, subtree: true });
}
