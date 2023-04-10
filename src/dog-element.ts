import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AnimalElement } from "./animal-element";

@customElement("dog-element")
export class DogElement extends AnimalElement {
  constructor() {
    super();
  }

  /**
   * dogHead...
   */
  @property({ attribute: "dog-head", reflect: true })
  dogHead: String = "xooxox";

  /**
   * fireDogFunc.......
   */
  private fireDogFunc() {
    return "howdy";
  }

  render() {
    const { dogHead } = this;
    console.log('🚀 ~ this.corner:', this.corner);

    return html`
      <div>
        <div>dogHead attribute: ${dogHead}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dog-element": DogElement;
  }
}
