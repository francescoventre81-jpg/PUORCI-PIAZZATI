import { E as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
import { t as createLucideIcon } from "./createLucideIcon-C6U3vCuc.js";
import { t as createClient } from "./client-C53U2VZU.js";
import { t as TeamCrest } from "./team-crest-BCOb68kJ.js";
import { n as Camera, t as Save } from "./save-DJuEQWKH.js";
import { t as CalendarDays } from "./calendar-days-DAQlpUux.js";
//#region node_modules/.pnpm/lucide-react@0.468.0_react@19.2.6/node_modules/lucide-react/dist/esm/icons/shield.js
/**
* @license lucide-react v0.468.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var Shield = createLucideIcon("Shield", [["path", {
	d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
	key: "oel41y"
}]]);
//#endregion
//#region components/league-admin-panel.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function LeagueAdminPanel({ initialConfig }) {
	const [config, setConfig] = (0, import_react.useState)(() => structuredClone(initialConfig));
	const [matchday, setMatchday] = (0, import_react.useState)(3);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const fixtures = (0, import_react.useMemo)(() => config.fixtures.filter((item) => item.matchday === matchday), [config.fixtures, matchday]);
	function updateStanding(index, patch) {
		setConfig((current) => ({
			...current,
			standings: current.standings.map((row, rowIndex) => rowIndex === index ? {
				...row,
				...patch
			} : row)
		}));
	}
	function updateTeam(index, patch) {
		setConfig((current) => ({
			...current,
			teams: current.teams.map((row, rowIndex) => rowIndex === index ? {
				...row,
				...patch
			} : row)
		}));
	}
	async function uploadLogo(index, file) {
		if (!file) return;
		setBusy(true);
		const supabase = createClient();
		const extension = file.name.split(".").pop()?.toLowerCase() || "png";
		const path = `team-logos/${crypto.randomUUID()}.${extension}`;
		const { error } = await supabase.storage.from("editorial-images").upload(path, file, {
			contentType: file.type,
			upsert: false
		});
		if (error) setMessage(error.message);
		else updateTeam(index, { logoUrl: supabase.storage.from("editorial-images").getPublicUrl(path).data.publicUrl });
		setBusy(false);
	}
	async function save() {
		setBusy(true);
		setMessage("");
		try {
			const response = await fetch("/api/admin/league", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ config })
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error || "Salvataggio non riuscito.");
			if (result.config) setConfig(result.config);
			setMessage(result.message || "Serie A pubblicata.");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Salvataggio non riuscito.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "admin-section league-admin",
		id: "serie-a-admin",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "lineups-admin-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "SERIE A CONTROL ROOM" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Calendario, classifica e squadre" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Tutto è modificabile a mano e non usa crediti API. Salva per pubblicare le modifiche." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					disabled: busy,
					onClick: () => void save(),
					type: "button",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, {}),
						" ",
						busy ? "Salvataggio…" : "Pubblica Serie A"
					]
				})]
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "admin-message",
				children: message
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "league-admin-block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {}), " Classifica"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "league-admin-table-wrap",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "league-admin-table",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "#" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Squadra" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "PG" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "V" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "N" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "P" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "GF" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "GS" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "DR" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "PT" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: config.standings.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: index + 1 }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.team }),
							[
								"played",
								"wins",
								"draws",
								"losses",
								"goalsFor",
								"goalsAgainst",
								"goalDifference",
								"points"
							].map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								"aria-label": `${row.team} ${key}`,
								type: "number",
								value: row[key],
								onChange: (event) => updateStanding(index, { [key]: Number(event.target.value) })
							}) }, key))
						] }, row.team)) })]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "league-admin-block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "league-admin-block-title",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {}), " Calendario"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Giornata ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: matchday,
						onChange: (event) => setMatchday(Number(event.target.value)),
						children: Array.from({ length: 38 }, (_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: index + 1,
							children: index + 1
						}, index + 1))
					})] })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "fixture-admin-list",
					children: fixtures.map((fixture) => {
						const fixtureIndex = config.fixtures.findIndex((row) => row.id === fixture.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "fixture-admin-row",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: fixture.home }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									"aria-label": "Risultato",
									placeholder: "-",
									value: fixture.score ?? "",
									onChange: (event) => setConfig((current) => ({
										...current,
										fixtures: current.fixtures.map((row, index) => index === fixtureIndex ? {
											...row,
											score: event.target.value || null,
											finished: Boolean(event.target.value)
										} : row)
									}))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: fixture.away }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									"aria-label": "Data e ora",
									type: "datetime-local",
									value: fixture.kickoff ? fixture.kickoff.slice(0, 16) : "",
									onChange: (event) => setConfig((current) => ({
										...current,
										fixtures: current.fixtures.map((row, index) => index === fixtureIndex ? {
											...row,
											kickoff: new Date(event.target.value).toISOString()
										} : row)
									}))
								})
							]
						}, fixture.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "league-admin-block",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {}), " Schede e loghi delle squadre"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "team-admin-grid",
					children: config.teams.map((team, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "team-admin-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamCrest, {
								logoUrl: team.logoUrl,
								team: team.team
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: team.team }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Modifica" })
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "team-logo-admin",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamCrest, {
										logoUrl: team.logoUrl,
										team: team.team,
										size: 74
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {}),
										" Carica logo",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											accept: "image/jpeg,image/png,image/webp,image/svg+xml",
											onChange: (event) => void uploadLogo(index, event.target.files?.[0]),
											type: "file"
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										placeholder: "Oppure URL del logo",
										value: team.logoUrl ?? "",
										onChange: (event) => updateTeam(index, { logoUrl: event.target.value })
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Descrizione della squadra", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 4,
								value: team.description,
								onChange: (event) => updateTeam(index, { description: event.target.value })
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Consigli fantacalcio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								rows: 4,
								value: team.advice,
								onChange: (event) => updateTeam(index, { advice: event.target.value })
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
								"Infortunati ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "(uno per riga, puoi aggiungere diagnosi e rientro)" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 5,
									value: team.injured.join("\n"),
									onChange: (event) => updateTeam(index, { injured: event.target.value.split("\n").filter(Boolean) })
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
								"Squalificati ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "(uno per riga)" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 4,
									value: team.suspended.join("\n"),
									onChange: (event) => updateTeam(index, { suspended: event.target.value.split("\n").filter(Boolean) })
								})
							] })
						] })]
					}, team.slug))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lineups-admin-sticky",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					disabled: busy,
					onClick: () => void save(),
					type: "button",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, {}), " Pubblica aggiornamenti Serie A"]
				})
			})
		]
	});
}
//#endregion
export { LeagueAdminPanel };
