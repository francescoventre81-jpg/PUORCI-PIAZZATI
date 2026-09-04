import { E as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
import { t as createLucideIcon } from "./createLucideIcon-C6U3vCuc.js";
import { t as ShieldCheck } from "./shield-check-D-iFdcSL.js";
import { t as CircleCheck } from "./circle-check-Okz4p1cZ.js";
import { n as Check, t as Copy } from "./copy-D5ZLiX4J.js";
//#region node_modules/.pnpm/lucide-react@0.468.0_react@19.2.6/node_modules/lucide-react/dist/esm/icons/banknote.js
/**
* @license lucide-react v0.468.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Banknote = createLucideIcon("Banknote", [
	["rect", {
		width: "20",
		height: "12",
		x: "2",
		y: "6",
		rx: "2",
		key: "9lu3g6"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "2",
		key: "1c9p78"
	}],
	["path", {
		d: "M6 12h.01M18 12h.01",
		key: "113zkx"
	}]
]);
//#endregion
//#region node_modules/.pnpm/lucide-react@0.468.0_react@19.2.6/node_modules/lucide-react/dist/esm/icons/landmark.js
/**
* @license lucide-react v0.468.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Landmark = createLucideIcon("Landmark", [
	["line", {
		x1: "3",
		x2: "21",
		y1: "22",
		y2: "22",
		key: "j8o0r"
	}],
	["line", {
		x1: "6",
		x2: "6",
		y1: "18",
		y2: "11",
		key: "10tf0k"
	}],
	["line", {
		x1: "10",
		x2: "10",
		y1: "18",
		y2: "11",
		key: "54lgf6"
	}],
	["line", {
		x1: "14",
		x2: "14",
		y1: "18",
		y2: "11",
		key: "380y"
	}],
	["line", {
		x1: "18",
		x2: "18",
		y1: "18",
		y2: "11",
		key: "1kevvc"
	}],
	["polygon", {
		points: "12 2 20 7 4 7",
		key: "jkujk7"
	}]
]);
//#endregion
//#region node_modules/.pnpm/lucide-react@0.468.0_react@19.2.6/node_modules/lucide-react/dist/esm/icons/send.js
/**
* @license lucide-react v0.468.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Send = createLucideIcon("Send", [["path", {
	d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
	key: "1ffxy3"
}], ["path", {
	d: "m21.854 2.147-10.94 10.939",
	key: "12cjpa"
}]]);
//#endregion
//#region node_modules/.pnpm/lucide-react@0.468.0_react@19.2.6/node_modules/lucide-react/dist/esm/icons/upload.js
/**
* @license lucide-react v0.468.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Upload = createLucideIcon("Upload", [
	["path", {
		d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
		key: "ih7n3h"
	}],
	["polyline", {
		points: "17 8 12 3 7 8",
		key: "t8dd8p"
	}],
	["line", {
		x1: "12",
		x2: "12",
		y1: "3",
		y2: "15",
		key: "widbto"
	}]
]);
//#endregion
//#region node_modules/.pnpm/lucide-react@0.468.0_react@19.2.6/node_modules/lucide-react/dist/esm/icons/wallet-cards.js
/**
* @license lucide-react v0.468.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var WalletCards = createLucideIcon("WalletCards", [
	["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "3",
		rx: "2",
		key: "afitv7"
	}],
	["path", {
		d: "M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2",
		key: "4125el"
	}],
	["path", {
		d: "M3 11h3c.8 0 1.6.3 2.1.9l1.1.9c1.6 1.6 4.1 1.6 5.7 0l1.1-.9c.5-.5 1.3-.9 2.1-.9H21",
		key: "1dpki6"
	}]
]);
//#endregion
//#region components/registration-form.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function RegistrationForm({ initialFirstName = "", initialLastName = "", initialPrice, initialReferralCode = "", standardPriceEur, standardPriceStart, verifiedEmail }) {
	const [selectedMethod, setSelectedMethod] = (0, import_react.useState)("paypal");
	const [result, setResult] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [displayPrice, setDisplayPrice] = (0, import_react.useState)(initialPrice.amountEur);
	const [displayTier, setDisplayTier] = (0, import_react.useState)(initialPrice.tier);
	const paymentOptions = (0, import_react.useMemo)(() => [
		{
			value: "paypal",
			title: "Paga con PayPal",
			icon: WalletCards,
			description: `Paga online ${displayPrice} € in modo sicuro tramite PayPal. L’iscrizione verrà confermata automaticamente dopo il completamento del pagamento.`
		},
		{
			value: "instant_bank_transfer",
			title: "Bonifico istantaneo",
			icon: Landmark,
			description: `Effettua un bonifico istantaneo di ${displayPrice} €. L’iscrizione verrà confermata dopo la verifica del pagamento.`
		},
		{
			value: "cash",
			title: "Pagamento in contanti",
			icon: Banknote,
			description: "Disponibile esclusivamente nelle zone raggiungibili dagli organizzatori. La quota definitiva dipende dalla data dell’incasso effettivo."
		}
	], [displayPrice]);
	(0, import_react.useEffect)(() => {
		if (displayTier === "standard") return;
		const target = new Date(standardPriceStart).getTime();
		const update = () => {
			if (Date.now() >= target) {
				setDisplayPrice(standardPriceEur);
				setDisplayTier("standard");
			}
		};
		update();
		const interval = window.setInterval(update, 1e3);
		return () => window.clearInterval(interval);
	}, [
		displayTier,
		standardPriceEur,
		standardPriceStart
	]);
	async function handleSubmit(event) {
		event.preventDefault();
		setError("");
		setLoading(true);
		const formData = new FormData(event.currentTarget);
		const payload = Object.fromEntries(formData.entries());
		try {
			const response = await fetch("/api/registrations", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...payload,
					payment_method: selectedMethod,
					privacy_accepted: formData.get("privacy_accepted") === "on",
					rules_accepted: formData.get("rules_accepted") === "on"
				})
			});
			const data = await response.json();
			if (!response.ok) {
				setError(data.error ?? "Non è stato possibile inviare la richiesta.");
				return;
			}
			if (data.paymentMethod === "paypal" && data.approvalUrl) {
				window.location.assign(data.approvalUrl);
				return;
			}
			setResult(data);
		} catch {
			setError("Impossibile inviare la richiesta. Riprova.");
		} finally {
			setLoading(false);
		}
	}
	if (result?.paymentMethod === "instant_bank_transfer" && result.bank) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BankTransferInstructions, { result });
	if (result?.paymentMethod === "cash") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "form-success cash-success",
		role: "status",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { "aria-hidden": "true" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "RICHIESTA IN ATTESA" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Il ritiro non è ancora confermato." }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: result.message })
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "sport-form",
		onSubmit: handleSubmit,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "form-intro",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "DATI DEL FANTALLENATORE" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [displayTier === "early_bird" ? `Quota promozionale: ${displayPrice} € fino al 10 agosto 2026` : `Quota di iscrizione: ${displayPrice} €`, ". I campi con * sono obbligatori."] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "form-grid",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nome *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						autoComplete: "given-name",
						defaultValue: initialFirstName,
						name: "first_name",
						required: true,
						type: "text"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Cognome *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						autoComplete: "family-name",
						defaultValue: initialLastName,
						name: "last_name",
						required: true,
						type: "text"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Data di nascita *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "birth_date",
						required: true,
						type: "date"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Numero di telefono *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						autoComplete: "tel",
						name: "phone",
						required: true,
						type: "tel"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Email *" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							autoComplete: "email",
							className: "verified-input",
							readOnly: true,
							type: "email",
							value: verifiedEmail
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
							className: "verified-label",
							children: "Email verificata"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Nome squadra *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "team_name",
						required: true,
						type: "text"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Username Fantacalcio *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "fantasy_username",
						required: true,
						type: "text"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Codice invito ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "(facoltativo)" })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							defaultValue: initialReferralCode,
							maxLength: 9,
							name: "referral_code_used",
							pattern: "FP-[A-Za-z0-9]{6}",
							placeholder: "FP-7K2Q9D",
							type: "text"
						}),
						initialReferralCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", {
							className: "verified-label",
							children: "Codice collegato dal link di invito"
						}) : null
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "payment-fieldset",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("legend", { children: [
					"Scegli come pagare ",
					displayPrice,
					" € *"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "payment-option-grid",
					children: paymentOptions.map((option) => {
						const Icon = option.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: `payment-option ${selectedMethod === option.value ? "selected" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									checked: selectedMethod === option.value,
									name: "payment_method",
									onChange: () => setSelectedMethod(option.value),
									type: "radio",
									value: option.value
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "payment-option-icon",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { "aria-hidden": "true" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: option.title }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: option.description }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "payment-option-check",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { size: 14 })
								})
							]
						}, option.value);
					})
				})]
			}),
			selectedMethod === "cash" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CashFields, {
				displayPrice,
				earlyBird: displayTier === "early_bird",
				standardPriceEur
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "payment-warning",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { "aria-hidden": "true" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "L'invio della richiesta o di una ricevuta non conferma l'iscrizione. Diventerai ufficialmente iscritto soltanto dopo l'effettiva conferma del pagamento." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "consent-list",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "rules_accepted",
					required: true,
					type: "checkbox"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { "aria-hidden": "true" }), "Ho letto e accetto il Regolamento e sono consapevole che il montepremi e i premi possono variare in base al numero totale degli iscritti, come indicato nel regolamento."] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "privacy_accepted",
					required: true,
					type: "checkbox"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { "aria-hidden": "true" }), "Acconsento al trattamento dei dati personali *"] })] })]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "form-error",
				role: "alert",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				className: "form-submit",
				disabled: loading,
				type: "submit",
				children: [
					loading ? "INVIO IN CORSO..." : "CONTINUA CON IL PAGAMENTO",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { size: 19 })
				]
			})
		]
	});
}
function CashFields({ displayPrice, earlyBird, standardPriceEur }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "cash-fields",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "cash-notice",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "PRIMA DI INVIARE" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Il pagamento in contanti è disponibile soltanto nelle zone raggiungibili dagli organizzatori. L'invio della richiesta non garantisce che il ritiro possa essere effettuato." }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: earlyBird ? `La quota promozionale di ${displayPrice} € vale soltanto se l’incasso viene confermato entro il 10 agosto 2026. Se il ritiro avviene dopo, saranno dovuti ${standardPriceEur} €.` : `La quota da consegnare agli organizzatori è di ${displayPrice} €.` })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "form-grid",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Comune *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "cash_city",
					required: true,
					type: "text"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Provincia *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					maxLength: 2,
					name: "cash_province",
					required: true,
					type: "text"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "CAP *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					inputMode: "numeric",
					name: "cash_postal_code",
					required: true,
					type: "text"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Indirizzo *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "cash_address",
					required: true,
					type: "text"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Numero civico *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "cash_street_number",
					required: true,
					type: "text"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Frazione o località ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "(facoltativo)" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					name: "cash_locality",
					type: "text"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "form-wide",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Giorni o fasce orarie preferite *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						name: "cash_preferred_times",
						required: true,
						rows: 3
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Telefono per essere contattato *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					autoComplete: "tel",
					name: "cash_contact_phone",
					required: true,
					type: "tel"
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Indicazioni aggiuntive ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "(facoltativo)" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					name: "cash_notes",
					rows: 3
				})] })
			]
		})]
	});
}
function BankTransferInstructions({ result }) {
	const [uploadMessage, setUploadMessage] = (0, import_react.useState)("");
	const [uploading, setUploading] = (0, import_react.useState)(false);
	async function copy(value) {
		await navigator.clipboard.writeText(value);
	}
	async function uploadReceipt(event) {
		event.preventDefault();
		setUploading(true);
		setUploadMessage("");
		const payload = await (await fetch(`/api/registrations/${result.registrationId}/receipt`, {
			method: "POST",
			body: new FormData(event.currentTarget)
		})).json();
		setUploadMessage(payload.message ?? payload.error ?? "Operazione non riuscita.");
		setUploading(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "bank-result",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "RICHIESTA SALVATA" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Completa il bonifico istantaneo" })] })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "bank-warning",
				children: "Il caricamento della ricevuta non conferma automaticamente l'iscrizione. Un amministratore verificherà il pagamento."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "bank-details",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Importo" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: result.amount })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Intestatario" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: result.bank?.accountHolder })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "IBAN" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: result.bank?.iban }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => copy(result.bank?.iban ?? ""),
							type: "button",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { size: 16 }), " Copia IBAN"]
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Causale obbligatoria" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: result.bank?.reference }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => copy(result.bank?.reference ?? ""),
							type: "button",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { size: 16 }), " Copia causale"]
						})
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "receipt-form",
				onSubmit: uploadReceipt,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Invia i dati del bonifico" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ricevuta PDF, JPG o PNG *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						accept: ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png",
						name: "receipt",
						required: true,
						type: "file"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["CRO/TRN ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "(facoltativo)" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "cro_trn",
						type: "text"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Data del bonifico *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						name: "declared_at",
						required: true,
						type: "date"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "button button-primary",
						disabled: uploading,
						type: "submit",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { size: 17 }),
							" ",
							uploading ? "CARICAMENTO..." : "CARICA RICEVUTA"
						]
					}),
					uploadMessage ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						role: "status",
						children: uploadMessage
					}) : null
				]
			})
		]
	});
}
//#endregion
export { RegistrationForm };
