import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { ItemPreview } from './ItemPreview';
import { modalService } from '../../services/modal-service';
import type { ItemInteractionProps, ViewScope, BaseItem } from './types';

/**
 * ItemInteraction - Multi-scope interaction orchestrator
 * Handles progressive disclosure through different view scopes
 */
export const ItemInteraction = <T extends BaseItem = BaseItem>({
  item,
  contentType,
  children,
  enableEscalation = true,
  scopeConfig = {},
  onScopeChange,
  onInteraction,
}: ItemInteractionProps<T>) => {

  // State for tracking hover + modifier key combination
  const [isHovering, setIsHovering] = useState(false);
  const [isModifierPressed, setIsModifierPressed] = useState(false);

  // Default scope configurations - memoized to prevent dependency issues
  const resolvedScopeConfig = useMemo(() => {
    const defaultScopeConfig = {
      mini: { trigger: 'hover' as const, delay: 700, placement: 'top' as const },
      mid: { trigger: 'click' as const },
      maxi: { trigger: 'click' as const },
    };
    return { ...defaultScopeConfig, ...scopeConfig };
  }, [scopeConfig]);

  // Track modifier key state globally
  useEffect(() => {
    // Check initial modifier key state on mount
    const checkInitialModifierState = (e?: Event) => {
      if ((e as KeyboardEvent)?.ctrlKey || (e as KeyboardEvent)?.metaKey) {
        setIsModifierPressed(true);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        setIsModifierPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        setIsModifierPressed(false);
      }
    };

    // Also check on focus/blur events to catch modifier state changes
    const handleFocus = () => {
      // Reset modifier state when window gains focus
      setIsModifierPressed(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleScopeChange = useCallback((newScope: ViewScope) => {
    onScopeChange?.(newScope);

    // Handle different scope transitions using modal service
    switch (newScope) {
      case 'mid':
        // Create simple HTML content for drawer
        const detailContent = `
          <div class="flow" data-content-type="${contentType}">
            <header class="inline-flow">
              <div class="flow-2xs">
                <h2>${item.label}</h2>
                <small class="text-secondary">${item.type}</small>
              </div>
            </header>
            <div class="flow">
              <div><strong>ID:</strong> ${item.id}</div>
              ${item.metadata && Object.keys(item.metadata).length > 0 ? `
                <div class="flow-xs">
                  <h3>Properties</h3>
                  <dl class="flow-2xs">
                    ${Object.entries(item.metadata).map(([key, value]) => `
                      <div>
                        <dt class="text-bold">${key}</dt>
                        <dd>${String(value)}</dd>
                      </div>
                    `).join('')}
                  </dl>
                </div>
              ` : ''}
            </div>
          </div>
        `;
        modalService.openDrawer(detailContent, 'right', item.label);
        break;
      case 'maxi':
        // Create simple HTML content for full view
        const fullContent = `
          <div class="layer flow" data-content-type="${contentType}">
            <header class="inline-flow">
              <div class="flow-2xs">
                <h1>${item.label}</h1>
                <div class="inline-flow text-secondary">
                  <span>${item.type}</span>
                  <span>#${item.id}</span>
                </div>
              </div>
            </header>
            <main class="flow">
              <section class="flow">
                <h2>Overview</h2>
                <p>This is a ${item.type} item with ID ${item.id}.</p>
              </section>
              ${item.metadata && Object.keys(item.metadata).length > 0 ? `
                <section class="flow">
                  <h2>Properties</h2>
                  <dl class="flow-xs">
                    ${Object.entries(item.metadata).map(([key, value]) => `
                      <div>
                        <dt class="text-bold">${key}</dt>
                        <dd>${typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}</dd>
                      </div>
                    `).join('')}
                  </dl>
                </section>
              ` : ''}
            </main>
          </div>
        `;
        modalService.openDialog(fullContent, item.label);
        break;
    }
  }, [onScopeChange, item, contentType]);

  const handleEscalate = useCallback((targetScope: ViewScope) => {
    if (enableEscalation) {
      handleScopeChange(targetScope);
    }
  }, [enableEscalation, handleScopeChange]);

  const handleInteraction = useCallback((mode: 'preview' | 'inspect' | 'edit' | 'transform', interactionItem: T) => {
    onInteraction?.(mode, interactionItem);
  }, [onInteraction]);

  // Handle mouse enter/leave for hover state
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (!enableEscalation) return;

    const midConfig = resolvedScopeConfig.mid;
    const maxiConfig = resolvedScopeConfig.maxi;

    if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd+click for maxi scope
      if (maxiConfig?.trigger === 'click') {
        e.preventDefault();
        handleEscalate('maxi');
      }
    } else {
      // Regular click for mid scope
      if (midConfig?.trigger === 'click') {
        e.preventDefault();
        handleEscalate('mid');
      }
    }
  }, [enableEscalation, resolvedScopeConfig, handleEscalate]);

  // Render children with hover card if mini scope is enabled and both hover + modifier key are active
  const miniConfig = resolvedScopeConfig.mini;
  const shouldEnableHoverCard = enableEscalation && miniConfig?.trigger === 'hover';
  const shouldShowHoverCard = shouldEnableHoverCard && isHovering && isModifierPressed;

  const childrenWithInteraction = (
    <span
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        cursor: enableEscalation ? 'pointer' : 'default',
        opacity: shouldEnableHoverCard && isHovering && !isModifierPressed ? 0.7 : 1,
        transition: 'opacity 0.2s ease'
      }}
      title={shouldEnableHoverCard && isHovering && !isModifierPressed ? 'Hold Ctrl/Cmd for preview' : undefined}
    >
      {children}
    </span>
  );

  return (
    <>
      {shouldEnableHoverCard ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {childrenWithInteraction}
          {shouldShowHoverCard && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                marginTop: '8px',
                backgroundColor: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                minWidth: '200px',
                animation: 'fadeIn 0.2s ease-out'
              }}
              className="hover-card__content"
            >
              <ItemPreview
                item={item}
                contentType={contentType}
                scope="mini"
                onEscalate={handleEscalate}
                onInteraction={handleInteraction}
              />
            </div>
          )}
        </div>
      ) : (
        childrenWithInteraction
      )}

    </>
  );
};