import * as ts from "typescript";
// import * as utils from "tsutils";
import * as fs from "fs";
import * as LitAnalyzer from "lit-analyzer";
// import * as getDeclaration from "lit-analyzer/lib/lit-analyzer-utils";

// example final inherited class ..
const file = "./src/dog-element.ts";

const program = ts.createProgram([file], {
  allowJs: true,
  target: ts.ScriptTarget.ES2015,
  module: ts.ModuleKind.CommonJS,
});
const sourceFile = program.getSourceFile(file);
const classDeclaration = sourceFile?.statements.find((statement) => {
  return ts.isClassDeclaration(statement);
}) as ts.ClassDeclaration;

if (!classDeclaration) {
  throw new Error("No class found in file");
}

// ////////////////////////////////////////////////////////////////////

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
const checker = program.getTypeChecker();

const constructorTest = classDeclaration.members.find((member) =>
  ts.isConstructorDeclaration(member)
) as ts.ConstructorDeclaration;

const testConstructorAsStatement = constructorTest?.body
  ?.statements[0] as ts.ExpressionStatement;

const callExpression =
  testConstructorAsStatement.expression as ts.CallExpression;

const superExpression = callExpression?.expression as ts.SuperExpression;

const isExpressionASuper = Boolean(
  superExpression.kind === ts.SyntaxKind.SuperKeyword
);

const myTargettedClass = classDeclaration?.name as ts.Identifier;

// ////////////////////////////////////////////////////////////////////

if (!isHeritageClause || !programLength) {
  throw new Error("missing heritage clause or program length");
}

const baseType = program.getTypeChecker().getTypeAtLocation(superExpression);

const getSuperContructor = (availableMembers: any) => {
  //
  const getConstructor = availableMembers.find((member: any) =>
    ts.isConstructorDeclaration(member)
  ) as ts.ConstructorDeclaration;

  const confirmConstructorBodyFunction = getConstructor.body as ts.FunctionBody;
  const superExpressionCallable = confirmConstructorBodyFunction
    ?.statements[0] as ts.ExpressionStatement;

  if (superExpressionCallable.kind !== ts.SyntaxKind.ExpressionStatement) {
    throw new Error("missing expression statement match");
  }

  const callExpression =
    superExpressionCallable.expression as ts.CallExpression;
  const superExpression = callExpression?.expression as ts.SuperExpression;

  if (superExpression.getText() !== "super") {
    throw new Error("missing super expression as super() called.");
  }

  // return node for filtering and reference later.
  return getConstructor;
};

const classAvailableMemberNodes = (availableMembers: ts.NodeArray<ts.Node>) => {
  return availableMembers
    .filter((member: ts.Node) =>
      // filter as property declaration or method declaration
      Boolean(
        ts.isPropertyDeclaration(member) || ts.isMethodDeclaration(member)
      )
    )
    .filter((member: ts.Node) => {
      // filter out native names like render, connectedCallback, etc.
      if (ts.isPropertyDeclaration(member)) return true;
      const memberNode = member as ts.MethodDeclaration;
      const methodName = memberNode?.name?.getText() as string;
      return Boolean(methodName && methodName !== "render");
    });
};

const currentClassMembers = classDeclaration.members as ts.NodeArray<ts.Node>;
const currentNodesToPrint = classAvailableMemberNodes(currentClassMembers);

