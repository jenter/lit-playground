import * as ts from "typescript";

// TS shared across functions
const excludedModifiers = ["private", "protected", "static", "readonly"];
let heritageClause: ts.HeritageClause | undefined = undefined;
let program;
let classDeclaration;
let checker: any;

export function retrieveExternalHeritageInfo(file: string, externalPackageNamespace: string) {
  const programInitialized = tsProgramInit(file);
  const { programInit, classDeclarationInit } = programInitialized;

  // set for universal vars so not required to pass as args needlessly
  program = programInit;
  classDeclaration = classDeclarationInit;
  checker = program.getTypeChecker();

  // const heritageStructure = tsHeritageStructure(program, classDeclaration);
  const availableHeritageExternalSources = getHeritageClauseAsExternal(classDeclaration, externalPackageNamespace);

  if (!availableHeritageExternalSources) {
    throw new Error("missing availableHeritageExternalSources");
  }

  const externalPackageProperties = getHeritageClauseMappedProperties(availableHeritageExternalSources, externalPackageNamespace);

  const compiledAssociations = mappedElementFromProperties(externalPackageProperties);

  return compiledAssociations;
}

const mappedElementFromProperties = (externalPackageProperties: any) => {
  const reviewMap = externalPackageProperties.map((property: any) => {
    const typeOfSymbol = getNativeTypeFromSymbolObject(property);
    return typeOfSymbol == "method" ? getSymbolMethodInfo(property) : getSymbolPropertyInfo(property);
  });

  return reviewMap;
};

const tsProgramInit = (file: string) => {
  const programInit = ts.createProgram([file], {
    allowJs: true,
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
    allowSyntheticDefaultImports: true
  });

  const sourceFile = programInit.getSourceFile(file);
  const classDeclarationInit = sourceFile?.statements.find((statement) => {
    return ts.isClassDeclaration(statement);
  }) as ts.ClassDeclaration;

  if (!classDeclarationInit) {
    throw new Error("No class found in file");
  }

  return { programInit, classDeclarationInit };
};

// const tsHeritageStructure = (program: any, classDeclaration: any) => {
//   let heritageClause: ts.HeritageClause | undefined = undefined;

//   ts.forEachChild(classDeclaration, (node) => {
//     if (ts.isHeritageClause(node) && node.token === ts.SyntaxKind.ExtendsKeyword) {
//       heritageClause = node as ts.HeritageClause;
//     }
//   });

//   const programLength = Boolean(program.getSemanticDiagnostics().length);
//   const isHeritageClause = heritageClause && ts.isHeritageClause(heritageClause);

//   if (!isHeritageClause || !programLength) {
//     throw new Error("missing heritage clause or program length");
//   }

//   return heritageClause;
// };

/**
 * A function to get the heritage clause of a class declaration that is filtered by the module package name.
 * The intent is to get references of extends packages not to utilize properties of the class.
 *
 * @param classDeclaration
 * @param modulePackageName
 * @returns ts.HeritageClause
 */
const getHeritageClauseAsExternal = (classDeclaration: any, modulePackageName: string) => {
  ts.forEachChild(classDeclaration, (node) => {
    if (ts.isHeritageClause(node) && node.token === ts.SyntaxKind.ExtendsKeyword) {
      heritageClause = node as ts.HeritageClause;
    }
  });

  if (!heritageClause) return undefined;

  // @ts-ignore - todo fix later
  const getHeritageTypes = heritageClause?.types[0];
  const getTypeAtHeritage = checker.getTypeAtLocation(getHeritageTypes);
  const getSymbolAtHeritage = getTypeAtHeritage.getSymbol()!;

  if (!getSymbolAtHeritage) return undefined;

  // Get the declaration node of the base class
  const getDeclarationAtHeritage = getSymbolAtHeritage.getDeclarations()![0];

  // Get the sourceFile
  const baseClassSourceFile = getDeclarationAtHeritage.getSourceFile()?.fileName;

  const matchingExternalPackage = Boolean(baseClassSourceFile.includes(`node_modules/${modulePackageName}`));
  return matchingExternalPackage ? heritageClause : undefined;
};

