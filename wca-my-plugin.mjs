export function myPlugin() {
  return {
    name: "my-plugin",
    analyzePhase({ ts, node }) {
      // , moduleDoc, context
      switch (node.kind) {
        case ts.SyntaxKind.ClassDeclaration:
          console.log("🚀 ~ node : ", node);
      }
    },
  };
}