const constuctJsonFromMembers = (availableNodes: any) => {
  console.log(availableNodes);

  const buildJsonRefs = availableNodes.map((node: any) => {
    const nodeKind = ts.SyntaxKind[node.kind];
    const nodeText = node.getText();
    const name: string = node.name.getText() as string;
    const getInitializerForDefuault =
      node?.initializer?.getText() ?? "undefined";

    const availableModifiers: any = [];

    // unused but marking for now for future reference.
    const nodeFullText = node.getFullText();
    const getTypeAtLocation = program.getTypeChecker().getTypeAtLocation(node);
    const getSymbol = (getTypeAtLocation?.symbol as ts.Symbol) ?? undefined;
    const getSymbolsValueDeclaration =
      (getSymbol?.valueDeclaration as ts.PropertyDeclaration) ?? undefined;
    //////

    if (
      ts.isPropertyDeclaration(node) &&
      (node?.modifiers as ts.NodeArray<ts.Node>)
    ) {
      // TODO: obviously need to find a better way to get the decorator node.
      const modifierProperties = node?.modifiers as any;
      if (!modifierProperties) return;
      const expressionOnNode = modifierProperties.find((property: any) =>
        ts.isDecorator(property)
      );
      if (!expressionOnNode) return;

      const propertiesOfExpression =
        expressionOnNode?.expression?.arguments[0]?.properties ?? false;

      const createMapOfModifiers = propertiesOfExpression.map(
        (property: any) => {
          const propertyName = property.name.getText();
          const propertyValue = property.initializer.getText();
          return { [propertyName]: propertyValue };
        }
      );

      if (createMapOfModifiers.length) {
        availableModifiers.push(...createMapOfModifiers);
      }
    }

    return {
      name,
      nodeKind,
      nodeText,
      default: getInitializerForDefuault,
      modifiers: availableModifiers ?? undefined,
    };
  });

  return buildJsonRefs;
};

const superMemberNodeReference = getSuperContructor(currentClassMembers);

const appropriateMembersAsNodes = currentClassMembers.filter(
  (member: ts.Node) =>
    Boolean(ts.isPropertyDeclaration(member) || ts.isMethodDeclaration(member))
);

const testingCurrentClassJSON = constuctJsonFromMembers(currentNodesToPrint);
const jsonString = JSON.stringify(testingCurrentClassJSON, null, 2);

// Write the string to a file
fs.writeFileSync("src/test/currentClass.json", jsonString, {
  encoding: "utf8",
});

console.log("🚀 completed JSON from current class");

// console.log("🚀 THIS IS SYNTAX KIND >  ", ts.SyntaxKind[myTargettedClass.kind]);
// console.log("🚀 hello :", superMemberNodeReference);

////////////////////////////////////////////////////////////////////////
// Heritage Class info /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

// @ts-ignore
const heritageClassTypes = heritageClause?.types;

heritageClassTypes.forEach((type: Object) => {
  // @ts-ignore
  const getTypeFromTypeNode = checker.getTypeFromTypeNode(type);

  const members = getTypeFromTypeNode.getProperties();

  members.forEach((property) => {
    const currentProperty: ts.Symbol = property as ts.Symbol;

    const getName: string = currentProperty.getName() as string;

    const getPropertyDeclaration = currentProperty?.getDeclarations();
    const getPropertyValueDeclaration =
      currentProperty?.valueDeclaration as ts.PropertyDeclaration;

    /**
     * I still need a way to get current property from current class
     */
    if (
      getName == "dogHead" ||
      getName == "isOpen" ||
      getName == "toggle" ||
      getName == "animalHead" ||
      getName == "animalToes" ||
      getName == "dogHead"
    ) {
      const type = program
        .getTypeChecker()
        .getTypeAtLocation(getPropertyValueDeclaration);

      if (
        getPropertyValueDeclaration.initializer &&
        ts.isStringLiteral(getPropertyValueDeclaration.initializer)
      ) {
        console.log(
          `Default value: ${getPropertyValueDeclaration.initializer.text}`
        );
      }
      // I can get default value like this ^

      const isDeclaredInThisClass =
        type.symbol &&
        type.symbol.valueDeclaration === getPropertyValueDeclaration;
      const message = isDeclaredInThisClass
        ? "Declared in this class"
        : "Inherited from superclass";
      console.log(`Property ${getName} - ${message}`);

      const getNodeFromSymbol = currentProperty?.declarations;
      // console.log("🚀 ~ bol:", getNodeFromSymbol?.getText());
      // const valueDeclaration = currentProperty?.valueDeclaration?.getText();

      console.log(
        "🚀 THIS IS SYNTAX KIND: ",
        ts.SyntaxKind[getNodeFromSymbol[0].kind]
      );

      // MethodDeclaration + PropertyDeclaration
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
