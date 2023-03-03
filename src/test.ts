import * as ts from "typescript";
// import * as utils from "tsutils";
import * as fs from "fs";
// import * as LitAnalyzer from "lit-analyzer";
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
// unused references for later, probably throwaway

/*

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

const getSuperContructor = (availableMembers: any) => {
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

  return getConstructor;
};

const baseType = program.getTypeChecker().getTypeAtLocation(superExpression);

const checkFlags = ts.getCombinedModifierFlags(property?.declarations[0]);

if (checkFlags !== 0) {
  const isPublic = (checkFlags & ts.ModifierFlags.Public) !== 0;

  // Check if the node is private
  const isPrivate = (checkFlags & ts.ModifierFlags.Private) !== 0;

  // Check if the node is protected
  const isProtected = (checkFlags & ts.ModifierFlags.Protected) !== 0;

  // Check if the node is static
  const isStatic = (checkFlags & ts.ModifierFlags.Static) !== 0;

  // Check if the node is async
  const isAsync = (checkFlags & ts.ModifierFlags.Async) !== 0;

  // Check if the node is readonly
  const isReadonly = (checkFlags & ts.ModifierFlags.Readonly) !== 0;
}

*/

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

// ////////////////////////////////////////////////////////////////////
// JUST SHOWING YOU GENERAL BREAKPOINTS AND THOUGHTS 
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
const appropriateMembersAsNodes = currentClassMembers.filter(
  (member: ts.Node) =>
    Boolean(ts.isPropertyDeclaration(member) || ts.isMethodDeclaration(member))
);

const constuctJsonFromMembers = (availableNodes: any) => {
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

const testingCurrentClassJSON = constuctJsonFromMembers(currentNodesToPrint);
const jsonString = JSON.stringify(testingCurrentClassJSON, null, 2);

// Write the string to a file
fs.writeFileSync("src/test/currentClass.json", jsonString, {
  encoding: "utf8",
});

/**
 * Kevin question on this breakpoint:
 * this is just targetting the current class, do we even need this for comparison if the proceeding has all the things?
 * ... maybe so, but have a look
 *
 * constuctJsonFromMembers is really messy, and I will clean up it, but let me know what other information could be useful.
 *
 */

console.log("🚀 completed JSON from just current class: dog-element.ts 🚀");

////////////////////////////////////////////////////////////////////////
// Heritage Class info /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

if (!isHeritageClause || !programLength) {
  throw new Error("missing heritage clause or program length");
}

const heritageClassTypes = heritageClause?.types;

const getTypeOfHeritageAtLocation = checker.getTypeAtLocation(
  heritageClassTypes[0]
);
const getPropertiesOfTypeHeritage = checker.getPropertiesOfType(
  getTypeOfHeritageAtLocation
);

const heritageClauseProperties = getPropertiesOfTypeHeritage
  .filter((property) => {
    const declarations = property.getDeclarations();
    if (!declarations?.length) return false;

    const declarationInformation = declarations[0];

    const getSourceFile = declarationInformation.getSourceFile();
    const getSourceFileName = getSourceFile.fileName;

    const validatePropertyOrMethod = Boolean(
      ts.isPropertyDeclaration(declarationInformation) ||
        ts.isMethodDeclaration(declarationInformation)
    );

    if (!validatePropertyOrMethod) return false;
    // if (!property?.parent) return false;

    return true;
  })
  .map((property) => {
    const declarations = property.getDeclarations();
    return (
      declarations &&
      (declarations.find((declaration) => {
        return declaration;
      }) as ts.PropertyDeclaration)
    );
  });

const constructHeritageMapping = (availableNodes: any) => {
  const buildJsonRefs = availableNodes.map((node: any) => {
    const nodeKind = ts.SyntaxKind[node.kind];
    const nodeText = node.getText();
    const name: string = node.name.getText() as string;

    const getSourceFile = node.getSourceFile();
    const getSourceFileName = getSourceFile.fileName;
    const isDeclarationFile = getSourceFile.isDeclarationFile;

    // console.log("🚀 getSourceFileName: ", getSourceFileName);

    return {
      name,
      nodeKind,
      nodeText,
      getSourceFileName,
      isDeclarationFile,
    };
  });

  return buildJsonRefs;
};

const HeritageClauseMapping = constructHeritageMapping(
  heritageClauseProperties
);

/**
 * Kevin question on this breakpoint:
 * How do you feel about us using looping thru the *.ds.ts files just for now, or would we be missing anything useful?
 *
 * HeritageClauseMapping has some initial values, but let me know what other information could be useful.
 *
 */

const jsonStringHeritage = JSON.stringify(HeritageClauseMapping, null, 2);

// Write the string to a file
fs.writeFileSync("src/test/heritageClass.json", jsonStringHeritage, {
  encoding: "utf8",
});

console.log("🚀 completed JSON from Heritage class of all the things 🚀");
