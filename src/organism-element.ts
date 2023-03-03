// import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Menu } from "@material/mwc-menu";

@customElement("organism-element")
export class OrganismElement extends Menu {
  constructor() {
    super();
  }

  /**
   * fireOrganismFunc.......
   */
  private fireOrganismFunc() {
    return "howdy";
  }

  /**
   * oranism live...
   */
  @property({ attribute: "organism-ear" })
  organismEar: String = "";
}

declare global {
  interface HTMLElementTagNameMap {
    "organism-element": OrganismElement;
  }
}
