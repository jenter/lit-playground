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
  allowSyntheticDefaultImports: true
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

////////////////////////////////////////////////////////////////////////

/**

FOR LATER ...... 

// Write the string to a file
fs.writeFileSync("src/test/currentClass.json", jsonString, {
  encoding: "utf8",
});

console.log("🚀 completed JSON from current class 🚀");

 */

////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////
// Heritage Class info /////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////// 

if (!isHeritageClause || !programLength) {
  throw new Error("missing heritage clause or program length");
}

// @ts-ignore
const heritageClassTypes = heritageClause?.types;

const getTypeOfHeritageAtLocation = checker.getTypeAtLocation(
  heritageClassTypes[0]
);
const getPropertiesOfTypeHeritage = checker.getPropertiesOfType(
  getTypeOfHeritageAtLocation
);

const excludedModifiers = ["private", "protected", "static", "readonly"];
// here I get the whole big ole array of 400 things and can find source.... 
///.... so I can make this into a scrubber..
// so I need to just set it ffrom the @nodeModules location at the bottom

const heritageClauseProperties = getPropertiesOfTypeHeritage
  .filter((property) => {
    const declarations = property.getDeclarations();
    if (!declarations?.length) return false;

    const declarationInformation = declarations[0];


    // here I just check for heritageClauses.. 
    const aahasAHeritageClause = Boolean(declarationInformation?.parent?.heritageClauses);
    const aaaHasThevAlue = property?.valueDeclaration;

    if (aahasAHeritageClause && aaaHasThevAlue && aaaHasThevAlue.getSourceFile().fileName && aaaHasThevAlue.getSourceFile().fileName.includes('node_modules')) { // aahasAHeritageClause
      const aaaaFindHeritageStuff = declarationInformation?.parent?.heritageClauses[0];
      // const aaagetSourceFile = declarationInformation.getSourceFile();
      const aaaaklll = aaaHasThevAlue.getSourceFile().fileName;
      let hello;
    }

    const getSourceFile = declarationInformation.getSourceFile();
    const getSourceFileName = getSourceFile.fileName;
    const isDeclarationFile = getSourceFile?.isDeclarationFile;

    const validatePropertyOrMethod = Boolean(
      ts.isPropertyDeclaration(declarationInformation) ||
      ts.isMethodDeclaration(declarationInformation)
    );

    if (!validatePropertyOrMethod) return false;

    // skip for native LIT declarations
    if (isDeclarationFile) {
      const isLitDeclaration = Boolean(getSourceFileName.includes('node_modules') && (getSourceFileName.includes('@lit') || getSourceFileName.includes('lit-element')));
      if (isLitDeclaration) return false;
    }

    const modifiers = ts.canHaveModifiers(declarationInformation) ? ts.getModifiers(declarationInformation) : undefined;

    if (!modifiers) return true;

    const textValuesIdentifiers = modifiers.map((modifier) => {
      return modifier.getText();
    });

    const skipDueToModifier = textValuesIdentifiers.some((textValue) => {
      return excludedModifiers.includes(textValue);
    });

    if (skipDueToModifier) return false;

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

function findJsFileForDeclaration(declarationFile: string): string | null {
  const jsFile = declarationFile.replace(/\.d\.ts$/, '.js');
  if (ts.sys.fileExists(jsFile)) {
    return jsFile;
  }
  return null;
}

function searchConstructorAssignedValuesinJsFile(name: string, node: any, sourceFile: any) {
  const assignmentName = name;

  const programJs = ts.createProgram([sourceFile], {
    allowJs: true,
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
    allowSyntheticDefaultImports: true
  });

  const sourceFileJs = programJs.getSourceFile(sourceFile);
  const classDeclarationJs = sourceFileJs?.statements.find((statement) => {
    return ts.isClassDeclaration(statement);
  }) as ts.ClassDeclaration;

  const constructorTestJs = classDeclarationJs.members.find((member) =>
    ts.isConstructorDeclaration(member)
  ) as ts.ConstructorDeclaration;

  const checkBodyStatements = constructorTestJs?.body?.statements;

  if (!checkBodyStatements) return false;

  const testingStatements = constructorTestJs?.body?.statements.filter((statement) => {
    if (!ts.isExpressionStatement(statement) || !ts.isBinaryExpression(statement.expression)) return false;
    const assignment = statement.expression;
    return Boolean(ts.isPropertyAccessExpression(assignment?.left) && assignment?.left?.name?.text === assignmentName)
  }) as ts.ExpressionStatement[];

  if (!testingStatements.length) return;

  const lastOfTestingStatements = testingStatements[testingStatements.length - 1];
  // @ts-ignore
  const getValue = lastOfTestingStatements?.expression?.right;

  const rightType = programJs.getTypeChecker().getTypeAtLocation(getValue);
  //  const whatIsIt = getValue?.getTokenText();

  // @ts-ignore
  return getValue?.text ?? rightType?.intrinsicName;
};

const constructHeritageMapping = (availableNodes: any) => {
  console.log('🚀 ~ file: test.ts:344 ~ constructHeritageMapping ~ availableNodes:', availableNodes);

  const buildJsonRefs = availableNodes.map((node: any) => {
    const nodeKind = ts.SyntaxKind[node.kind];
    const nodeText = node.getText();
    const name: string = node.name.getText() as string;
    const getSourceFile = node.getSourceFile();
    const getSourceFileName = getSourceFile.fileName;
    const isDeclarationFile = getSourceFile.isDeclarationFile;

    const lineStart = ts.getLineAndCharacterOfPosition(getSourceFile, node.getStart()).line - 1;

    const lineOfCode = getSourceFile.text.split('\n')[lineStart].trim();


    let comments = '';
    if (node?.jsDoc) {
      comments = node?.jsDoc[0]?.comment;
    }

    // check for // style comments 
    if (lineOfCode.startsWith('//')) {
      comments = lineOfCode.replace('//', '').trim();
    }

    let defaultValue = undefined;

    if (isDeclarationFile) {
      // if (name == "innerAriaLabel" || name == "anchor" || name == "x" || name == "defaultFocus") { }
      const jsFile = findJsFileForDeclaration(getSourceFileName);
      if (jsFile == null) return; /////// remove later 

      // eventually load for once and cache
      const getAssignedValueInConstructor = searchConstructorAssignedValuesinJsFile(name, node, jsFile);
      defaultValue = getAssignedValueInConstructor;
    }

    return {
      name,
      nodeKind,
      nodeText,
      defaultValue,
      getSourceFileName,
      isDeclarationFile,
    };
  });

  return buildJsonRefs;
};

const HeritageClauseMapping = constructHeritageMapping(
  heritageClauseProperties
);

const jsonStringHeritage = JSON.stringify(HeritageClauseMapping, null, 2);

// Write the string to a file
fs.writeFileSync("src/test/heritageClass.json", jsonStringHeritage, {
  encoding: "utf8",
});

console.log("🚀 completed JSON from Heritage class 🚀");
