export class Button extends HTMLButtonElement {
  constructor() {
    super();
  }

  // connectedCallback() {
  //   this.addEventListener("click", this.doAlert);
  // }

  // doAlert() {
  //   alert("Alert machine strikes again.");
  // }
}

customElements.define("ir-button", Button, { extends: "button" });