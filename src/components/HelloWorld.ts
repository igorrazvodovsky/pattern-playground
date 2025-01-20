import { attr, css, FASTElement, html } from "@microsoft/fast-element";

/**
 * Create an HTML template using the html tag template literal,
 * this contains interpolated text content from a passed attribute
 */
const template = html`<span>Hello ${x => x.name}!</span>`

/**
 * Create CSS styles using the css tag template literal
 */
const styles = css`
    :host {
      border: 1px solid blue;
    }

    span {
      color: red;
    }
`;

/**
 * Define your component logic by creating a class that extends
 * the FASTElement, note the addition of the attr decorator,
 * this creates an attribute on your component which can be passed.
 */
export default class HelloWorld extends FASTElement {
  // @attr
  // public name: string;
}

/**
 * Define your custom web component for the browser, as soon as the file
 * containing this logic is imported, the element "hello-world" will be
 * defined in the DOM with it's html, styles, logic, and tag name.
 */
HelloWorld.define({
  name: "hello-world",
  template,
  styles,
});
