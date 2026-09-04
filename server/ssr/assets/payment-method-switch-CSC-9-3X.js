import { E as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
//#region components/payment-method-switch.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function PaymentMethodSwitch({ registrationId }) {
	const [message, setMessage] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function change(method) {
		setLoading(true);
		const response = await fetch("/api/registrations/payment-method", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				registrationId,
				method
			})
		});
		const data = await response.json();
		if (data.approvalUrl) {
			window.location.assign(data.approvalUrl);
			return;
		}
		setMessage(data.message ?? data.error ?? "Operazione non riuscita.");
		setLoading(false);
		if (response.ok) window.location.reload();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "payment-switch",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Scegli un altro metodo" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				disabled: loading,
				onClick: () => change("paypal"),
				type: "button",
				children: "PayPal"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				disabled: loading,
				onClick: () => change("instant_bank_transfer"),
				type: "button",
				children: "Bonifico istantaneo"
			})] }),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "status",
				children: message
			}) : null
		]
	});
}
//#endregion
export { PaymentMethodSwitch };
