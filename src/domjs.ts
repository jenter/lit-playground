import { JSDOM } from 'jsdom';
const { window } = new JSDOM(`<!DOCTYPE html><html><head>
<script type="module" src="./dist/test.umd.js"></script></head>
	<body>
		<dog-element></dog-element>
	</body>
	</html>
`);
const { document } = window;

(globalThis as any).window = window;
(globalThis as any).document = document;
(globalThis as any).HTMLElement = window.HTMLElement;
(globalThis as any).customElements = window.customElements;



setTimeout(() => {
	console.log('🚀 > >> > ', globalThis.document.querySelector('dog-element'));
}, 1);


// import { DogElement } from './dog-element'; 

// const element = new DogElement();

// console.log('Component tag name:', element.tagName.toLowerCase());
// console.log('Component properties:', { myProperty: element.myProperty });