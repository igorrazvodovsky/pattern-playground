import { addons } from 'storybook/manager-api';
import 'iconify-icon';
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
  const icon = document.createElement('iconify-icon');
  icon.setAttribute('icon', 'ph:graph');
  icon.setAttribute('width', '16');
  icon.setAttribute('height', '16');
  icon.style.cssText = 'flex-shrink:0';
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