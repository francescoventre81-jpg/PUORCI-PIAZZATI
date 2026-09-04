import { t as require_jsx_runtime } from "../index.js";
import { openCookieSettings } from "./google-analytics-BukLIqA7.js";
//#region components/cookie-settings-button.tsx
var import_jsx_runtime = require_jsx_runtime();
function CookieSettingsButton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: "cookie-settings-button",
		onClick: openCookieSettings,
		type: "button",
		children: "Gestisci cookie"
	});
}
//#endregion
export { CookieSettingsButton };
