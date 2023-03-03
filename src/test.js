var _a, _b;
import * as ts from "typescript";
var file = "./src/dog-element.ts";
var program = ts.createProgram([file], {
  allowJs: true,
  target: ts.ScriptTarget.ES2015,
  module: ts.ModuleKind.CommonJS,
});
var sourceFile = program.getSourceFile(file);
// const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
var classDeclaration =
  sourceFile === null || sourceFile === void 0
    ? void 0
    : sourceFile.statements.find(function (statement) {
        return ts.isClassDeclaration(statement);
      });
// console.log('🚀 ~ classDeclaration:', classDeclaration);
if (!classDeclaration) {
  console.error("No class found in file");
}
var markingclassDeclaration = classDeclaration;
// console.log('🚀 ~ TRACKING THE CLASSES ++', markingclassDeclaration);
var heritageClause = undefined;
ts.forEachChild(classDeclaration, function (node) {
  if (
    ts.isHeritageClause(node) &&
    node.token === ts.SyntaxKind.ExtendsKeyword
  ) {
    heritageClause = node;
  }
});
var programLength = Boolean(program.getSemanticDiagnostics().length);
var isHeritageClause = heritageClause && ts.isHeritageClause(heritageClause);
// console.log('🚀 ~ TRACKING THE CLASSES ++', heritageClause);
if (isHeritageClause && programLength) {
  var checker_1 = program.getTypeChecker();
  var heritageClassTypes =
    heritageClause === null || heritageClause === void 0
      ? void 0
      : heritageClause.types;
  var mrText = heritageClassTypes[0];
  // ts.forEachChild(sourceFile, (node) => {
  //   // console.log(node.kind);
  //   // console.log(node.pos);
  //   // console.log(node.end);
  //   console.log(">>>>>> ", node.getText());
  // });
  // console.log('🚀 ~ heritageClassTypes', mrText);
  if (classDeclaration) {
    var one =
      (_a = classDeclaration.name) === null || _a === void 0
        ? void 0
        : _a.getText();
    var two = classDeclaration.members.map(function (m) {
      var tester = m;
      return tester;
    });
    var constructorTest = classDeclaration.members.find(function (member) {
      return ts.isConstructorDeclaration(member);
    });
    var testConstructorAsStatement =
      (_b =
        constructorTest === null || constructorTest === void 0
          ? void 0
          : constructorTest.body) === null || _b === void 0
        ? void 0
        : _b.statements[0];
    var callExpression = testConstructorAsStatement.expression;
    var superExpression =
      callExpression === null || callExpression === void 0
        ? void 0
        : callExpression.expression;
    //  as ts.SyntaxKind.SuperKeyword
    var isThisCallExct = ts.isCallExpression(callExpression);
    var isHelloIsThisRirgh = ts.isExpressionStatement(
      testConstructorAsStatement
    );
    var maybe = ts.isConstructorDeclaration(testConstructorAsStatement); // ts.isSuperExpression(statement.expression)
    //  const testingOBjLit = ts.isObjectLiteralExpression(superExpression)
    var isExpressionASuper = Boolean(
      superExpression.kind === ts.SyntaxKind.SuperKeyword
    );
    console.log("==>>>>", isExpressionASuper);
    // superExpression?.body?.statements.forEach((statement) => {
    //   console.log('🚀 ~ file: test.ts:94 ~ testConstructorAsStatement?.body?.statements.forEach ~ statement:', statement);
    //   const checkIT = statement as ts.ExpressionStatement;
    //   console.log('🚀 ~ file: checkIT:', checkIT);
    // });
    var baseType = program.getTypeChecker().getTypeAtLocation(superExpression);
    console.log("🚀 ~ file: test.ts:99 ~ baseType:", baseType);
    // Get the properties of the base class
    var baseProperties = baseType.getProperties();
    console.log(baseProperties.length);
    // LIT main properties
    baseProperties.forEach(function (property) {
      var _a;
      var getName = property.getName();
      var getFlags = ts.SymbolFlags[property.getFlags()];
      var getTypes =
        (_a = property.getDeclarations()) === null || _a === void 0
          ? void 0
          : _a.map(function (d) {
              return d.getText();
            });
      if (getName == "properties") {
        console.log(getName);
      }
    });
    ////
    heritageClassTypes.forEach(function (type) {
      var getTypeFromTypeNode = checker_1.getTypeFromTypeNode(type);
      // const getMembers = getTypeFromTypeNode?.members;
      var members = getTypeFromTypeNode.getProperties();
      members.forEach(function (property) {
        var currentProperty = property;
        var getName = currentProperty.getName();
        var getPropertyDeclaration =
          currentProperty === null || currentProperty === void 0
            ? void 0
            : currentProperty.getDeclarations();
        var getPropertyValueDeclaration =
          currentProperty === null || currentProperty === void 0
            ? void 0
            : currentProperty.valueDeclaration;
        /**
         * I still need a way to get current property from current class
         */
        if (
          getName == "animalHead" ||
          getName == "animalToes" ||
          getName == "dogHead"
        ) {
          var type_1 = program
            .getTypeChecker()
            .getTypeAtLocation(getPropertyValueDeclaration);
          if (
            getPropertyValueDeclaration.initializer &&
            ts.isStringLiteral(getPropertyValueDeclaration.initializer)
          ) {
            console.log(
              "Default value: ".concat(
                getPropertyValueDeclaration.initializer.text
              )
            );
          }
          // I can get default value like this ^
          var isDeclaredInThisClass =
            type_1.symbol &&
            type_1.symbol.valueDeclaration === getPropertyValueDeclaration;
          var message = isDeclaredInThisClass
            ? "Declared in this class"
            : "Inherited from superclass";
          console.log("Property ".concat(getName, " - ").concat(message));
        }
        console.log(
          "🚀 ~ file: test.ts:127 ~ getMembers.forEach ~ getName:",
          getName
        );
      });
    });
    // const properties = Array.from(members.values());
    // properties.forEach((property) => {
    //   const currentProperty: ts.Symbol = property as ts.Symbol;
    //   const getName: string = currentProperty.getName() as string;
    //   const valueDeclaration = currentProperty?.valueDeclaration?.getText();
    //   // console.log('🚀 -- valueDeclaration Text -- 🚀 ', valueDeclaration);
    //   if (getName == 'animalHead' || getName == 'animalToes' || getName == 'dogHead') {
    //     const declaration = currentProperty?.getDeclarations();
    //     const symbol = program.getTypeChecker().getSymbolAtLocation(currentProperty);
    //     // const type = program.getTypeChecker().getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
    //     // console.log(`Property name: ${symbol.name}`);
    //     // if (type && type.isStringLiteral()) {
    //     //   console.log(`Default value: ${type.value}`);
    //     // }
    //     // if (symbol.getDocumentationComment()) {
    //     //   console.log(`Documentation: ${symbol.getDocumentationComment()}`);
    //     // }
    //     const getTypeOfSymbolAtLocation = program.getTypeChecker().getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
    //     console.log('🚀 symbol:', symbol);
    //   }
    // });
    // let figureoutThis = '';
    // const constructor = two[0];
    // const isLitElement = heritageClause?.types?.some(
    //   (type) =>
    //     ts.isIdentifier(type.expression) &&
    //     type.expression.getText() === 'LitElement'
    // );
    // console.log('🚀 ~ file: test.ts:79 ~ isLitElement:', isLitElement);
    // constructor?.body?.statements.forEach((statement) => {
    //   const checkstatement = statement as ts.ExpressionStatement;
    //   const thisisTrue = ts.isExpressionStatement(statement);
    //   if (ts.isExpressionStatement(statement)) {
    //     const expression = statement.expression;
    //     const isAnother = ts.isCallExpression(expression)
    //     const checkSuper = ts.isAsExpression(expression);
    //     console.log('🚀 ~ getText :', expression.getText());
    //     if (
    //       ts.isCallExpression(expression)
    //     ) {
    //       // Access the arguments of the super() call
    //       const expressionArguments = expression.arguments;
    //       const getLengthOf = expressionArguments.length;
    //       // const letArg = expression;
    //       console.log('xxx', expressionArguments);
    //       console.log('getLengthOf', getLengthOf);
    //       expressionArguments.forEach((arg) => {
    //         // console.log(`Kind: ${arg.kind}`);
    //         // console.log(`Text: ${arg.getText()}`);
    //         // console.log(`Type: ${program.getTypeChecker().getTypeAtLocation(arg)}`);
    //         const getKind = arg.kind;
    //         const getText = arg.getText();
    //         console.log(getText, getKind);
    //       });
    //     }
    //   }
    // });
  }
  //   if (typeof heritageClassTypes == 'object') {
  //     heritageClassTypes.forEach((type: Object) => {
  //       const getTypeFromTypeNode = checker.getTypeFromTypeNode(type);
  //       const getMembers = getTypeFromTypeNode?.members;
  //       const properties = Array.from(getMembers.values());
  //       properties.forEach((property) => {
  //         const currentProperty: ts.Symbol = property as ts.Symbol;
  //         const getName: string = currentProperty.getName() as string;
  //         const valueDeclaration = currentProperty?.valueDeclaration?.getText();
  //         // console.log('🚀 -- valueDeclaration Text -- 🚀 ', valueDeclaration);
  //         // console.log('🚀 currentProperty:', currentProperty);
  //       });
  //     });
  //   }
  // } else {
  //   console.error('No heritageClause found ');
}
