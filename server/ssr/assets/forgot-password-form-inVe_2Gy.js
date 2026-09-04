import { E as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
import { t as createLucideIcon } from "./createLucideIcon-C6U3vCuc.js";
import { t as createClient } from "./client-C53U2VZU.js";
import { t as Link } from "./link-BmZ7DxlE.js";
import { t as ArrowLeft } from "./arrow-left-DqGAq3Eq.js";
import { t as ShieldCheck } from "./shield-check-D-iFdcSL.js";
import { n as getAuthErrorMessage, t as TurnstileWidget } from "./turnstile-widget-DNJrJ2Di.js";
import { t as PUBLIC_SITE_URL } from "./site-url-DvzS50YL.js";
//#region node_modules/.pnpm/lucide-react@0.468.0_react@19.2.6/node_modules/lucide-react/dist/esm/icons/mail.js
/**
* @license lucide-react v0.468.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Mail = createLucideIcon("Mail", [["rect", {
	width: "20",
	height: "16",
	x: "2",
	y: "4",
	rx: "2",
	key: "18n3k1"
}], ["path", {
	d: "m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7",
	key: "1ocrg3"
}]]);
//#endregion
//#region components/forgot-password-form.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
function ForgotPasswordForm() {
	const [captchaKey, setCaptchaKey] = (0, import_react.useState)(0);
	const [captchaToken, setCaptchaToken] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [sent, setSent] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (new URLSearchParams(window.location.search).get("errore") === "link") setError("Il link per reimpostare la password non è valido o è scaduto. Richiedine uno nuovo.");
	}, []);
	async function handleSubmit(event) {
		event.preventDefault();
		setError("");
		if (!captchaToken) {
			setError("Completa la verifica di sicurezza Turnstile.");
			return;
		}
		const formData = new FormData(event.currentTarget);
		const email = String(formData.get("email") ?? "").trim();
		setLoading(true);
		try {
			const { error: resetError } = await createClient().auth.resetPasswordForEmail(email, {
				captchaToken,
				redirectTo: `${PUBLIC_SITE_URL}/auth/callback?next=/reimposta-password`
			});
			if (resetError) {
				setError(getAuthErrorMessage(resetError, "Non è stato possibile inviare l’email. Controlla l’indirizzo e riprova."));
				return;
			}
			setSent(true);
		} catch {
			setError("Non è stato possibile inviare l’email. Riprova tra poco.");
		} finally {
			setCaptchaToken(null);
			setCaptchaKey((current) => current + 1);
			setLoading(false);
		}
	}
	if (sent) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "form-success auth-success",
		role: "status",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { "aria-hidden": "true" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Controlla la tua email" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Se esiste un account associato all'indirizzo indicato, riceverai un link per scegliere una nuova password." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				className: "button button-primary",
				href: "/accedi",
				children: "Torna ad Accedi"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "login-card recovery-card",
		onSubmit: handleSubmit,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "login-icon",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { "aria-hidden": "true" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "form-kicker",
					children: "RECUPERO ACCOUNT"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Reimposta la password" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "recovery-intro",
					children: "Inserisci l'email usata per registrarti. Ti invieremo un collegamento sicuro."
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Email" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				autoComplete: "email",
				name: "email",
				required: true,
				type: "email"
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "turnstile-block compact-turnstile",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { "aria-hidden": "true" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Verifica di sicurezza" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TurnstileWidget, {
					onToken: setCaptchaToken,
					siteKey: turnstileSiteKey
				}, captchaKey)]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "login-message error",
				role: "alert",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "form-submit",
				disabled: loading || !captchaToken,
				type: "submit",
				children: [loading ? "INVIO..." : "INVIA EMAIL DI RECUPERO", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { size: 19 })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				className: "forgot-link back-link",
				href: "/accedi",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 15 }), " Torna ad Accedi"]
			})
		]
	});
}
//#endregion
export { ForgotPasswordForm };
