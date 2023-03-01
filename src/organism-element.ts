// import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Menu } from "../types/mwc-menu";

@customElement("organism-element")
export class OrganismElement extends Menu {
  constructor() {
    super();
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
