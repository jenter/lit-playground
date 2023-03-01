import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { AnimalElement } from "./animal-element";

@customElement("dog-element")
export class DogElement extends AnimalElement {
  /**
   * super
   */
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
    const { animalHead, dogHead } = this;

    return html`
      <div>
        <div>dogHead: ${dogHead}</div>
        <div>animalhead: ${animalHead}</div>
        dog render
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dog-element": DogElement;
  }
}
