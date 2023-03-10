/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { customElement, property } from "lit/decorators.js";

import { Icon } from "./lib/icon.js";
import { styles } from "./lib/icon-styles.css.js";

declare global {
  interface HTMLElementTagNameMap {
    "md-icon": MdIcon;
  }
}

/**
 * @soyCompatible
 * @final
 * @suppress {visibility}
 */
@customElement("md-icon")
export class MdIcon extends Icon {
  @property({ attribute: "iconProperFromIcon" })
  iconProperFromIcon: String = "";

  static override styles = [styles];
}
