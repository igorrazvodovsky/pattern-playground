import { Meta } from '@storybook/addon-docs/blocks';

<Meta title="Patterns/Data entry/Input prompt" />

# Input prompt

Prefill a text field with an example input or instructional text that helps the user with what to do or type. Also called _placeholder text_.

> "A question or an imperative 'Fill me in!' is likely to be noticed."

## When to use

- No good default: when you can't guess a reasonable default value but need to explain the field
- Clarification: when the purpose or format of a control isn't immediately clear from the label alone
- Call to action: it sits right where the user types, making it harder to ignore than a helper hint

## Anatomy

1. Instructional text: a short verb phrase ("Type...", "Select...", "Choose...") inside the empty field
2. Disappearance: the text vanishes when the user types or focuses (depending on implementation)

## How it works

- Phrasing:
    - Drop-downs: use "Select", "Choose", or "Pick"
    - Text fields: use "Type" or "Enter"
    - End with a noun describing the input (e.g., "Choose a state", "Enter patient's name")
- Constraint: do not treat the prompt as a value; keep the "Submit" action disabled if the field still contains the prompt
- Restoration: put the prompt back if the user clears the field

## Comparison

### Input prompt vs. floating labels
- Input prompt: disappears or is replaced by user text; good for secondary instructions or examples
- Floating labels: move to the top edge on focus; they persist, so the user doesn't lose the context of _what_ the field is
- Note: if using floating labels, input prompts might be redundant or confusing if they conflict


## Related patterns

- [Input](../?path=/docs/primitives-input--docs) - the component
- [Input hints](../?path=/docs/patterns-data-entry-input-hints--docs) - instructions that sit _outside_ the field
- [Structured format](../?path=/docs/patterns-data-entry-structured-format--docs) - often uses prompts like "dd/mm/yyyy" to signal the structure
- [Good defaults](../?path=/docs/patterns-good-defaults--docs) - use when you can make a good guess
- Not the same as [prompt](../?path=/docs/patterns-prompt-prompt--docs) - the instruction given to a [bot](../?path=/docs/patterns-bot--docs)
