import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("animal-element")
export class AnimalElement extends LitElement {
  private fireAnimalFunc() {
    return "hello";
  }

  /**
   * animalHead...
   */
  @property({ attribute: "animal-head" })
  animalHead: String = "";

  @property({ attribute: "animal-toes" })
  animalToes: String = "asdfasdfasdf";

  @state()
  isOpen = false;

  render() {
    const { animalHead } = this;

    return html`
      <div>
        <div>animalhead: ${animalHead}</div>
        animal render
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "animal-element": AnimalElement;
  }
}
