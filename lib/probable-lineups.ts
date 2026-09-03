import { upcomingMatches } from "./editorial-data";

export const PROBABLE_LINEUPS_SOURCE_URL = "https://www.gazzetta.it/Calcio/prob_form/";
export type PlayerRole = "Portiere" | "Difensore" | "Centrocampista" | "Attaccante";
export type PlayerSeasonStats = {
  appearances?: number;
  assists: number;
  goals: number;
  penalties: number;
  ratedAppearances?: number;
  redCards: number;
  season: number;
  source?: string;
  starts?: number;
  substituteAppearances?: number;
  updatedAt: string;
  yellowCards: number;
};
export type ProbablePlayer = { apiPlayerId?: number; name: string; probability: number; photoUrl?: string; role?: PlayerRole; shirtNumber?: number; stats?: PlayerSeasonStats; status: "starter" | "bench" };
export type TeamProbableLineup = { apiTeamId?: number; formation: string; bench: ProbablePlayer[]; players: ProbablePlayer[]; team: string };
export type TeamSplit = { away: string[]; home: string[] };
export type ProbableMatch = { away: TeamProbableLineup; dateLabel: string; home: TeamProbableLineup; note: string; slug: string; sourceUrl: string; stadium: string; timeLabel: string; unavailable: TeamSplit; updatedAt: string };

