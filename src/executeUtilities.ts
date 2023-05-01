import { retrieveExternalHeritageInfo } from "./analyzerUtilities";
import * as fs from "fs";

const fireItTest = (theFile: string, externalPackageNamespace: string) => {
  const testingAllJson = retrieveExternalHeritageInfo(theFile, externalPackageNamespace);

  const stringifyResults = JSON.stringify(testingAllJson, null, 2);
  fs.writeFileSync("./testing-json.json", stringifyResults, {
    encoding: "utf8"
  });

  console.log("🚀 🚀 🚀 completed 🚀 🚀 🚀");

  return;
};

fireItTest("./src/organism-element.ts", "@material");