const getHeritageClauseMappedProperties = (heritageClause: ts.HeritageClause, modulePackageName: string, skipUnusableProperties: boolean = true) => {
  const getHeritageTypes = heritageClause?.types[0];
  const getTypeAtHeritage = checker.getTypeAtLocation(getHeritageTypes);
  const getSymbolAtHeritage = getTypeAtHeritage.getSymbol()!;
  if (!getSymbolAtHeritage) return undefined;

  return getTypeAtHeritage?.getProperties().filter((property: any) => {
    const propertyValueDeclaration = property?.valueDeclaration;
    const propertySourceFile = propertyValueDeclaration?.getSourceFile();
    const propertySourceFileText = propertySourceFile?.fileName;

    const PropertyDeclarations = property?.declarations[0];
    if (!PropertyDeclarations) return false;

    // skip for accessors like "get"
    if (propertyValueDeclaration?.kind === ts.SyntaxKind.GetAccessor) {
      return false;
    }
    // skip due to modifiers for private, readonly, etc.
    const hasModifiers = Boolean(ts.canHaveModifiers(PropertyDeclarations));

    if (hasModifiers && skipUnusableProperties) {
      const modifiers = ts.getModifiers(PropertyDeclarations);
      const textValuesIdentifiers = modifiers?.map((modifier) => {
        return modifier.getText();
      });
      const skipDueToModifier = textValuesIdentifiers?.some((textValue) => {
        return excludedModifiers.includes(textValue);
      });
      // skip due to modifiers for private, readonly, etc.
      if (skipDueToModifier) {
        return false;
      }
    }

    // filter out according to package name since the intent is to match external allowable patterns
    const matchingExternalPackage = Boolean(propertySourceFileText.includes(`node_modules/${modulePackageName}`));
    if (!matchingExternalPackage) return false;

    // check for direct class declarations (as properties) since they are not needed
    const symbolOfValueDeclaration = propertyValueDeclaration?.symbol;
    const getSymbolofUniqueTypeReference = checker.getTypeOfSymbolAtLocation(symbolOfValueDeclaration, symbolOfValueDeclaration?.valueDeclaration);
    const checkForHeritageAssociations = getSymbolofUniqueTypeReference?.symbol?.declarations?.some((declaration: any) => {
      return Boolean(declaration?.heritageClauses);
    });

    if (symbolOfValueDeclaration && checkForHeritageAssociations) {
      return false;
    }

    // ~ ~ ~
    return true;
  });
};

/**
 * Retrieve method information from a symbol
 *
 * @param symbol
 * @returns
 */
const getSymbolMethodInfo = (symbol: ts.Symbol) => {
  const getSymbolsDeclaration = symbol.declarations as ts.DeclarationStatement[];
  const getSymbolValueDeclaration = symbol.valueDeclaration as ts.MethodDeclaration;

  if (!getSymbolsDeclaration[0] || !getSymbolValueDeclaration) return undefined;

  const returnTypeText = getSymbolValueDeclaration?.type?.getFullText();

  const getMethodParameters = getSymbolValueDeclaration?.parameters
    ? getSymbolValueDeclaration.parameters
        .map((parameter: any) => {
          return parameter.getText();
        })
        .join(", ")
    : "";

  const methodData = {
    name: symbol.getName(),
    parameters: getMethodParameters,
    returnType: returnTypeText ?? "void"
  };

  return methodData;
};

function findJsMappingForDeclaration(declarationFile: string): string | null {
  const jsFile = declarationFile.replace(/\.d\.ts$/, ".js");
  if (ts.sys.fileExists(jsFile)) {
    return jsFile;
  }
  return null;
}

function queryConstructorAssignedValuesinJsFile(name: string, node: any, sourceFileJs: any) {
  const assignmentName = name;

  const classDeclarationJs = sourceFileJs?.statements.find((statement: ts.Statement) => {
    return ts.isClassDeclaration(statement);
  }) as ts.ClassDeclaration;

  const constructorTestJs = classDeclarationJs.members.find((member) => ts.isConstructorDeclaration(member)) as ts.ConstructorDeclaration;

  const constructorStatements = constructorTestJs?.body?.statements as ts.NodeArray<ts.Statement>;
  if (!constructorStatements) return false;

  const matchExpressionStatement = constructorStatements.filter((statement) => {
    if (!ts.isExpressionStatement(statement) || !ts.isBinaryExpression(statement.expression)) return false;

    const assignment = statement?.expression as ts.BinaryExpression;
    if (!ts.isBinaryExpression(assignment)) return false;

    const assignedLeft = assignment.left as ts.PropertyAccessExpression;
    const assignedRight = assignment?.right as ts.Node;
    if (!assignedLeft || !assignedRight) return false;

    const assignedName = assignedLeft?.name?.escapedText ?? "";

    return Boolean(assignedName === assignmentName);
  }) as ts.ExpressionStatement[];

  if (!matchExpressionStatement) return undefined;

  // ensure we get the last one in case there are multiple
  const matchingStatement = matchExpressionStatement[matchExpressionStatement.length - 1];

  const assignedExpression = matchingStatement?.expression as ts.BinaryExpression;
  if (!assignedExpression || !ts.isBinaryExpression(assignedExpression)) return false;

  const right = assignedExpression?.right as ts.BinaryExpression;
  const AssignedValue = right.getText(sourceFileJs);

  return AssignedValue ?? undefined;
}

