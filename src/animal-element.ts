import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { OrganismElement } from "./organism-element";

@customElement("animal-element")
export class AnimalElement extends OrganismElement {
  constructor() {
    super();
  }

  /**
  * animalHead is may comment 
  * this is more text 
  */
  @property({ attribute: "animal-head", reflect: true })
  animalHead: String = "";

  // weinerzzzz
  @property({ attribute: "weiner", reflect: true })
  weiner: String = "";

  private fireAnimalFunc() {
    return "hello";
  }

  @property({ attribute: "animal-toes" })
  animalToes: String = "asdfasdfasdf";

  @property()
  aadifferentpropstyles?: string = '';

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
