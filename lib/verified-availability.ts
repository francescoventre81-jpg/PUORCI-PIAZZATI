import { samePlayerName, sameTeamName } from "./api-football";

type AvailabilityStatus = "Da valutare" | "Indisponibile" | "Infortunato" | "Squalificato";
type VerifiedAvailability = {
  detail?: string;
  player: string;
  remove?: boolean;
  returnInfo?: string;
  status?: AvailabilityStatus;
  team: string;
};

const undisclosed = "Assenza segnalata per la 2ª giornata; diagnosi non resa pubblica dalle fonti consultate";

// Verifica editoriale del 31 agosto 2026. Se la diagnosi non è pubblica,
// viene dichiarato esplicitamente senza dedurla.
const verifiedAvailability: VerifiedAvailability[] = [
  { team: "Milan", player: "Pietro Terracciano", status: "Da valutare", detail: undisclosed, returnInfo: "data non comunicata" },
  { team: "Venezia", player: "Sverko", status: "Infortunato", detail: "Indisponibilità confermata; diagnosi non resa pubblica dalle fonti consultate", returnInfo: "indicativamente dalla 8ª giornata" },
  { team: "Venezia", player: "Adorante", status: "Infortunato", detail: "In recupero dopo un intervento chirurgico; il club non ha reso pubblica la diagnosi completa", returnInfo: "indicativamente dalla 8ª giornata" },
  { team: "Fiorentina", player: "Parisi", status: "Infortunato", detail: "Lesione del legamento crociato anteriore del ginocchio destro; operato il 18 maggio 2026", returnInfo: "recupero indicativo di 5-6 mesi dall’intervento; data esatta da confermare" },
  { team: "Udinese", player: "Kabasele", status: "Squalificato", detail: "Una giornata di squalifica", returnInfo: "disponibile dalla 3ª giornata" },
  { team: "Sassuolo", player: "Berardi", status: "Da valutare", detail: "Problema alla caviglia che lo ha tenuto fuori anche in Coppa Italia", returnInfo: "recupero da verificare con le prossime convocazioni" },
  { team: "Sassuolo", player: "Boloca", status: "Da valutare", detail: undisclosed, returnInfo: "data non comunicata" },
  { team: "Torino", player: "Anjorin", status: "Infortunato", detail: "Trauma distorsivo-contusivo all’anca sinistra; recupero ancora in corso", returnInfo: "data non comunicata dal club" },
  { team: "Torino", player: "Zapata", status: "Infortunato", detail: "Problema al ginocchio sinistro e lavoro differenziato durante la preparazione", returnInfo: "data non comunicata" },
  { team: "Juventus", player: "Gatti", status: "Da valutare", detail: "Trauma alla caviglia dopo essere stato travolto accidentalmente durante l’amichevole in famiglia", returnInfo: "condizioni non considerate preoccupanti; disponibilità da verificare" },
  { team: "Juventus", player: "Yildiz", status: "Infortunato", detail: "Frattura alla base del quinto metatarso del piede sinistro; operato il 31 agosto 2026", returnInfo: "stop di alcuni mesi; nessuna data ufficiale comunicata" },
  { team: "Parma", player: "Nicolussi Caviglia", status: "Infortunato", detail: "Operato il 28 agosto 2026 per risolvere una sindrome pubalgica", returnInfo: "iter riabilitativo iniziato; data non comunicata dal club" },
  { team: "Napoli", player: "Buongiorno", status: "Infortunato", detail: "Intervento alla radice del menisco mediale del ginocchio destro", returnInfo: "indicativamente dall’11ª giornata" },
  { team: "Napoli", player: "Marianucci", status: "Infortunato", detail: "Lesione di alto grado del legamento collaterale mediale del ginocchio sinistro", returnInfo: "indicativamente dalla 7ª giornata" },
  { team: "Como", player: "Addai", status: "Da valutare", detail: undisclosed, returnInfo: "data non comunicata" },
  { team: "Cagliari", player: "Idrissi", status: "Da valutare", detail: undisclosed, returnInfo: "data non comunicata" },
  { team: "Cagliari", player: "Trepy", status: "Indisponibile", detail: "In riabilitazione e in attesa degli accertamenti necessari per recuperare l’idoneità agonistica dopo l’incidente del 16 agosto", returnInfo: "nessuna data prevista; priorità al completo recupero" },
  { team: "Lazio", player: "Romagnoli", status: "Da valutare", detail: "Problemi tendinei; era tornato tra i convocati alla 1ª giornata", returnInfo: "indicativamente dalla 3ª giornata" },
  { team: "Lazio", player: "Cataldi", status: "Infortunato", detail: "Recupero dall’intervento estivo per risolvere problemi di pubalgia", returnInfo: "indicativamente dalla 3ª giornata" },
  { team: "Lazio", player: "Marusic", status: "Infortunato", detail: "Lesione muscolare riportata contro il Bologna", returnInfo: "stop stimato di 15-20 giorni dagli esami del 27 agosto" },
  { team: "Lazio", player: "Dele-Bashiru", status: "Infortunato", detail: "Lesione muscolare riportata contro il Bologna", returnInfo: "stop stimato di 15-20 giorni dagli esami del 27 agosto" },
  { team: "Genoa", player: "Traore", status: "Infortunato", detail: "In recupero da un problema al tendine del retto femorale", returnInfo: "rientro al lavoro con la squadra da verificare" },
  { team: "Genoa", player: "Venturino", status: "Da valutare", detail: undisclosed, returnInfo: "data non comunicata" },
  { team: "Genoa", player: "Meichtry", status: "Da valutare", detail: "Precedente distorsione al ginocchio recuperata; la nuova assenza non è stata chiarita dalle fonti consultate", returnInfo: "indicativamente dalla 3ª giornata" },
  { team: "Lecce", player: "Berisha", status: "Infortunato", detail: "Recupero dopo l’intervento al tendine riflesso del retto femorale destro; reinserimento graduale in gruppo", returnInfo: "convocato alla 2ª giornata, minutaggio ancora da gestire" },
  { team: "Roma", player: "Pellegrini", status: "Infortunato", detail: "Ricaduta del problema muscolare al retto femorale della coscia destra", returnInfo: "data non comunicata" },
  { team: "Roma", player: "Rensch", status: "Infortunato", detail: "Risentimento muscolare; non convocato per Lecce-Roma", returnInfo: "data non comunicata" },
  { team: "Roma", player: "Kone", remove: true },
  { team: "Roma", player: "Molina", remove: true },
  { team: "Atalanta", player: "Hien", status: "Infortunato", detail: "Lesione del tendine prossimale del muscolo semimembranoso della coscia sinistra; operato il 30 giugno", returnInfo: "data non comunicata" },
  { team: "Atalanta", player: "Sulemana", status: "Infortunato", detail: "Lesione di secondo grado del legamento collaterale mediale del ginocchio sinistro", returnInfo: "indicativamente dalla 5ª giornata" },
  { team: "Atalanta", player: "Ahanor", status: "Infortunato", detail: "Distrazione agli adduttori della coscia destra", returnInfo: "indicativamente dalla 3ª giornata" },
  { team: "Atalanta", player: "Kristensen", status: "Da valutare", detail: "Trauma distorsivo alla caviglia sinistra", returnInfo: "disponibilità da verificare con le prossime convocazioni" },
];

export function enrichVerifiedAvailability(teamName: string, entries: string[]) {
  return entries.flatMap((entry) => {
    const playerName = entry.split(" — ")[0]?.trim() ?? entry;
    const verified = verifiedAvailability.find(
      (item) => sameTeamName(item.team, teamName) && samePlayerName(item.player, playerName),
    );
    if (!verified) return [`${playerName} — Da valutare — ${undisclosed} — data non comunicata`];
    if (verified.remove) return [];
    return [[playerName, verified.status, verified.detail, verified.returnInfo].join(" — ")];
  });
}
