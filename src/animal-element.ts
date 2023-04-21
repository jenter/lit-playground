import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { OrganismElement } from "./organism-element";

@customElement("animal-element")
export class AnimalElement extends OrganismElement {
  constructor() {
    super();
  }

  /**
   * animal Head
   */
  @property({ attribute: "animal-head", reflect: true })
  animalHead: String = "";

  /**
   * animal Head
   */
  @property({ attribute: "is-animal" })
  isAnimal: Boolean = true;

  /**
   * fire Animal Func
   */
  private fireAnimalFunc(another: string) {
    return "hello" + another;
  }

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
