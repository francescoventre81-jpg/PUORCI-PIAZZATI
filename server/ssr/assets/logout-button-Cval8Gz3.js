import { E as __toESM, b as require_react, t as require_jsx_runtime, u as useRouter } from "../index.js";
import { t as createLucideIcon } from "./createLucideIcon-C6U3vCuc.js";
import { t as createClient } from "./client-C53U2VZU.js";
//#region node_modules/.pnpm/lucide-react@0.468.0_react@19.2.6/node_modules/lucide-react/dist/esm/icons/log-out.js
/**
* @license lucide-react v0.468.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var LogOut = createLucideIcon("LogOut", [
	["path", {
		d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",
		key: "1uf3rs"
	}],
	["polyline", {
		points: "16 17 21 12 16 7",
		key: "1gabdz"
	}],
	["line", {
		x1: "21",
		x2: "9",
		y1: "12",
		y2: "12",
		key: "1uyos4"
	}]
]);
//#endregion
//#region components/logout-button.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function LogoutButton() {
	const router = useRouter();
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function signOut() {
		setLoading(true);
		await createClient().auth.signOut();
		router.push("/");
		router.refresh();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		className: "dashboard-signout",
		disabled: loading,
		onClick: signOut,
		type: "button",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { size: 18 }), loading ? "Uscita..." : "Esci"]
	});
}
//#endregion
export { LogoutButton };