function queryDecorateExpressionFromJsFile(name: string, sourceFileJs: any) {
  const nodeChildren = sourceFileJs?.statements;
  if (!nodeChildren.length) return false;

  const filterSomeByExpressionName = nodeChildren.filter((node: ts.Node) => {
    if (!ts.isExpressionStatement(node)) return false;

    let expression = node?.expression as ts.CallExpression;
    const expressionSub = expression?.expression as ts.Expression;
    const validateExpression = expressionSub?.getText(sourceFileJs);
    if (validateExpression !== "__decorate") return false;

    const argumentMatchByName = expression?.arguments?.some((argument: any) => {
      const getText = argument?.text == name;
      return getText;
    });

    if (!argumentMatchByName) return false;

    const confirmExpressionAssignment = expression?.arguments[0] as any;
    const validateExpressionAsProperty = confirmExpressionAssignment?.elements[0].expression.getText(sourceFileJs);

    return validateExpressionAsProperty == "property";
  });

  if (!filterSomeByExpressionName || !filterSomeByExpressionName[0]) return false;

  return filterSomeByExpressionName[0]?.expression?.arguments ?? undefined;
}

const constructProgramForJsFile = (sourceFile: any) => {
  const programJs = ts.createProgram([sourceFile], {
    allowJs: true,
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
    allowSyntheticDefaultImports: true
  });

  if (!programJs.getSourceFile(sourceFile)) {
    console.error(`Unable to find source file ${sourceFile}`);
    return;
  }

  return programJs.getSourceFile(sourceFile);
};

const getSymbolPropertyInfo = (symbol: ts.Symbol, jsFileMapping: boolean = true) => {
  // const getSymbolsDeclaration = symbol?.declarations[0];
  const getSymbolsDeclaration = symbol.declarations as ts.DeclarationStatement[];
  const getSymbolValueDeclaration = symbol.valueDeclaration as ts.MethodDeclaration;

  if (!getSymbolsDeclaration[0] || !getSymbolValueDeclaration) return undefined;

  const getSymbolType = checker.getTypeOfSymbolAtLocation(symbol, getSymbolValueDeclaration);

  // does not always work properly:  checker.typeToString,
  // without passing in undefined, ts.TypeFormatFlags.InTypeAlias
  const typeToString = checker.typeToString(getSymbolType, undefined, ts.TypeFormatFlags.InTypeAlias);

  console.log("🚀 ~ typeToString:", typeof typeToString);

  // since *.d.ts files are not available, we need to traverse the js
  const propertySourceFile = getSymbolValueDeclaration?.getSourceFile();
  const isDeclarationFile = propertySourceFile.isDeclarationFile;

  const jsSiblingCompiled = findJsMappingForDeclaration(propertySourceFile?.fileName);

  if (jsFileMapping && Boolean(!jsSiblingCompiled || !isDeclarationFile)) {
    console.error("no js sibling found for", symbol.getName());
    return undefined;
  }

  const programJsFile = constructProgramForJsFile(jsSiblingCompiled);

  const jsReferenceValue = queryConstructorAssignedValuesinJsFile(symbol.getName(), symbol, programJsFile);

  if (!jsReferenceValue) {
    ///////
    return;
  }

  const getDecorateValues = queryDecorateExpressionFromJsFile(symbol.getName(), programJsFile);

  const getPropertyValuesFromDecorate = (decorateValues: any) => {
    const getDecorateValues = decorateValues;
    const getPropertyAssignment = getDecorateValues[0].elements[0]?.arguments[0] as ts.ObjectLiteralExpression;
    if (!getPropertyAssignment?.properties) return undefined;

    const mapProperties = getPropertyAssignment?.properties?.map((property: any) => {
      const name = property?.name?.escapedText;
      const value = property?.initializer?.getText(programJsFile);
      return { name, value };
    });

    return mapProperties;
  };

  const availablePropertiesAsDecorated = getPropertyValuesFromDecorate(getDecorateValues);
  // const getType = availablePropertiesAsDecorated?.filter((property) => property.name === "type").map((property) => property.value)[0];

  const propertyData = {
    name: symbol.getName(),
    type: typeToString,
    default: jsReferenceValue ?? undefined,
    sourceFile: propertySourceFile?.fileName ?? undefined,
    propertyDecorators: availablePropertiesAsDecorated ?? undefined
  };

  return propertyData;
};

const getNativeTypeFromSymbolObject = (symbol: ts.Symbol) => {
  const getDeclarationOfSymbol = symbol?.declarations[0];
  const isMethodDeclaration = Boolean(getDeclarationOfSymbol.kind === ts.SyntaxKind.MethodDeclaration);
  if (isMethodDeclaration) {
    return "method";
  }

  // even if assigned as binary property, we still want to validate appropriate types and remove class declarations
  const getSymbolValueDeclaration = symbol.valueDeclaration;
  const getSymbolType = checker.getTypeOfSymbolAtLocation(symbol, getSymbolValueDeclaration);
  const hasValueDeclaration = getSymbolType?.symbol?.valueDeclaration;

  if (!getSymbolType || !hasValueDeclaration) return undefined;

  // we want to remove any class instatiations
  const checkAsHeritageClause = hasValueDeclaration?.heritageClauses;
  if (checkAsHeritageClause) return undefined;

  return "property";
};
