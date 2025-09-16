import React from 'react';
import type { TemplatePluginOptions } from '../PluginTemplate';

/**
 * TEMPLATE: Bubble Menu Component
 * 
 * This component appears in the bubble menu when text is selected.
 * Customize this component to match your plugin's functionality.
 */

interface TemplateBubbleMenuProps {
  options: TemplatePluginOptions;
  onAction: (action: string, data?: unknown) => void;
}

export const TemplateBubbleMenu: React.FC<TemplateBubbleMenuProps> = ({ 
  options, 
  onAction 
}) => {
  if (!options.enabled) {
    return null;
  }

  const handleClick = () => {
    // Example: Trigger a plugin action
    onAction('example-action', {
      source: 'bubble-menu',
      timestamp: Date.now(),
    });
  };

  return (
    <div className="template-bubble-menu">
      <button
        className="bubble-menu-button"
        onClick={handleClick}
        title="Template Action"
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          background: '#fff',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        {/* Replace with your icon or text */}
        <span>T</span>
      </button>
    </div>
  );
};

/**
 * CUSTOMIZATION GUIDE:
 * 
 * 1. Update the component name to match your plugin
 * 2. Modify the props interface for your needs
 * 3. Add your custom UI elements (buttons, dropdowns, etc.)
 * 4. Implement your action handlers
 * 5. Style your component appropriately
 * 
 * COMMON PATTERNS:
 * 
 * Multiple Actions:
 * ```tsx
 * <div className="button-group">
 *   <button onClick={() => onAction('action1')}>Action 1</button>
 *   <button onClick={() => onAction('action2')}>Action 2</button>
 * </div>
 * ```
 * 
 * Dropdown Menu:
 * ```tsx
 * <select onChange={(e) => onAction('select', e.target.value)}>
 *   <option value="option1">Option 1</option>
 *   <option value="option2">Option 2</option>
 * </select>
 * ```
 * 
 * With State:
 * ```tsx
 * const [isActive, setIsActive] = useState(false);
 * 
 * const toggle = () => {
 *   setIsActive(!isActive);
 *   onAction('toggle', { active: !isActive });
 * };
 * ```
 */