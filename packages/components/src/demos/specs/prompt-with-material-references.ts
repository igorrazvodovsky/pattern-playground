import { material, promptDemo } from './shared/prompt';

export default promptDemo({
  content: [
    [
      'Review the packaging redesign against ',
      material('doc-6'),
      ' and compare its footprint with the figures in ',
      material('doc-2'),
      '. Consider the findings of ',
      material('doc-8'),
      ' when making recommendations.',
    ],
  ],
  placeholder: 'Type @ to reference materials',
});
