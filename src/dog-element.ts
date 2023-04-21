import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AnimalElement } from "./animal-element";

@customElement("dog-element")
export class DogElement extends AnimalElement {
  constructor() {
    super();
  }

  /**
   * dog Head
   */
  @property({ attribute: "dog-head", reflect: true })
  dogHead: String = "xooxox";

  /**
   * fire Dog Func
   */
  public fireDogFunc(hello: string) {
    return "test" + hello;
  }

  render() {
    const { dogHead } = this;

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
