// import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Menu } from "@material/mwc-menu";

@customElement("organism-element")
export class OrganismElement extends Menu {
  constructor() {
    super();
  }

  /**
   * fire Organism Func
   */
  public fireOrganismFunc(isTrue: boolean = true) {
    return "test" + isTrue;
  }

  /**
   * organism Ear
   */
  @property({ attribute: "organism-ear" })
  organismEar: String = "";
}

declare global {
  interface HTMLElementTagNameMap {
    "organism-element": OrganismElement;
  }
}
