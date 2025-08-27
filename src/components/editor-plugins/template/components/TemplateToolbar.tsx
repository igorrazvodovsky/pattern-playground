import React, { useState } from 'react';
import type { TemplatePluginOptions } from '../PluginTemplate';

/**
 * TEMPLATE: Toolbar Component
 * 
 * This component appears in the editor toolbar.
 * Customize this component to provide persistent controls for your plugin.
 */

interface TemplateToolbarProps {
  options: TemplatePluginOptions;
  onClick: (action: string, data?: any) => void;
}

export const TemplateToolbar: React.FC<TemplateToolbarProps> = ({ 
  options, 
  onClick 
}) => {
  const [isActive, setIsActive] = useState(false);

  if (!options.enabled) {
    return null;
  }

  const handleToggle = () => {
    const newState = !isActive;
    setIsActive(newState);
    onClick('toggle', { active: newState });
  };

  return (
    <div className="template-toolbar">
      <button
        className={`toolbar-button ${isActive ? 'active' : ''}`}
        onClick={handleToggle}
        title="Template Plugin"
        style={{
          padding: '6px 12px',
          borderRadius: '4px',
          border: '1px solid #ddd',
          background: isActive ? '#e5e7eb' : '#fff',
          cursor: 'pointer',
          fontSize: '14px',
          marginRight: '4px',
        }}
      >
        {/* Replace with your icon or text */}
        <span>Plugin</span>
      </button>
      
      {/* Add more toolbar controls as needed */}
      {isActive && (
        <div className="toolbar-options" style={{ display: 'inline-flex', gap: '4px' }}>
          <button
            onClick={() => onClick('option1')}
            style={{
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Option 1
          </button>
          <button
            onClick={() => onClick('option2')}
            style={{
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              background: '#fff',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Option 2
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * CUSTOMIZATION EXAMPLES:
 * 
 * Dropdown in Toolbar:
 * ```tsx
 * <select 
 *   value={selectedValue}
 *   onChange={(e) => onClick('change-mode', e.target.value)}
 * >
 *   <option value="mode1">Mode 1</option>
 *   <option value="mode2">Mode 2</option>
 * </select>
 * ```
 * 
 * Icon Buttons:
 * ```tsx
 * import { Bold, Italic, Underline } from 'lucide-react';
 * 
 * <button onClick={() => onClick('bold')}>
 *   <Bold size={16} />
 * </button>
 * ```
 * 
 * Toggle Group:
 * ```tsx
 * const [activeFormat, setActiveFormat] = useState('none');
 * 
 * const formats = ['bold', 'italic', 'underline'];
 * 
 * <div className="toggle-group">
 *   {formats.map(format => (
 *     <button
 *       key={format}
 *       className={activeFormat === format ? 'active' : ''}
 *       onClick={() => {
 *         setActiveFormat(format);
 *         onClick('format', format);
 *       }}
 *     >
 *       {format}
 *     </button>
 *   ))}
 * </div>
 * ```
 * 
 * Color Picker:
 * ```tsx
 * <input
 *   type="color"
 *   value={color}
 *   onChange={(e) => onClick('change-color', e.target.value)}
 * />
 * ```
 */