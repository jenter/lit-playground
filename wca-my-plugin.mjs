/*

"declarations": [{
        ... 
        
        MEMBERS I NEED... 
        type
        name
        comments (probably not)
        type
        default 
        attributes
        parameters (just method)


        UNDER MEMBERS... 
        [ ] change kind from field to method
        [ ] "default" is now "parameters"

        UNDER ATTRIBUTES...
        [ ] "fieldName" is now "methodName"


          "members": [
            {
              "kind": "field",
              "name": "",
              "description": "",
              "type": {  "text": "" },
              "default": "",
              "attribute": "animal-head",
              "reflects": ???
            },
            {
              "kind": "method",
              "name": "",
              "parameters": [
                {
                  "name": "",
                  "type": {
                    "text": ""
                  }
                }
              ],
              "description": ""
            },

*/

const validateExternalReference = (externalPackageName, ts, node, context) => {
  if (!node?.heritageClauses || !context) return false;

  for (const clause of node.heritageClauses) {
    if (clause.token === ts.SyntaxKind.ImplementsKeyword || clause.token === ts.SyntaxKind.ExtendsKeyword) {
      const extendedType = clause.types[0];
      const extendedClassName = extendedType.expression.getText();

      const validateImport = context.imports.find((importName) => importName.name === extendedClassName);
      const isImportExternalToProject = Boolean(validateImport?.importPath.includes(externalPackageName));

      console.log(`Class "${node.name.text}" extends class "${extendedClassName}".`);
      return isImportExternalToProject;
    }
  }

  return "";
};

export function traverseExternal(externalPackageName = false) {
  return {
    name: "my-plugin",
    analyzePhase({ ts, node, moduleDoc, context }) {
      // Check if the current node is a class declaration
      if (ts.isClassDeclaration(node) && externalPackageName) {
        // validate external import references according to pacakge namespecing (i.e. @material)
        const isExternalReference = validateExternalReference(externalPackageName, ts, node, context);
        if (!isExternalReference) return;

        // Find the class in the moduleDoc
        const declarationOfClass = moduleDoc.declarations.find(
          (declaration) => declaration.kind === "class" && declaration.name === node.name.getText()
        );

        const classModuleDocPath = moduleDoc.path;

        // - - - - - - -
        if (declarationOfClass) {
          const extraMember = {
            kind: "field",
            name: "extraProperty",
            description: "Description of the extra property",
            type: { text: "string" },
            default: "default-value"
          };

          // Initialize the members array if it doesn't exist
          if (!declarationOfClass.members) {
            declarationOfClass.members = [];
          }

          // Add the extra member to the members array
          declarationOfClass.members.push(extraMember);

          // Add your extra attribute here
          const extraAttribute = {
            name: "extra-property",
            description: "Description of the extra attribute",
            fieldName: "extraProperty", // The property name in the class that corresponds to this attribute
            type: { text: "string" },
            default: "default-value"
          };

          // Initialize the attributes array if it doesn't exist
          if (!declarationOfClass.attributes) {
            declarationOfClass.attributes = [];
          }

          // Add the extra attribute to the attributes array
          declarationOfClass.attributes.push(extraAttribute);
        }

        // let test;
      }

      // , moduleDoc, context
      // switch (node.kind) {
      //   case ts.SyntaxKind.ClassDeclaration:
      //     console.log("🚀 ~ node : ", node);
      //     const declarationOfClass = moduleDoc.declarations.find((declaration) => declaration.kind === "class" && declaration.name === node.name.getText());

      //     ///
      //     let e;
      // }
    }
  };
}
