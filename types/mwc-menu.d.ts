import { MenuBase } from "@material/mwc-menu/mwc-menu-base.js";
export {
  createSetFromIndex,
  isEventMulti,
  isIndexSet,
  MWCListIndex,
} from "@material/mwc-list/mwc-list-foundation.js";
export { DefaultFocusState } from "@material/mwc-menu/mwc-menu-base.js";
export {
  Corner,
  MenuCorner,
} from "@material/mwc-menu/mwc-menu-surface-base.js";

import { customElement, property } from "lit/decorators.js";

declare global {
  interface HTMLElementTagNameMap {
    "mwc-menu": MenuBase;
  }
}

export class Menu extends MenuBase {
  constructor() {
    super();
  }

  @property({ attribute: "ssssssssssssad" })
  ssssssssssssad: String = "";

  static styles: import("lit").CSSResult[];
}
