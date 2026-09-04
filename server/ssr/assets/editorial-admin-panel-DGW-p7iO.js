import { E as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
import { t as createLucideIcon } from "./createLucideIcon-C6U3vCuc.js";
import { t as Newspaper } from "./newspaper-CqwjFNz8.js";
import { n as Plus, t as Trash2 } from "./trash-2-DJ9d6da7.js";
import { t as X } from "./x-D_iydeij.js";
import { t as createClient } from "./client-C53U2VZU.js";
//#region node_modules/.pnpm/lucide-react@0.468.0_react@19.2.6/node_modules/lucide-react/dist/esm/icons/file-image.js
/**
* @license lucide-react v0.468.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var FileImage = createLucideIcon("FileImage", [
	["path", {
		d: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
		key: "1rqfz7"
	}],
	["path", {
		d: "M14 2v4a2 2 0 0 0 2 2h4",
		key: "tnqrlb"
	}],
	["circle", {
		cx: "10",
		cy: "12",
		r: "2",
		key: "737tya"
	}],
	["path", {
		d: "m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22",
		key: "wt3hpn"
	}]
]);
//#endregion
//#region node_modules/.pnpm/lucide-react@0.468.0_react@19.2.6/node_modules/lucide-react/dist/esm/icons/pencil.js
/**
* @license lucide-react v0.468.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Pencil = createLucideIcon("Pencil", [["path", {
	d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
	key: "1a8usu"
}], ["path", {
	d: "m15 5 4 4",
	key: "1mk7zo"
}]]);
//#endregion
//#region components/editorial-admin-panel.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function EditorialAdminPanel({ advice, articles, databaseReady }) {
	const [message, setMessage] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [editingArticle, setEditingArticle] = (0, import_react.useState)(null);
	const [editingAdvice, setEditingAdvice] = (0, import_react.useState)(null);
	async function save(event, kind) {
		event.preventDefault();
		setBusy(true);
		setMessage("");
		const form = event.currentTarget;
		const data = new FormData(form);
		try {
			const image = data.get("image");
			let imagePath = null;
			if (image instanceof File && image.size) {
				const supabase = createClient();
				const extension = image.name.split(".").pop()?.toLowerCase() || "jpg";
				const path = `${kind}/${crypto.randomUUID()}.${extension}`;
				const { error } = await supabase.storage.from("editorial-images").upload(path, image, {
					contentType: image.type,
					upsert: false
				});
				if (error) throw error;
				imagePath = path;
			}
			const payload = Object.fromEntries(data.entries());
			delete payload.image;
			const editing = kind === "article" ? editingArticle : editingAdvice;
			const response = await fetch("/api/admin/editorial", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...payload,
					imagePath,
					id: editing?.id,
					kind,
					operation: editing ? "update" : "create"
				})
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error ?? "Salvataggio non riuscito.");
			setMessage(result.message ?? "Contenuto salvato.");
			form.reset();
			if (kind === "article") setEditingArticle(null);
			else setEditingAdvice(null);
			window.location.reload();
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Salvataggio non riuscito.");
		} finally {
			setBusy(false);
		}
	}
	async function remove(kind, id) {
		if (!window.confirm("Vuoi eliminare definitivamente questo contenuto?")) return;
		setBusy(true);
		const response = await fetch("/api/admin/editorial", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				id,
				kind,
				operation: "delete"
			})
		});
		const result = await response.json();
		setMessage(result.message ?? result.error ?? "Operazione completata.");
		setBusy(false);
		if (response.ok) window.location.reload();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "admin-section editorial-admin",
		id: "contenuti",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "REDAZIONE" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "News e consigli di giornata" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Pubblica i contenuti del portale senza modificare il codice." })
			] }),
			!databaseReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "admin-message",
				children: [
					"Pannello pronto. Per attivarlo devi prima approvare e applicare la migration",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: " 008_editorial_content.sql" }),
					"."
				]
			}) : null,
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "admin-message",
				children: message
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "editorial-admin-grid",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (event) => void save(event, "article"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "editorial-form-title",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Newspaper, {}),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: editingArticle ? "Modifica news" : "Nuova news" }),
								editingArticle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									"aria-label": "Annulla modifica",
									className: "editorial-cancel",
									onClick: () => setEditingArticle(null),
									type: "button",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Titolo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							defaultValue: editingArticle?.title,
							name: "title",
							required: true,
							minLength: 3
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Categoria", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							defaultValue: editingArticle?.category,
							name: "category",
							required: true,
							placeholder: "Mercato, Infortuni, Analisi…"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Slug", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							defaultValue: editingArticle?.slug,
							name: "slug",
							required: true,
							pattern: "[a-z0-9]+(?:-[a-z0-9]+)*",
							placeholder: "titolo-della-news"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Sintesi", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							defaultValue: editingArticle?.summary,
							name: "summary",
							required: true,
							minLength: 10,
							rows: 3
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Testo completo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							defaultValue: editingArticle?.body,
							name: "body",
							required: true,
							minLength: 20,
							rows: 7
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Consiglio fantacalcio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							defaultValue: editingArticle?.fantasy_takeaway ?? "",
							name: "fantasyTakeaway",
							rows: 3
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Fonti (una per riga: Nome | URL)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							defaultValue: formatSources(editingArticle?.sources),
							name: "sources",
							rows: 3
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "editorial-file",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileImage, {}),
								" Immagine autorizzata",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									accept: "image/jpeg,image/png,image/webp",
									name: "image",
									type: "file"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "editorial-inline-fields",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Affidabilità", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								name: "reliability",
								defaultValue: editingArticle?.reliability ?? "in_evolution",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "high",
										children: "Alta"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "medium",
										children: "Media"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "in_evolution",
										children: "In evoluzione"
									})
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Stato", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								name: "status",
								defaultValue: editingArticle?.status ?? "draft",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "draft",
									children: "Bozza"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "published",
									children: "Pubblicata"
								})]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							disabled: busy || !databaseReady,
							type: "submit",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}),
								" ",
								editingArticle ? "Aggiorna news" : "Salva news"
							]
						})
					]
				}, editingArticle?.id ?? "new-article"), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: (event) => void save(event, "advice"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "editorial-form-title",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: editingAdvice ? "Modifica consiglio" : "Nuovo consiglio" }),
								editingAdvice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									"aria-label": "Annulla modifica",
									className: "editorial-cancel",
									onClick: () => setEditingAdvice(null),
									type: "button",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {})
								}) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "editorial-inline-fields",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Giornata", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								max: 38,
								min: 1,
								name: "matchday",
								required: true,
								type: "number",
								defaultValue: editingAdvice?.matchday ?? 1
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Categoria", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								name: "category",
								defaultValue: editingAdvice?.category ?? "start",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "start",
										children: "Da schierare"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "avoid",
										children: "Da evitare"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "differential",
										children: "Scommessa"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "top",
										children: "Top player"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "flop",
										children: "Flop possibile"
									})
								]
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Giocatore o tema", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							defaultValue: editingAdvice?.subject,
							name: "subject",
							required: true
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Partita", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							defaultValue: editingAdvice?.match_label ?? "",
							name: "matchLabel",
							placeholder: "Inter - Monza"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Motivazione", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							defaultValue: editingAdvice?.reason,
							name: "reason",
							required: true,
							minLength: 10,
							rows: 6
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "editorial-file",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileImage, {}),
								" Immagine autorizzata",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									accept: "image/jpeg,image/png,image/webp",
									name: "image",
									type: "file"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Stato", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							name: "status",
							defaultValue: editingAdvice?.status ?? "draft",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "draft",
								children: "Bozza"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "published",
								children: "Pubblicato"
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							disabled: busy || !databaseReady,
							type: "submit",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}),
								" ",
								editingAdvice ? "Aggiorna consiglio" : "Salva consiglio"
							]
						})
					]
				}, editingAdvice?.id ?? "new-advice")]
			}),
			databaseReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "editorial-content-lists",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentList, {
					items: articles.map((item) => ({
						id: item.id,
						label: item.title,
						meta: `${item.category} · ${item.status}`
					})),
					onDelete: (id) => remove("article", id),
					onEdit: (id) => setEditingArticle(articles.find((item) => item.id === id) ?? null),
					title: "News salvate"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContentList, {
					items: advice.map((item) => ({
						id: item.id,
						label: item.subject,
						meta: `${item.matchday}ª giornata · ${item.status}`
					})),
					onDelete: (id) => remove("advice", id),
					onEdit: (id) => setEditingAdvice(advice.find((item) => item.id === id) ?? null),
					title: "Consigli salvati"
				})]
			}) : null
		]
	});
}
function ContentList({ items, onDelete, onEdit, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "editorial-content-list",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: title }), items.length ? items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: item.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: item.meta })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "editorial-list-actions",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"aria-label": `Modifica ${item.label}`,
				onClick: () => onEdit(item.id),
				type: "button",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				"aria-label": `Elimina ${item.label}`,
				onClick: () => onDelete(item.id),
				type: "button",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
			})]
		})] }, item.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Nessun contenuto salvato." })]
	});
}
function formatSources(sources) {
	return sources?.map(({ label, url }) => `${label} | ${url}`).join("\n") ?? "";
}
//#endregion
export { EditorialAdminPanel };
