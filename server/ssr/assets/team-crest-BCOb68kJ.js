import { t as require_jsx_runtime } from "../index.js";
import { t as Image } from "./image-DUVK778_.js";
//#region components/team-crest.tsx
var import_jsx_runtime = require_jsx_runtime();
function TeamCrest({ logoUrl, team, size = 44 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "team-crest",
		style: {
			height: size,
			width: size
		},
		children: logoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
			alt: `Logo ${team}`,
			fill: true,
			sizes: `${size}px`,
			src: logoUrl,
			unoptimized: true
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: team.slice(0, 2).toUpperCase() })
	});
}
//#endregion
export { TeamCrest as t };
