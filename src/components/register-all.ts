/**
 * Register all Pattern Playground components in dependency order
 * 
 * This file centrally manages component registration to ensure proper
 * instantiation order for interdependent components.
 */

import { componentRegistry } from './component-registry.js';

// Import all component classes
import { PpAvatar } from './avatar/avatar.js';
import { PpButton } from './button/button.js';
import { PpInput } from './input/input.js';
import { PPModal } from './modal/modal.js';
import { PpToast } from './toast/toast.js';
import { PpTooltip } from './tooltip/tooltip.js';
import { PpPopup } from './popup/popup.js';
import { PpDropdown } from './dropdown/dropdown.js';
import { PpList } from './list/list.js';
import { PpListItem } from './list-item/list-item.js';
import { PpBreadcrumbs } from './breadcrumbs/breadcrumbs.js';
import { PpTab } from './tab/tab.js';
import { PpTabPanel } from './tab-panel/tab-panel.js';
import { PpTabGroup } from './tab-group/tab-group.js';
import { PpPriorityPlus } from './priority-plus/priority-plus.js';
import { SimpleTable } from './table/table.js';

// Chart components
import { PpChartGrid } from './charts/primitives/chart-grid.js';
import { PpChartLegend } from './charts/primitives/chart-legend.js';

/**
 * Register all components in proper dependency order
 */
export function registerAllComponents(): void {
  componentRegistry.registerAll([
    // Base/primitive components first (no dependencies)
    { tagName: 'pp-avatar', constructor: PpAvatar },
    { tagName: 'pp-button', constructor: PpButton, options: { extends: 'button' } },
    { tagName: 'pp-input', constructor: PpInput },
    { tagName: 'pp-toast', constructor: PpToast },
    { tagName: 'pp-tooltip', constructor: PpTooltip },
    { tagName: 'pp-modal', constructor: PPModal },
    { tagName: 'pp-table', constructor: SimpleTable },
    { tagName: 'pp-priority-plus', constructor: PpPriorityPlus },
    
    // Chart primitives
    { tagName: 'pp-chart-grid', constructor: PpChartGrid },
    { tagName: 'pp-chart-legend', constructor: PpChartLegend },
    
    // Components with popup dependency
    { tagName: 'pp-popup', constructor: PpPopup },
    { tagName: 'pp-dropdown', constructor: PpDropdown, dependencies: ['pp-popup'] },
    
    // List components (list-item before list)
    { tagName: 'pp-list-item', constructor: PpListItem },
    { tagName: 'pp-list', constructor: PpList, dependencies: ['pp-list-item'] },
    { tagName: 'pp-breadcrumbs', constructor: PpBreadcrumbs },
    
    // Tab components (tab and tab-panel before tab-group)
    { tagName: 'pp-tab', constructor: PpTab },
    { tagName: 'pp-tab-panel', constructor: PpTabPanel },
    { tagName: 'pp-tab-group', constructor: PpTabGroup, dependencies: ['pp-tab', 'pp-tab-panel'] },
  ]);
}

// Auto-register all components when this module is imported
registerAllComponents();