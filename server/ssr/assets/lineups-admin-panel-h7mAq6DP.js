import { E as __toESM, b as require_react, t as require_jsx_runtime } from "../index.js";
import { t as createLucideIcon } from "./createLucideIcon-C6U3vCuc.js";
import { n as Plus, t as Trash2 } from "./trash-2-DJ9d6da7.js";
import { t as createClient } from "./client-C53U2VZU.js";
import { t as Image } from "./image-DUVK778_.js";
import { n as Users, t as defaultTeamLogo } from "./league-data-CTAqxlaT.js";
import { t as TeamCrest } from "./team-crest-BCOb68kJ.js";
import { n as Camera, t as Save } from "./save-DJuEQWKH.js";
//#region node_modules/.pnpm/lucide-react@0.468.0_react@19.2.6/node_modules/lucide-react/dist/esm/icons/chart-column.js
/**
* @license lucide-react v0.468.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ChartColumn = createLucideIcon("ChartColumn", [
	["path", {
		d: "M3 3v16a2 2 0 0 0 2 2h16",
		key: "c24i48"
	}],
	["path", {
		d: "M18 17V9",
		key: "2bz60n"
	}],
	["path", {
		d: "M13 17V5",
		key: "1frdt8"
	}],
	["path", {
		d: "M8 17v-3",
		key: "17ska0"
	}]
]);
//#endregion
//#region node_modules/.pnpm/lucide-react@0.468.0_react@19.2.6/node_modules/lucide-react/dist/esm/icons/chevron-down.js
/**
* @license lucide-react v0.468.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var ChevronDown = createLucideIcon("ChevronDown", [["path", {
	d: "m6 9 6 6 6-6",
	key: "qrunsl"
}]]);
//#endregion
//#region node_modules/.pnpm/lucide-react@0.468.0_react@19.2.6/node_modules/lucide-react/dist/esm/icons/cloud-download.js
/**
* @license lucide-react v0.468.0 - ISC
*
* This source code is licensed under the ISC license.
* See the LICENSE file in the root directory of this source tree.
*/
var CloudDownload = createLucideIcon("CloudDownload", [
	["path", {
		d: "M12 13v8l-4-4",
		key: "1f5nwf"
	}],
	["path", {
		d: "m12 21 4-4",
		key: "1lfcce"
	}],
	["path", {
		d: "M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284",
		key: "ui1hmy"
	}]
]);
//#endregion
//#region components/lineups-admin-panel.tsx
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var roles = [
	"Portiere",
	"Difensore",
	"Centrocampista",
	"Attaccante"
];
function LineupsAdminPanel({ initialMatches }) {
	const [matches, setMatches] = (0, import_react.useState)(() => structuredClone(initialMatches));
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [importing, setImporting] = (0, import_react.useState)(false);
	const [importState, setImportState] = (0, import_react.useState)(null);
	const [message, setMessage] = (0, import_react.useState)("");
	const teams = (0, import_react.useMemo)(() => matches.flatMap((match, matchIndex) => [{
		match,
		matchIndex,
		side: "home"
	}, {
		match,
		matchIndex,
		side: "away"
	}]), [matches]);
	(0, import_react.useEffect)(() => {
		let active = true;
		async function loadStatus() {
			try {
				const response = await fetch("/api/admin/lineups/import", { cache: "no-store" });
				const result = await response.json();
				if (active && response.ok) setImportState(result.state ?? null);
			} catch {}
		}
		loadStatus();
		const interval = window.setInterval(() => void loadStatus(), 3e4);
		return () => {
			active = false;
			window.clearInterval(interval);
		};
	}, []);
	function updateTeam(matchIndex, side, update) {
		setMatches((current) => current.map((match, index) => index === matchIndex ? {
			...match,
			[side]: update(match[side])
		} : match));
	}
	function updateMatch(matchIndex, field, value) {
		setMatches((current) => current.map((match, index) => index === matchIndex ? {
			...match,
			[field]: value
		} : match));
	}
	async function saveAll() {
		setBusy(true);
		setMessage("");
		try {
			const response = await fetch("/api/admin/lineups", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ matches })
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error ?? "Pubblicazione non riuscita.");
			setMessage(result.message ?? "Formazioni pubblicate.");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Pubblicazione non riuscita.");
		} finally {
			setBusy(false);
		}
	}
	async function startImport() {
		if (!window.confirm("Avviare l'importazione automatica di tutte le rose e fotografie? Puoi chiudere questa pagina: il server continuerà da solo e salverà ogni squadra completata.")) return;
		setImporting(true);
		setMessage("");
		try {
			const response = await fetch("/api/admin/lineups/import", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "start" })
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error ?? "Importazione non riuscita.");
			setImportState(result.state ?? null);
			setMessage("Importazione avviata. Puoi uscire: Cloudflare continuerà automaticamente e salverà ogni squadra completata.");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Importazione non riuscita.");
		} finally {
			setImporting(false);
		}
	}
	async function updateStatistics(teamName) {
		setBusy(true);
		setMessage("");
		try {
			const response = await fetch("/api/admin/lineups/statistics", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ teamName })
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error ?? "Aggiornamento statistiche non riuscito.");
			if (result.matches) setMatches(result.matches);
			setMessage(result.message ?? "Statistiche aggiornate.");
		} catch (error) {
			setMessage(error instanceof Error ? error.message : "Aggiornamento statistiche non riuscito.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "admin-section lineups-admin",
		id: "formazioni",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "lineups-admin-heading",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "FORMAZIONI LIVE" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Squadre e calciatori" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Modifica rose, titolari, panchina, percentuali e fotografie. Un solo salvataggio aggiorna il sito pubblico." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "lineups-admin-heading-actions",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "secondary",
						disabled: busy || importing || importState?.status === "running",
						onClick: () => void startImport(),
						type: "button",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudDownload, {}),
							" ",
							importing ? "Avvio…" : importState?.status === "running" ? `Importazione ${importState.processedTeams.length}/${importState.totalTeams}` : "Avvia importazione automatica"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						disabled: busy,
						onClick: () => void saveAll(),
						type: "button",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, {}),
							" ",
							busy ? "Salvataggio…" : "Pubblica tutte"
						]
					})]
				})]
			}),
			message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "admin-message",
				children: message
			}) : null,
			importState ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportProgress, { state: importState }) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lineups-admin-summary",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {}),
					" ",
					teams.length,
					" squadre · ",
					teams.reduce((total, item) => total + item.match[item.side].players.length + item.match[item.side].bench.length, 0),
					" calciatori gestibili"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lineups-admin-list",
				children: teams.map(({ match, matchIndex, side }) => {
					const team = match[side];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
						className: "lineups-admin-team",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamCrest, {
								logoUrl: defaultTeamLogo(team.team),
								team: team.team,
								size: 48
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: team.team }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("small", { children: [
								match.home.team,
								" – ",
								match.away.team
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: team.formation }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "lineups-admin-team-body",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "lineups-admin-match-fields",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Modulo", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: team.formation,
											onChange: (event) => updateTeam(matchIndex, side, (row) => ({
												...row,
												formation: event.target.value
											}))
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Data", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: match.dateLabel,
											onChange: (event) => updateMatch(matchIndex, "dateLabel", event.target.value)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Ora", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: match.timeLabel,
											onChange: (event) => updateMatch(matchIndex, "timeLabel", event.target.value)
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: ["Stadio", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: match.stadium,
											onChange: (event) => updateMatch(matchIndex, "stadium", event.target.value)
										})] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "lineups-admin-note",
									children: ["Nota partita", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										rows: 2,
										value: match.note,
										onChange: (event) => updateMatch(matchIndex, "note", event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									className: "team-stats-update",
									disabled: busy,
									onClick: () => void updateStatistics(team.team),
									type: "button",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, {}),
										" Aggiorna statistiche di ",
										team.team
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosterEditor, {
									lineup: team,
									onChange: (next) => updateTeam(matchIndex, side, () => next)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "lineups-admin-note",
									children: ["Assenti e dubbi", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										rows: 3,
										value: match.unavailable[side].join("\n"),
										onChange: (event) => setMatches((current) => current.map((row, index) => index === matchIndex ? {
											...row,
											unavailable: {
												...row.unavailable,
												[side]: event.target.value.split("\n").filter(Boolean)
											}
										} : row))
									})]
								})
							]
						})]
					}, `${match.slug}-${side}`);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lineups-admin-sticky",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					disabled: busy,
					onClick: () => void saveAll(),
					type: "button",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, {}),
						" ",
						busy ? "Salvataggio…" : "Pubblica aggiornamenti"
					]
				})
			})
		]
	});
}
function ImportProgress({ state }) {
	const nextTeam = state.resolvedTeams?.[state.nextTeamIndex]?.siteName;
	if (state.status === "running") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "admin-message",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
				"Importazione automatica attiva: ",
				state.processedTeams.length,
				" di ",
				state.totalTeams,
				" squadre completate."
			] }),
			nextTeam ? ` Prossima squadra: ${nextTeam}.` : " Preparazione elenco squadre in corso.",
			state.failedTeams.length ? ` Non completate dopo tre tentativi: ${state.failedTeams.join(", ")}.` : "",
			state.lastError ? ` Ultimo avviso: ${state.lastError}` : "",
			" ",
			"Puoi chiudere la pagina: il lavoro continua sul server."
		]
	});
	if (state.status === "completed") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "admin-message",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
				"Importazione terminata: ",
				state.processedTeams.length,
				" squadre completate."
			] }),
			state.failedTeams.length ? ` Da controllare manualmente: ${state.failedTeams.join(", ")}.` : " Tutte le rose disponibili sono state salvate.",
			" Ricarica la pagina per vedere i dati aggiornati."
		]
	});
	return null;
}
function RosterEditor({ lineup, onChange }) {
	function update(status, index, patch) {
		const key = status === "starter" ? "players" : "bench";
		onChange({
			...lineup,
			[key]: lineup[key].map((player, playerIndex) => playerIndex === index ? {
				...player,
				...patch
			} : player)
		});
	}
	function move(status, index) {
		const from = status === "starter" ? "players" : "bench";
		const to = status === "starter" ? "bench" : "players";
		const player = {
			...lineup[from][index],
			status: status === "starter" ? "bench" : "starter"
		};
		onChange({
			...lineup,
			[from]: lineup[from].filter((_, i) => i !== index),
			[to]: [...lineup[to], player]
		});
	}
	function remove(status, index) {
		const key = status === "starter" ? "players" : "bench";
		if (!window.confirm("Eliminare questo calciatore dalla rosa visualizzata?")) return;
		onChange({
			...lineup,
			[key]: lineup[key].filter((_, i) => i !== index)
		});
	}
	function add(status) {
		const key = status === "starter" ? "players" : "bench";
		onChange({
			...lineup,
			[key]: [...lineup[key], {
				name: "Nuovo calciatore",
				probability: status === "starter" ? 70 : 25,
				role: "Centrocampista",
				status
			}]
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "roster-admin-columns",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosterList, {
			title: "Titolari",
			players: lineup.players,
			status: "starter",
			onAdd: () => add("starter"),
			onMove: move,
			onRemove: remove,
			onUpdate: update
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosterList, {
			title: "Panchina",
			players: lineup.bench,
			status: "bench",
			onAdd: () => add("bench"),
			onMove: move,
			onRemove: remove,
			onUpdate: update
		})]
	});
}
function RosterList({ title, players, status, onAdd, onMove, onRemove, onUpdate }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "roster-admin-list",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", { children: [
			title,
			" ",
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: players.length })
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: onAdd,
			type: "button",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {}), " Aggiungi"]
		})] }), players.map((player, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerEditor, {
			player,
			status,
			onMove: () => onMove(status, index),
			onRemove: () => onRemove(status, index),
			onUpdate: (patch) => onUpdate(status, index, patch)
		}, `${player.name}-${index}`))]
	});
}
function PlayerEditor({ player, status, onMove, onRemove, onUpdate }) {
	const [uploading, setUploading] = (0, import_react.useState)(false);
	async function upload(file) {
		if (!file) return;
		setUploading(true);
		const supabase = createClient();
		const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
		const path = `players/${crypto.randomUUID()}.${extension}`;
		const { error } = await supabase.storage.from("editorial-images").upload(path, file, {
			contentType: file.type,
			upsert: false
		});
		if (!error) onUpdate({ photoUrl: supabase.storage.from("editorial-images").getPublicUrl(path).data.publicUrl });
		else window.alert(error.message);
		setUploading(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "roster-player-editor",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "roster-player-photo",
				children: [player.photoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Image, {
					alt: "",
					fill: true,
					sizes: "46px",
					src: player.photoUrl,
					unoptimized: true
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: player.shirtNumber ?? initials(player.name) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					title: "Carica foto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Camera, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							accept: "image/jpeg,image/png,image/webp",
							onChange: (event) => void upload(event.target.files?.[0]),
							type: "file"
						}),
						" "
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "roster-player-fields",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						"aria-label": "Nome calciatore",
						value: player.name,
						onChange: (event) => onUpdate({ name: event.target.value })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							"aria-label": "Ruolo",
							value: player.role ?? "Centrocampista",
							onChange: (event) => onUpdate({ role: event.target.value }),
							children: roles.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: role }, role))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							"aria-label": "Numero maglia",
							max: 99,
							min: 1,
							placeholder: "#",
							type: "number",
							value: player.shirtNumber ?? "",
							onChange: (event) => onUpdate({ shirtNumber: Number(event.target.value) || void 0 })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							"aria-label": "Probabilità titolarità",
							max: 100,
							min: 0,
							type: "number",
							value: player.probability,
							onChange: (event) => onUpdate({ probability: Number(event.target.value) })
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						"aria-label": "URL foto",
						placeholder: "URL foto autorizzata",
						value: player.photoUrl ?? "",
						onChange: (event) => onUpdate({ photoUrl: event.target.value || void 0 })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "roster-player-stat-fields",
						children: [
							["starts", "Titolare"],
							["substituteAppearances", "Subentri"],
							["ratedAppearances", "Con voto"],
							["appearances", "Presenze"],
							["goals", "Gol"],
							["assists", "Assist"],
							["penalties", "Rigori"],
							["yellowCards", "Gialli"],
							["redCards", "Rossi"]
						].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							min: 0,
							type: "number",
							value: player.stats?.[key] ?? 0,
							onChange: (event) => onUpdate({ stats: {
								assists: 0,
								goals: 0,
								penalties: 0,
								redCards: 0,
								season: (/* @__PURE__ */ new Date()).getFullYear(),
								starts: 0,
								substituteAppearances: 0,
								updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
								yellowCards: 0,
								...player.stats,
								[key]: Math.max(0, Number(event.target.value) || 0)
							} })
						})] }, key))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "roster-player-actions",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					disabled: uploading,
					onClick: onMove,
					type: "button",
					children: status === "starter" ? "In panchina" : "Titolare"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					"aria-label": `Elimina ${player.name}`,
					onClick: onRemove,
					type: "button",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {})
				})]
			})
		]
	});
}
function initials(value) {
	return value.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
//#endregion
export { LineupsAdminPanel };
