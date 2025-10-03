import { Meta, Story } from '@storybook/addon-docs/blocks';
import { Indicators } from '../compositions/Card/Card.stories.tsx';

<Meta title="Patterns/Semantic zoom" />

> 🙂 **Fun meter: 5/5**.

# Semantic zoom

Controlling the [density](../?path=/docs/foundations-density--docs#information-density) of a GUI through dynamic, user-driven transformations of information representation: showing different types and amounts of information at different scales.

Within the [view](../?path=/docs/foundations-view-system--docs) system, semantic zoom enables fluid transitions across framing dimensions while preserving spatial context.

## Transformation patterns

- Scale-dependent swap: at defined thresholds, switches to a different, more legible representation (eg, text turns into an abstract; node clouds condense to clusters).
- In-place unfolding
- Context-preserving motion: avoid teleporting popups or modal detours.
- Scope transitions: navigate between collection view and individual item detail while maintaining spatial context.

## User-driven detail control
Users determine their own information needs moment by moment, rather than being constrained by pre-packaged interface decisions. This shifts agency from designer to user.

## Context preservation
As detail levels change, surrounding context remains visible and comprehensible.

## Multi-level abstraction
Information exists simultaneously at multiple levels of detail—from high-level summaries to granular specifics—with smooth transitions between them.

### Focus plus context
Borrowing from fish-eye distortion techniques, semantic zoom allows simultaneous focus on details while maintaining awareness of the broader information landscape.

## Related patterns

- [View](../?path=/docs/foundations-view-system--docs) - Conceptual framework for need-driven data framings
- [Needs-based view](../?path=/docs/compositions-needs-based-view--docs)
- [Item view](../?path=/docs/compositions-item-view--docs)
- [Data view](../?path=/docs/compositions-data-view--docs)
- [Progressive disclosure](../?path=/docs/patterns-progressive-disclosure--docs) - Sequential revelation vs simultaneous levels
- [Density](../?path=/docs/foundations-density--docs#information-density) - Information per unit space
- [Adaptation](../?path=/docs/foundations-adaptation--docs) - System response to context changes

## Resources & references

- [StretchText](https://en.wikipedia.org/wiki/StretchText)
- [Alexander Obenauer / Semantic zoom](https://alexanderobenauer.com/labnotes/038/)
- [Orion Reed / Semantic zoom in tldraw](https://x.com/OrionReedOne/status/1790263523857019227)
- [Amelia Wattenberger / Fish Eye](https://wattenberger.com/thoughts/fish-eye)
- https://github.com/prathyvsh/semantic-zoom/ - Collection of examples