import { traverseExternal } from "./wca-my-plugin.mjs";

export default {
  globs: ["src/**/*.ts"],
  dependencies: true,
  packagejson: true,
  litelement: true,
  // dev: true,
  plugins: [
    /* 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 🚀 */
    traverseExternal("@material")
  ]
};
