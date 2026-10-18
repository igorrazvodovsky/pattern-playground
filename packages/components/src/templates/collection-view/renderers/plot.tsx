import { useEffect, useMemo, useRef } from 'react';
import type { BoundEntity, EntityBinding } from '@shared/data/bindings';
import { resolveAttributeSelection, isNumericValueType } from '@shared/data/bindings';
import type { ScatterPlot } from '../../../components/charts/scatter-plot.js';
import { getAttributeValue, attributeLabel } from '../AttributeUtils';
import type { AttributePath, ViewSpec } from '../spec';
import { toPlotPoints } from '../data';
import type { RendererProps } from './shared';

/** First two shown attributes that are numeric in the data become the axes;
    the fallback pair is the binding's first two numeric attributes. */
export function pickPlotAxes(
  items: BoundEntity[],
  spec: ViewSpec,
  binding: EntityBinding
): [AttributePath, AttributePath] | null {
  const bindingNumeric = binding.attributes
    .filter((attribute) => isNumericValueType(attribute.valueType))
    .map((attribute) => attribute.path);
  const fallback: [AttributePath, AttributePath] | null =
    bindingNumeric.length >= 2 ? [bindingNumeric[0], bindingNumeric[1]] : null;

  const sample = items[0];
  if (!sample) return fallback;
  const numeric = resolveAttributeSelection(binding, spec.representation.shownAttributes)
    .map((attribute) => attribute.path)
    .filter((path) => typeof getAttributeValue(sample, path) === 'number');
  if (numeric.length < 2) return fallback;
  return [numeric[0], numeric[1]];
}

export function PlotRenderer<T extends BoundEntity>(props: RendererProps<T>) {
  const { items, spec, binding, onItemSelect, onItemFocus } = props;
  const ref = useRef<ScatterPlot | null>(null);
  const axes = pickPlotAxes(items, spec, binding);
  const xPath = axes?.[0];
  const yPath = axes?.[1];
  const points = useMemo(
    () => (xPath && yPath ? toPlotPoints(items, binding, xPath, yPath) : []),
    [items, binding, xPath, yPath]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || !xPath || !yPath) return;
    el.data = {
      data: points,
      xAxisLabel: attributeLabel(xPath, binding),
      yAxisLabel: attributeLabel(yPath, binding),
    };
    el['show-axes'] = true;
  }, [points, xPath, yPath, binding]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const resolve = (event: Event) => {
      const point = (event as CustomEvent<{ data: { id?: string } }>).detail?.data;
      return point?.id
        ? items.find((candidate) => candidate.id === point.id)
        : undefined;
    };
    const handleClick = (event: Event) => {
      const item = resolve(event);
      if (item && onItemSelect) onItemSelect(item);
    };
    const handleHover = (event: Event) => {
      const item = resolve(event);
      if (item && onItemFocus) onItemFocus(item);
    };
    const handleHoverEnd = () => onItemFocus?.(null);
    el.addEventListener('pp-point-click', handleClick);
    el.addEventListener('pp-point-hover', handleHover);
    el.addEventListener('pp-point-hover-end', handleHoverEnd);
    return () => {
      el.removeEventListener('pp-point-click', handleClick);
      el.removeEventListener('pp-point-hover', handleHover);
      el.removeEventListener('pp-point-hover-end', handleHoverEnd);
    };
  }, [items, onItemSelect, onItemFocus]);

  return <pp-scatter-plot ref={ref} />;
}
