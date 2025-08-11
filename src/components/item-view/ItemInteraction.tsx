import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { ItemView } from './ItemView';
import { modalService } from '../../services/modal-service';
import { createModalContentAsHtml, getSizeForScope, getPlacementForScope } from './services/modal-service-integration';
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
        const detailContent = createModalContentAsHtml(item, contentType, 'mid');
        modalService.openDrawer(detailContent, 'right', item.label);
        break;
      case 'maxi':
        const fullContent = createModalContentAsHtml(item, contentType, 'maxi');
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
              <ItemView
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