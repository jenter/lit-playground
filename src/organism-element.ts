// import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { MdIcon } from "./icon";
// doesn't work @ since missing definitions (?) - import { Menu } from "@material/mwc-menu";

@customElement("organism-element")
export class OrganismElement extends MdIcon {

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
