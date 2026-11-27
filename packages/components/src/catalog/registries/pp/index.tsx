import { defineRegistry } from '@json-render/react';
import { catalog } from '../../catalog';
import { collections } from './collections';
import { content } from './content';
import { conversation } from './conversation';
import { inputs } from './inputs';
import { layout } from './layout';
import { overlays } from './overlays';
import { unsupported } from './unsupported';
import '../../../jsx-types';

// The catalog rendered with the project's own library: pp-* elements and the
// CSS layer's classes, the same markup the hand-written demos use.

export const { registry } = defineRegistry(catalog, {
  components: {
    ...layout,
    ...collections,
    ...content,
    ...conversation,
    ...inputs,
    ...overlays,
    ...unsupported,
  },
});
