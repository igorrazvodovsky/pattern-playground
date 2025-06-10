export class PpButton extends HTMLButtonElement {
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

customElements.define("pp-button", PpButton, { extends: "button" });