type MatchDetail = Omit<ProbableMatch, "dateLabel" | "slug" | "timeLabel">;
const details: Record<string, MatchDetail> = {
  "milan-venezia": game("Giuseppe Meazza",
    team("Milan", "3-4-2-1", ["Maignan|16", "Mario Gila|34", "De Winter|5", "Pavlovic|31", "Chukwueze|21", "Musah|80", "Jashari|30", "Estupinan|2", "Loftus-Cheek|8", "Cisse|70", "Goncalo Ramos|9"], ["Torriani|96", "Bouyer|41", "Terracciano|42", "Gabbia|46", "Diawara|13", "Bartesaghi|33", "Moreira|22", "Ricci|4", "Comotto|48", "Modric|14", "Rabiot|12", "Saelemaekers|56", "Pulisic|11", "Camarda|73"]),
    team("Venezia", "3-5-2", ["Stankovic|1", "Schingtienne|3", "Bella-Kotchap|17", "Franjic|4", "Hainaut|18", "Kike Perez|71", "Busio|6", "Basic|26", "Correia|14", "Adams|45", "Yeboah|10"], ["Montipo|96", "Moreno|2", "Haps|5", "Sagrado|20", "Halhal|25", "Gomes|95", "Fanne|8", "Farji|11", "Sohm|19", "Helgason|21", "Dagasso|30", "Panada|55", "Rrahmani|7", "Lauberbach|29", "Okoro|90"]),
    { home: ["Pietro Terracciano — da valutare"], away: ["Sverko — infortunato", "Adorante — infortunato"] }, "Turnover possibile nel Milan; il Venezia va verso la conferma della coppia Adams-Yeboah."),
  "fiorentina-frosinone": game("Artemio Franchi",
    team("Fiorentina", "4-3-2-1", ["De Gea|43", "Dodo|2", "Dragusin|3", "Ranieri|6", "Valdepenas|21", "Ndour|27", "Fagioli|44", "Brescianini|4", "Gudmundsson|10", "Mastantuono|30", "Pellegrino|32"], ["Christensen|53", "Lezzerini|19", "Pongracic|5", "Viery|33", "Joao Mario|17", "Jimenez|20", "Fabbian|80", "Oulai|42", "Mandragora|8", "Kospo|71", "Atta|14", "Kean|9"]),
    team("Frosinone", "4-3-3", ["Palmisani|22", "Monterisi|30", "Calvani|3", "Cittadini|2", "Terzic|71", "Schmid|10", "Calo|14", "Masini|73", "Fini|40", "Raimondo|9", "Kvernadze|17"], ["Pisseri|12", "Desplanches|91", "Amey|5", "Oyono|20", "Bracaglia|79", "Akpoguma|25", "Fayed|74", "El Azzouzi|34", "Grillitsch|27", "Cichella|16", "Hasa|70", "Koutsoupias|8", "Zerbin|24"]),
    { home: ["Parisi — Infortunato — Lesione del legamento crociato anteriore del ginocchio destro; operato il 18 maggio 2026 — recupero indicativo di 5-6 mesi dall’intervento; data esatta da confermare"], away: [] }, "La Fiorentina può cambiare il riferimento offensivo; il Frosinone valuta aggiustamenti dopo il primo turno."),
  "monza-udinese": game("U-Power Stadium",
    team("Monza", "3-4-2-1", ["Pizzignacco|13", "Kouadio|60", "Lucchesi|3", "Carboni|44", "Birindelli|19", "Foe Ondoa|8", "Mout|80", "Mangas|7", "Colpani|28", "Varela|9", "Dany Mota|47"], ["Strajnar|43", "Antov|6", "Bakoune|24", "Galazzi|23", "Forson|11", "Loubao|22", "Robinson|46", "Thiam|20"]),
    team("Udinese", "3-4-2-1", ["Okoye|40", "Abankwah|14", "Solet|28", "Bertola|13", "Vojvoda|23", "Karlstrom|8", "Piotrowski|24", "Kamara|11", "Ekkelenkamp|32", "Unai Gomez|46", "Bayo|15"], ["Padelli|93", "Piana|99", "Ebosse|77", "Mlacic|22", "Arizala|20", "Lovric|4", "Pejicic|79", "Miller|38", "Zarraga|6"]),
    { home: [], away: ["Kabasele — squalificato"] }, "Monza ancora in assestamento; l'Udinese deve gestire l'assenza di Kabasele."),
  "sassuolo-torino": game("Mapei Stadium",
    team("Sassuolo", "4-3-3", ["Muric|49", "Cinquegrano|46", "Odenthal|26", "Leysen|16", "Doig|3", "Adzic|17", "Matic|18", "Bakola|50", "Volpato|7", "Bowie|9", "Lauriente|45"], ["Turati|80", "Satalino|12", "Nyarko|22", "Walukiewicz|6", "Missori|2", "Di Bitonto|23", "Obrador|33", "Ghion|8", "Thorstvedt|42", "Ciervo|20", "Lipani|35", "Iannoni|44", "Nuamah|30", "Pierini|77", "Dominguez|25"]),
    team("Torino", "3-4-2-1", ["Mascardi|26", "Comuzzo|15", "Coco|23", "Comert|5", "Pedersen|16", "Gineitis|66", "Fitz-Jim|28", "Cacciamani|77", "Vlasic|10", "Casadei|22", "Simeone|18"], ["Paleari|1", "Siviero|76", "Pellini|25", "Luongo|79", "Ilkhan|6", "Ilic|8", "Biraghi|3", "Njie|92", "Kulenovic|17", "Aboukhlal|7", "Adams|19", "Gabellini|84", "Oristanio|11"]),
    { home: ["Berardi — da valutare", "Boloca — da valutare"], away: ["Anjorin — da valutare", "Zapata — da valutare"] }, "Sassuolo verso la conferma del tridente; nel Torino rientra Comert."),
  "juventus-parma": game("Allianz Stadium",
    team("Juventus", "4-2-3-1", ["Vicario|1", "Kalulu|15", "Bremer|3", "Kelly|6", "Cambiaso|20", "Locatelli|5", "McKennie|22", "Conceicao|7", "Alajbegovic|17", "Boga|13", "Kolo Muani|9"], ["Pinsoglio|23", "Celik|2", "Rugani|24", "Lucumi|26", "Cabal|32", "Thuram|19", "Koopmeiners|8", "Zhegrova|11", "Miretti|21", "Milik|14", "David|30"]),
    team("Parma", "4-3-3", ["Corvi|40", "Delprato|15", "Troilo|3", "Valenti|5", "Valeri|14", "Sorensen|24", "Keita|16", "Bernabe|10", "Almqvist|11", "Romero|9", "Toure|7"], ["Daffara|30", "Mazzocchi|78", "Carboni|29", "Drobnic|72", "Konate|47", "Kouda|80", "Cremaschi|25", "Frigan|20", "Zouin|21", "Elphege|23"]),
    { home: ["Gatti — da valutare", "Yildiz — da valutare"], away: ["Nicolussi Caviglia — da valutare"] }, "Vicario è indicato tra i pali; Alajbegovic può prendere il posto di Yildiz."),
  "napoli-como": game("Diego Armando Maradona",
    team("Napoli", "4-3-3", ["Meret|1", "Di Lorenzo|22", "Rrahmani|13", "Rafa Marin|16", "Spinazzola|37|60", "Anguissa|99|60", "Lobotka|68", "McTominay|8", "Politano|21", "Hojlund|9", "Alisson Santos|27"], ["Contini|14", "Milinkovic-Savic|32", "Favasuli|2", "Beukema|31", "Olivera|17", "Gilmour|6", "De Bruyne|11", "Lucca|20", "Giovane|23", "Lang|70", "Neres|7", "Badiashile|5"]),
    team("Como", "4-2-3-1", ["Butez|1", "Couto|16", "Ramon|14", "Chalobah|99", "Kaiki|4", "Perrone|23", "Da Cunha|33", "Diao|38", "Nico Paz|10", "Baturina|20", "Douvikas|11"], ["Tornqvist|21", "Vigorito|22", "Kempf|2", "Valle|3", "Goldaniga|5", "Milla|6", "Morata|7", "Caqueret|8", "Dossena|13", "Lahdo|15", "Rodriguez|17", "Kuhn|19", "Smolcic|28", "Liberali|30"]),
    { home: ["Buongiorno — infortunato", "Marianucci — infortunato"], away: ["Addai — da valutare"] }, "Spinazzola e Anguissa sono avanti di misura; il Como appare più stabile nel suo 4-2-3-1."),
  "cagliari-inter": game("Unipol Domus",
    team("Cagliari", "4-3-2-1", ["Caprile|1", "Ze Pedro|2", "Deiola|14", "Rodriguez|15", "Obert|33", "Romano|4", "Winks|6", "Adopo|8", "Fazzini|10", "Maldini|70", "Mendy|31"], ["Sherri|12", "Radunovic|23", "Kofler|22", "Aurelio|23", "Zappa|28", "Mina|26", "Prati|16", "Liteta|27", "Kevin Carlos|9", "Kingstone|18", "Cavuoti|20", "Borrelli|29", "Sulev|32", "Felici|17"]),
    team("Inter", "3-5-2", ["J. Martinez|1", "Bisseck|31", "Akanji|25", "Bastoni|95", "Diouf|17", "Barella|23", "Calhanoglu|20", "Zielinski|7|70", "Dimarco|32", "Pio Esposito|94", "Lautaro|10|65"], ["Provedel|49", "Di Gennaro|12", "Stones|6", "Carlos Augusto|30", "Pavard|28", "Bovio|46", "Stankovic|5", "Sucic|8", "Luis Henrique|11", "Thuram|9", "Bonny|14", "Iddrissou|52"]),
    { home: ["Idrissi — da valutare", "Trepy — da valutare"], away: [] }, "L'Inter conferma Diouf a destra; Lautaro e Zielinski restano avanti nei rispettivi confronti interni."),
  "lazio-genoa": game("Olimpico",
    team("Lazio", "4-3-3", ["Mandas|35", "Floriani|15", "Doekhi|5", "Provstgaard|25", "Pedraza|23", "Frattesi|16", "Rovella|6", "Taylor|24", "Cancellieri|22", "Dia|19", "Zaccagni|10"], ["Motta|40", "Renzetti|59", "Lazzari|29", "Pellegrini|3", "Bordon|33", "Belahyane|21", "Galassi|8", "Farcomeni|71", "Przyborek|28", "Noslin|14", "Serra|63", "Ratkov|20", "Tavares|17", "Isaksen|11"]),
    team("Genoa", "3-4-1-2", ["Bijlow|1", "Marcandalli|27", "Ostigard|5", "Vasquez|22", "Norton-Cuffy|15", "Frendrup|32", "Sow|97", "Ellertsson|77", "Baldanzi|8", "Vitinha|9", "Colombo|29"], ["Stolz|99", "Sommariva|39", "Martin|3", "Vaz|85", "Doucoure|74", "Amorim|4", "Havel|17", "Puczka|31", "Otoa|34", "Sabelli|20", "Zulevic|80", "Mitaj|2", "Messias|10"]),
    { home: ["Romagnoli — indisponibile", "Cataldi — infortunato", "Marusic — da valutare", "Dele-Bashiru — da valutare"], away: ["Traore — infortunato", "Venturino — da valutare", "Meichtry — infortunato"] }, "Frattesi è la novità prevista nella Lazio; il Genoa può affidare a Sow la prima maglia da titolare."),
  "lecce-roma": game("Via del Mare",
    team("Lecce", "4-3-3", ["Falcone|30", "Veiga|17", "Gaspar|4", "Siebert|5", "Gallo|25", "Coulibaly|29", "Ngom|79", "Gorter|28", "Pierotti|50", "Geubbels|69", "N'Dri|11"], ["Bleve|1", "Penev|33", "Tiago Gabriel|44", "Ndaba|3", "Fofana|8", "Gandelman|16", "Maleh|14", "Stulic|9", "Esteban|22", "Laerke|34"]),
    team("Roma", "3-4-1-2", ["Svilar|99", "Mancini|23", "Ndicka|5", "Hermoso|22", "Lulli|77", "Pisilli|61", "Cristante|4", "Wesley|43", "Mora|86", "Dybala|21", "Malen|14|82|/players/donyell-malen.png"], ["Gollini|95", "De Marzi|70", "Koulierakis|3", "Ghilardi|87", "Reale|75", "Ziolkowski|24", "El Aynaoui|8", "Mannini|60", "Vaz|78", "Soule|18", "Castro|9"]),
    { home: ["Berisha — da valutare"], away: ["Pellegrini — da valutare", "Rensch — da valutare", "Kone — da valutare", "Molina — da valutare"] }, "Malen è indicato accanto a Dybala; nella Roma restano da verificare Kone e Molina."),
  "atalanta-bologna": game("New Balance Arena",
    team("Atalanta", "4-3-3", ["Carnesecchi|29", "Bellanova|16", "Scalvini|42", "Kolasinac|23", "Bernasconi|47", "Pasalic|8", "Ederson|13", "Gaetano|70", "Zalewski|59", "Krstovic|90", "Raspadori|18"], ["Sportiello|57", "Vismara|95", "Cassa|49", "Obric|40", "Samardzic|10", "Sulemana|6", "De Roon|15", "De Ketelaere|17", "Scamacca|9"]),
    team("Bologna", "4-3-3", ["Skorupski|1", "Zortea|20", "Helland|5", "Heggem|17", "Miranda|33", "Bernardeschi|10", "El Azzouzi|17", "Ferguson|19", "Orsolini|7", "Piccoli|91", "Rowe|11"], ["Pessina|25", "Happonen|72", "Vitik|41", "De Silvestri|29", "Holm|2", "Alhassane|23", "Moro|6", "Pobega|4", "Amondarain|8", "Libra|18", "Odgaard|21", "Cambiaghi|28", "Dovbyk|9"]),
    { home: ["Hien — da valutare", "Sulemana — infortunato", "Ahanor — infortunato", "Kristensen — da valutare"], away: [] }, "Le scelte dell'Atalanta dipendono anche dall'impegno europeo; Bernardeschi può partire dall'inizio nel Bologna."),
};

