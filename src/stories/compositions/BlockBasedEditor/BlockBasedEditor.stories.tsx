import type { Meta, StoryObj } from "@storybook/react-vite";
import { Reference, createReferenceSuggestion } from '../../../components/reference/Reference';
import { referenceCategories } from '../../data';
import { 
  TextEditor, 
  BUBBLE_MENU_PRESETS, 
  FLOATING_MENU_PRESETS 
} from '../../../components/text-editor';
import '../../../jsx-types';

const meta = {
  title: "Compositions/Block-based editor",
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  args: {},
  render: () => {
    return (
      <div className="layer">
        <TextEditor
          content={`
            <p>
              Hey, try to select some text here. There will popup a menu for selecting some inline styles. Try typing @ to trigger mentions!
            </p>
          `}
          extensions={[
            Reference.configure({
              HTMLAttributes: {
                class: 'reference-mention reference',
              },
              suggestion: createReferenceSuggestion(referenceCategories),
            }),
          ]}
          bubbleMenu={BUBBLE_MENU_PRESETS.basic}
        />
      </div>
    )
  },
};

export const WithFloatingMenu: Story = {
  args: {},
  render: () => {
    return (
      <div className="layer">
        <TextEditor
          content={`
            <p>Click at the end of this paragraph to see the floating menu.</p>
            <p></p>
            <p>The floating menu appears when you're in an empty paragraph or at the end of a block. Try clicking after this sentence.</p>
            <p></p>
            <p>You can also press Enter to create a new paragraph and see the menu appear.</p>
          `}
          extensions={[
            Reference.configure({
              HTMLAttributes: {
                class: 'reference-mention reference',
              },
              suggestion: createReferenceSuggestion(referenceCategories),
            }),
          ]}
          bubbleMenu={BUBBLE_MENU_PRESETS.basic}
          floatingMenu={FLOATING_MENU_PRESETS.basic}
        />
      </div>
    );
  },
};