// transform-plugin.ts
import { Plugin } from 'vite';
import * as ts from 'typescript';

const prefix = 'hamburgers';

const transformCode = (code: string): string => {
	const transformer = (context: ts.TransformationContext) => (node: ts.Node): ts.Node => {
		const { factory } = context;

		if (
			ts.isClassDeclaration(node) &&
			ts.isIdentifier(node?.name) &&
			node.name.text === 'DogElement'
		) {
			const propertiesToUpdate = node.members.filter(ts.isPropertyDeclaration).filter((member) =>
				ts.isPropertyDeclaration(member)
			) as ts.PropertyDeclaration[];

			propertiesToUpdate.forEach((property) => {
				const decorator = property.modifiers?.[0];
				const decoratorArgument = decorator?.expression?.arguments?.[0]?.properties;

				decoratorArgument?.forEach((prop) => {
					const attributeName = prop?.initializer?.text;
					prop.initializer.text = `${prefix}-${attributeName}`;
					factory.updateVariableDeclaration(prop, factory.createIdentifier(prop.initializer.text), prop.type, prop.initializer, prop.modifiers);
				});
			});
		}

		return ts.visitEachChild(node, child => transformer(context)(child), context);
	};

	const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest);
	const transformedSourceFile = ts.transform(sourceFile, [transformer]).transformed[0];
	const printer = ts.createPrinter();

	return printer.printFile(transformedSourceFile);
};


export const transform = (): Plugin => {
	return {
		name: 'typescript-transform',
		enforce: 'pre',
		transform(code, id) {
			if (id.endsWith('.ts') || id.endsWith('.tsx')) {
				// 
				return transformCode(code);
			}
		},
	};
};