/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { property } from "lit/decorators.js";

import { html, LitElement, TemplateResult } from "lit";

/** @soyCompatible */
export class Icon extends LitElement {
  /** @soyTemplate */

  @property({ attribute: "iconPropFromLibIcon" })
  iconPropFromLibIcon: String = "";

  protected override render(): TemplateResult {
    return html`<span><slot></slot></span>`;
  }
}
