import * as ts from 'typescript';
var file = './src/dog-element.ts';
var program = ts.createProgram([file], {
    allowJs: true,
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS
});
var sourceFile = program.getSourceFile(file);
// const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
var CurrentClass = sourceFile === null || sourceFile === void 0 ? void 0 : sourceFile.statements.find(function (statement) {
    return ts.isClassDeclaration(statement);
});
// console.log('🚀 ~ CurrentClass:', CurrentClass);
if (!CurrentClass) {
    console.error('No class found in file');
}
var markingCurrentClass = CurrentClass;
// console.log('🚀 ~ TRACKING THE CLASSES ++', markingCurrentClass);
var heritageClause = undefined;
ts.forEachChild(CurrentClass, function (node) {
    if (ts.isHeritageClause(node) &&
        node.token === ts.SyntaxKind.ExtendsKeyword) {
        heritageClause = node;
    }
});
var programLength = Boolean(program.getSemanticDiagnostics().length);
var isHeritageClause = heritageClause && ts.isHeritageClause(heritageClause);
// console.log('🚀 ~ TRACKING THE CLASSES ++', heritageClause);
if (isHeritageClause && programLength) {
    // const checker = program.getTypeChecker();
    // const heritageClassTypes = heritageClause?.types;
    // console.log('🚀 ~ heritageClassTypes', heritageClassTypes);
    // if (typeof heritageClassTypes == 'object') {
    //   heritageClassTypes.forEach((type: Object) => {
    //     const getTypeFromTypeNode = checker.getTypeFromTypeNode(type);
    //     const getMembers = getTypeFromTypeNode?.members;
    //     const properties = Array.from(getMembers.values());
    //     properties.forEach((property) => {
    //       const currentProperty: ts.Symbol = property as ts.Symbol;
    //       const getName: string = currentProperty.getName() as string;
    //       if (!testingSomeInArray.includes(getName)) return;
    //       const valueDeclaration = currentProperty?.valueDeclaration?.getText();
    //       console.log('🚀 -- valueDeclaration Text -- 🚀 ', valueDeclaration);
    //       console.log('🚀 currentProperty:', currentProperty);
    //     });
    //   });
    // }
}
else {
    console.error('No heritageClause found ');
}
