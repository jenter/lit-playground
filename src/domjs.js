const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = `<!DOCTYPE html><html>
	<head>
	<script type="module" src="./dist/test.umd.js"> </script>
	</head>
	<body>
		<dog-element></dog-element>
  	</body>
  </html>`;

const dom = new JSDOM(html, {
  url: `file://${__dirname}/index.html`,
  runScripts: "dangerously",
  resources: "usable",
  pretendToBeVisual: true,
  includeNodeLocations: true,
});

const document = dom.window.document;
const window = dom.window;
const bodyEl = document.body;
const customElements = dom.window.customElements;

document.addEventListener("DOMContentLoaded", () => {
  const customElementsLoaded = Promise.all(
    Array.from(document.getElementsByTagName("*"))
      .filter((el) => el.localName.includes("-"))
      .map((el) => customElements.whenDefined(el.localName))
  );
  customElementsLoaded.then(() => {
    console.log("All web components have loaded!");
  });
});

console.log(bodyEl.innerHTML);

console.log("🚀 ~ file: domjs.js:25 ~ customElements:", customElements);

return;

var script = dom.createElement("script");
script.src = "dist/my-component.umd.js";
dom.document.body.appendChild(script); // <== need to append the script child
script.onload = function () {
  console.log("script loaded");
};
dom.onload = function () {
  console.log("window loaded");
};

// injectScript("", dom);

// console.log(dom.window.document.querySelector("p").textContent); // "Hello world"

// return;

// const window = new JSDOM(``, { pretendToBeVisual: true }).window;

// window.requestAnimationFrame((timestamp) => {
//   console.log(timestamp > 0);
// });

// async function getHTML() {
//   const script = await readFile(
//     resolve(__dirname, "..", "dist", "my-component.umd.js")
//   );
//   return `<html><head><script>${script}</script></head><body></body></html>`;
// }

// // const dom = new JSDOM(`<!DOCTYPE html><html><head>
// // <script type="module" src="./dist/test.umd.js"></script></head>
// // 	<body>
// // 		<dog-element></dog-element>
// // 	</body>
// // 	</html>`);

// // console.log(dom.window.document.querySelector("p").textContent); // "Hello world"
