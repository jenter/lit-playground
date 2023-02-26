import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('animal-element')
export class AnimalElement extends LitElement {

  /**
   * animalHead... 
   */
  @property({ attribute: "animal-head" })
  animalHead: String = '';

  @property({ attribute: "animal-toes" })
  animalToes: String = 'asdfasdfasdf';

  render() {
    const { animalHead } = this;

    return html`
      <div>
        <div>animalhead: ${animalHead} </div>
        animal render
      </div>
    `
  }


}

declare global {
  interface HTMLElementTagNameMap {
    'animal-element': AnimalElement
  }
}