export const probableMatches: ProbableMatch[] = upcomingMatches.map((match) => ({ ...details[match.slug], dateLabel: match.dateLabel, slug: match.slug, timeLabel: match.timeLabel }));
export function getProbableMatch(slug: string) { return probableMatches.find((match) => match.slug === slug); }
export function getPlayerSlug(teamName: string, name: string) { return `${slugify(teamName)}-${slugify(name.replace(/\./g, ""))}`; }
export function getProbablePlayers() {
  const players = probableMatches.flatMap((match) => [match.home, match.away].flatMap((lineup) => [...lineup.players, ...lineup.bench].map((player) => ({ ...player, matchLabel: `${match.home.team} - ${match.away.team}`, matchSlug: match.slug, slug: getPlayerSlug(lineup.team, player.name), team: lineup.team, updatedAt: match.updatedAt }))));
  return Array.from(new Map(players.map((player) => [player.slug, player])).values());
}
export function getProbablePlayer(slug: string) { return getProbablePlayers().find((player) => player.slug === slug); }

function team(name: string, formation: string, starterRows: string[], benchRows: string[]): TeamProbableLineup {
  const players = assignRoles(starterRows.map((row) => parsePlayer(row, "starter")), formation);
  const starters = new Set(players.map((player) => player.name));
  return { bench: benchRows.map((row) => parsePlayer(row, "bench")).filter((player) => !starters.has(player.name)), formation, players, team: name };
}
function parsePlayer(row: string, status: "starter" | "bench"): ProbablePlayer {
  const [name, number, probability, photoUrl] = row.split("|");
  return { name, photoUrl: photoUrl || undefined, probability: probability ? Number(probability) : status === "starter" ? 80 : 25, shirtNumber: number ? Number(number) : undefined, status };
}
function game(stadium: string, home: TeamProbableLineup, away: TeamProbableLineup, unavailable: TeamSplit, note: string): MatchDetail {
  return { away, home, note, sourceUrl: PROBABLE_LINEUPS_SOURCE_URL, stadium, unavailable, updatedAt: "27 agosto 2026, 12:00" };
}
function assignRoles(players: ProbablePlayer[], formation: string) {
  const lines = formation.split("-").map(Number); const defendersEnd = 1 + (lines[0] ?? 0); const attackersStart = players.length - (lines.at(-1) ?? 0);
  return players.map((player, index) => ({ ...player, role: index === 0 ? "Portiere" as const : index < defendersEnd ? "Difensore" as const : index >= attackersStart ? "Attaccante" as const : "Centrocampista" as const }));
}
function slugify(value: string) { return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
