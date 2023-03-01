import { myPlugin } from "./wca-my-plugin.mjs";

export default {
  globs: [
    "src/animal-element.ts",
    "src/dog-element.ts",
    "src/organism-element.ts",
    "src/mwc-menu.d.ts",
  ],
  dependencies: true,
  packagejson: true,
  litelement: true,
  // dev: true,
  plugins: [
    /** You can now pass the typeChecker to your plugins */
    myPlugin(),
  ],
};
