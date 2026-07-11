import { addons } from 'storybook/manager-api';
import theme from './theme';

addons.setConfig({
  theme: theme,
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
    'padding: 8px 10px'
  ].join(';');

  const a = document.createElement('a');
  a.id = LINK_ID;
  a.href = PATTERN_SITE_URL;
  // Inline ph:graph SVG — keeps iconify (and its runtime icon API) out of
  // the manager bundle while matching the site sidebar's icon.
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('width', '16');
  icon.setAttribute('height', '16');
  icon.setAttribute('viewBox', '0 0 256 256');
  icon.setAttribute('aria-hidden', 'true');
  icon.style.cssText = 'flex-shrink:0';
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('fill', 'currentColor');
  path.setAttribute(
    'd',
    'M200 152a31.84 31.84 0 0 0-19.53 6.68l-23.11-18A31.65 31.65 0 0 0 160 128c0-.74 0-1.48-.08-2.21l13.23-4.41A32 32 0 1 0 168 104c0 .74 0 1.48.08 2.21l-13.23 4.41A32 32 0 0 0 128 96a32.6 32.6 0 0 0-5.27.44L115.89 81A32 32 0 1 0 96 88a32.6 32.6 0 0 0 5.27-.44l6.84 15.4a31.92 31.92 0 0 0-8.57 39.64l-25.71 22.84a32.06 32.06 0 1 0 10.63 12l25.71-22.84a31.91 31.91 0 0 0 37.36-1.24l23.11 18A31.65 31.65 0 0 0 168 184a32 32 0 1 0 32-32m0-64a16 16 0 1 1-16 16a16 16 0 0 1 16-16M80 56a16 16 0 1 1 16 16a16 16 0 0 1-16-16M56 208a16 16 0 1 1 16-16a16 16 0 0 1-16 16m56-80a16 16 0 1 1 16 16a16 16 0 0 1-16-16m88 72a16 16 0 1 1 16-16a16 16 0 0 1-16 16'
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