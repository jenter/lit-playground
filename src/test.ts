import * as ts from 'typescript';

const file = './src/dog-element.ts';

let program = ts.createProgram([file], {
  allowJs: true,
  target: ts.ScriptTarget.ES2015,
  module: ts.ModuleKind.CommonJS,
});
const sourceFile = program.getSourceFile(file);
// const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

const classDeclaration = sourceFile?.statements.find((statement) => {
  return ts.isClassDeclaration(statement);
}) as ts.ClassDeclaration;


// console.log('🚀 ~ classDeclaration:', classDeclaration);

if (!classDeclaration) {
  console.error('No class found in file');
}

const markingclassDeclaration = classDeclaration as ts.ClassDeclaration;
// console.log('🚀 ~ TRACKING THE CLASSES ++', markingclassDeclaration);

let heritageClause: ts.HeritageClause | undefined = undefined;

ts.forEachChild(classDeclaration, (node) => {
  if (
    ts.isHeritageClause(node) &&
    node.token === ts.SyntaxKind.ExtendsKeyword
  ) {
    heritageClause = node as ts.HeritageClause;
  }
});

const programLength = Boolean(program.getSemanticDiagnostics().length);
const isHeritageClause = heritageClause && ts.isHeritageClause(heritageClause);


// console.log('🚀 ~ TRACKING THE CLASSES ++', heritageClause);


if (isHeritageClause && programLength) {

  const checker = program.getTypeChecker();

  const heritageClassTypes = heritageClause?.types;
  const mrText = heritageClassTypes[0];

  // ts.forEachChild(sourceFile, (node) => {
  //   // console.log(node.kind);
  //   // console.log(node.pos);
  //   // console.log(node.end);
  //   console.log(">>>>>> ", node.getText());
  // });

  // console.log('🚀 ~ heritageClassTypes', mrText);

  if (classDeclaration) {

    const one = classDeclaration.name?.getText();
    const two = classDeclaration.members.map((m) => {
      const tester = m as ts.PropertyDeclaration;
      return tester;
    })

    const constructorTest = classDeclaration.members.find(
      (member) => ts.isConstructorDeclaration(member)
    ) as ts.ConstructorDeclaration;



    const testConstructorAsStatement = constructorTest?.body?.statements[0] as ts.ExpressionStatement;
    const callExpression = testConstructorAsStatement.expression as ts.CallExpression;
    const superExpression = callExpression?.expression as ts.SuperExpression;
    //  as ts.SyntaxKind.SuperKeyword

    const isThisCallExct = ts.isCallExpression(callExpression);

    const isHelloIsThisRirgh = ts.isExpressionStatement(testConstructorAsStatement);
    const maybe = ts.isConstructorDeclaration(testConstructorAsStatement); // ts.isSuperExpression(statement.expression)

    //  const testingOBjLit = ts.isObjectLiteralExpression(superExpression)

    const isExpressionASuper = Boolean(superExpression.kind === ts.SyntaxKind.SuperKeyword);

    console.log("==>>>>", isExpressionASuper);

    // superExpression?.body?.statements.forEach((statement) => {
    //   console.log('🚀 ~ file: test.ts:94 ~ testConstructorAsStatement?.body?.statements.forEach ~ statement:', statement);
    //   const checkIT = statement as ts.ExpressionStatement;
    //   console.log('🚀 ~ file: checkIT:', checkIT);
    // });


    const baseType = program.getTypeChecker().getTypeAtLocation(superExpression);
    console.log('🚀 ~ file: test.ts:99 ~ baseType:', baseType);

    // Get the properties of the base class
    const baseProperties = baseType.getProperties();

    console.log(baseProperties.length);

    // LIT main properties
    baseProperties.forEach((property) => {
      const getName = property.getName();
      const getFlags = ts.SymbolFlags[property.getFlags()]
      const getTypes = property.getDeclarations()?.map((d) => d.getText());
      if (getName == 'properties') {
        console.log(getName);
      }
    });

    ////

    heritageClassTypes.forEach((type: Object) => {
      const getTypeFromTypeNode = checker.getTypeFromTypeNode(type);
      // const getMembers = getTypeFromTypeNode?.members;

      const members = getTypeFromTypeNode.getProperties();



      members.forEach((property) => {
        const currentProperty: ts.Symbol = property as ts.Symbol;

        const getName: string = currentProperty.getName() as string;

        const getPropertyDeclaration = currentProperty?.getDeclarations();
        const getPropertyValueDeclaration = currentProperty?.valueDeclaration as ts.PropertyDeclaration;



        /**
         * I still need a way to get current property from current class 
         */

        if (getName == 'animalHead' || getName == 'animalToes' || getName == 'dogHead') {

          const type = program.getTypeChecker().getTypeAtLocation(getPropertyValueDeclaration);

          if (getPropertyValueDeclaration.initializer && ts.isStringLiteral(getPropertyValueDeclaration.initializer)) {
            console.log(`Default value: ${getPropertyValueDeclaration.initializer.text}`);
          }
          // I can get default value like this ^ 


          const isDeclaredInThisClass = type.symbol && type.symbol.valueDeclaration === getPropertyValueDeclaration;
          const message = isDeclaredInThisClass ? 'Declared in this class' : 'Inherited from superclass';
          console.log(`Property ${getName} - ${message}`);
        }


        console.log('🚀 ~ file: test.ts:127 ~ getMembers.forEach ~ getName:', getName);

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