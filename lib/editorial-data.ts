export const EDITORIAL_UPDATED_AT = "27 agosto 2026";

export const LEGA_SERIE_A_SCHEDULE_URL =
  "https://www.legaseriea.it/serie-a/news/date-orari-e-programmazione-tv-delle-prime-cinque-giornate";

export type UpcomingMatch = {
  awayTeam: string;
  dateLabel: string;
  homeTeam: string;
  slug: string;
  sourceLabel: string;
  sourceUrl: string;
  timeLabel: string;
};

export const upcomingMatches: UpcomingMatch[] = [
  match("Milan", "Venezia", "Venerdì 28 agosto", "20:45"),
  match("Fiorentina", "Frosinone", "Sabato 29 agosto", "18:30"),
  match("Monza", "Udinese", "Sabato 29 agosto", "18:30"),
  match("Sassuolo", "Torino", "Sabato 29 agosto", "18:30"),
  match("Juventus", "Parma", "Sabato 29 agosto", "20:45"),
  match("Napoli", "Como", "Domenica 30 agosto", "18:30"),
  match("Cagliari", "Inter", "Domenica 30 agosto", "20:45"),
  match("Lazio", "Genoa", "Domenica 30 agosto", "20:45"),
  match("Lecce", "Roma", "Lunedì 31 agosto", "18:30"),
  match("Atalanta", "Bologna", "Lunedì 31 agosto", "20:45"),
];

export type EditorialNews = {
  category: string;
  decisionSupport: {
    action: string;
    flipSignal: string;
    hiddenEdge: string;
    verdict: string;
  };
  fantasyTakeaway: string;
  publishedLabel: string;
  reliability: "Alta" | "Media" | "In evoluzione";
  sections: Array<{ body: string; heading: string }>;
  slug: string;
  sources: Array<{ label: string; url: string }>;
  summary: string;
  title: string;
  imageUrl?: string;
};

export const editorialNews: EditorialNews[] = [
  {
    category: "Infortuni · Fiorentina",
    slug: "parisi-crociato-recupero-fiorentina",
    publishedLabel: "Aggiornato il 31 agosto 2026",
    reliability: "Alta",
    title: "Parisi, recupero dal crociato: cosa sappiamo davvero",
    summary:
      "Il terzino della Fiorentina è stato operato il 18 maggio dopo la lesione del crociato anteriore del ginocchio destro. Il recupero procede, ma non esiste ancora una data ufficiale per il ritorno in partita.",
    fantasyTakeaway:
      "Non considerarlo disponibile nell’immediato. In leghe profonde può essere una scommessa da ultimo slot soltanto a prezzo minimo e con una copertura sicura: il rientro agonistico resta da verificare.",
    decisionSupport: {
      verdict: "Aspetta segnali sul rientro in gruppo prima di assegnargli un posto stabile nella rosa.",
      hiddenEdge: "Il ritorno alla corsa è un passaggio positivo, ma non equivale al recupero per una partita ufficiale dopo un intervento al crociato.",
      action: "Monitoralo senza spendere uno slot importante; rivalutalo quando inizierà il lavoro completo con la squadra.",
      flipSignal: "Convocazione e allenamenti completi in gruppo cambierebbero concretamente la valutazione.",
    },
    sections: [
      {
        heading: "Diagnosi e intervento",
        body: "La Fiorentina ha comunicato la lesione del legamento crociato anteriore del ginocchio destro. Parisi è stato sottoposto il 18 maggio all’intervento di ricostruzione, eseguito con esito positivo.",
      },
      {
        heading: "Tempi: cosa è verificato",
        body: "La stima iniziale riportata dopo l’operazione indicava cinque-sei mesi di recupero. Ad agosto il giocatore è tornato a correre sul campo, ma questo non permette di fissare con certezza la data del rientro agonistico.",
      },
      {
        heading: "Indicazione fantacalcio",
        body: "La scelta prudente è non pagarlo come un giocatore già prossimo al rientro. Il valore può cambiare quando arriveranno allenamenti completi con il gruppo e una convocazione ufficiale; fino ad allora resta una scommessa da coprire.",
      },
    ],
    sources: [
      {
        label: "ANSA — Lesione e intervento al crociato",
        url: "https://www.ansa.it/toscana/notizie/2026/05/18/fiorentina-parisi-operato-per-una-lesione-al-crociato_9cef5914-080a-41a1-b15c-0d24640a0b96.html",
      },
      {
        label: "Gazzetta — Condizioni e tempi di recupero",
        url: "https://www.gazzetta.it/calcio/fantanews/strumenti-fantacalcio/indisponibili/19-05-2026/parisi-infortunio-le-condizioni-e-i-tempi-di-recupero-del-difensore-della-fiorentina.shtml",
      },
      {
        label: "FiorentinaNews — Il ritorno alla corsa sul campo",
        url: "https://www.fiorentinanews.com/news/182397603334/parisi-vede-il-rientro-piu-vicino-l-esterno-viola-torna-a-correre-in-campo-foto",
      },
    ],
  },
  {
    category: "Asta · Attenzione",
    slug: "sebastiano-esposito-rigorista-rischio-cagliari",
    publishedLabel: "Aggiornato il 19 agosto 2026",
    reliability: "Media",
    title: "Esposito rigorista? Il dettaglio che può cambiare la tua asta",
    summary:
      "Le guide lo indicano ai vertici delle gerarchie dal dischetto, ma la situazione con il Cagliari suggerisce prudenza: il potenziale da bonus non basta senza garanzie sul suo impiego.",
    fantasyTakeaway:
      "Non pagare Esposito come un rigorista sicuro finché convocazione e centralità tecnica non saranno confermate. Può essere una scommessa ad alto potenziale, ma soltanto con titolari affidabili a coprirlo.",
    decisionSupport: {
      verdict: "Compralo soltanto da scommessa e non al prezzo di un titolare o di un rigorista garantito.",
      hiddenEdge: "Il mercato può prezzare i rigori, ma il rischio decisivo è il minutaggio: se il prezzo non sconta questa incertezza, il possibile bonus dal dischetto non compensa l'investimento.",
      action: "Fissa prima dell'asta un tetto da riserva, affiancalo a titolari affidabili e non rilanciare oltre quel limite.",
      flipSignal: "Alza la valutazione soltanto dopo una convocazione regolare e segnali concreti di centralità nelle prime partite.",
    },
    sections: [
      {
        heading: "Il dato che attira i fantallenatori",
        body: "Goal, TuttoFantacalcio e SOS Fanta collocano Sebastiano Esposito davanti o comunque molto in alto nelle gerarchie dei rigori del Cagliari. SOS Fanta riporta anche un bilancio personale di 22 realizzazioni su 23 tentativi, pur precisando che diversi rigori risalgono al settore giovanile. È un elemento che aumenta il suo potenziale da bonus, ma non garantisce da solo minutaggio e titolarità.",
      },
      {
        heading: "Il segnale che invita alla prudenza",
        body: "Il 28 luglio il direttore sportivo Pietro Accardi dichiarava a Sky Sport che il giocatore era concentrato sul Cagliari e che la società credeva in lui. Pochi giorni dopo, il Corriere ha riportato il comunicato con cui il club contestava l’allontanamento non autorizzato dal ritiro, insieme alla versione opposta dell’agente. Le informazioni raccontano quindi una situazione ancora in evoluzione, non una gerarchia tecnica definitivamente stabile.",
      },
      {
        heading: "Il vantaggio PUORCIPIAZZATI",
        body: "Il mercato può continuare a prezzarlo come un rigorista, mentre il rischio reale riguarda soprattutto presenza e continuità. Non eliminarlo dalla lista: abbassa però la cifra massima e trattalo come scommessa, non come certezza. Il momento decisivo sarà la convocazione per Parma-Cagliari e, subito dopo, il suo utilizzo nelle prime gare. Se torna stabilmente centrale, il ruolo sui piazzati può trasformarlo in un affare; se resta ai margini, averlo pagato da titolare diventa un problema.",
      },
    ],
    sources: [
      {
        label: "Sky Sport — Le parole del ds Accardi",
        url: "https://sport.sky.it/calciomercato/video/2026/07/28/cagliari-accardi-esposito-calciomercato-news-1114779",
      },
      {
        label: "Corriere della Sera — Il caso nel ritiro",
        url: "https://www.corriere.it/sport/calcio/26_agosto_01/cagliari-esposito-lascia-ritiro-agente-polemica-85fc5173-97cb-4e67-bf72-d090b6fcaxlk.shtml",
      },
      {
        label: "SOS Fanta — Gerarchie dei rigoristi",
        url: "https://www.sosfanta.com/asta-fantacalcio/fantacalcio-asta-tutti-rigoristi-seriea-venti-squadre-campionato/amp/",
      },
      {
        label: "Goal — Rigoristi Serie A 2026/27",
        url: "https://www.goal.com/it/liste/fantacalcio-rigoristi-serie-a-2026-2027-tiratori-e-gerarchie-dal-dischetto-delle-20-squadre-del-campionato/bltdebca56c3bd91419",
      },
    ],
  },
  {
    category: "Probabili formazioni",
    slug: "inter-monza-centrocampo-senza-mkhitaryan",
    publishedLabel: "Aggiornato il 18 agosto 2026",
    reliability: "Media",
    title: "Inter-Monza: come cambia il centrocampo senza Mkhitaryan",
    summary:
      "L’assenza per squalifica di Mkhitaryan apre spazio a centrocampo. Le prime proiezioni indicano più soluzioni, ma il titolare aggiuntivo non è ancora certo.",
    fantasyTakeaway:
      "Mkhitaryan è da escludere. Barella e Calhanoglu restano i nomi più solidi nelle prime proiezioni; per Sucic, Diouf e Zielinski conviene attendere aggiornamenti più vicini alla gara.",
    decisionSupport: {
      verdict: "Barella e Calhanoglu sono le scelte più solide; usa gli altri centrocampisti soltanto con una riserva titolare.",
      hiddenEdge: "Un posto liberato non rende automaticamente il sostituto una buona scelta fantasy: minuti, posizione e compiti offensivi possono distribuirsi tra più giocatori.",
      action: "Schiera uno dei nomi in ballottaggio solo se la tua panchina può coprire un mancato ingresso o un minutaggio ridotto.",
      flipSignal: "Una proiezione concorde tra più fonti nelle ore precedenti alla partita può trasformare il ballottaggio in una scelta accettabile.",
    },
    sections: [
      {
        heading: "Il punto verificato",
        body: "Mkhitaryan deve scontare una giornata di squalifica e non sarà disponibile contro il Monza. Su questo dato il comunicato della Lega e le fonti fantacalcistiche consultate sono concordi.",
      },
      {
        heading: "Cosa mostrano le prime proiezioni",
        body: "Fantapazz e PianetaFanta collocano Barella e Calhanoglu tra i riferimenti del centrocampo nerazzurro. Le due proiezioni non descrivono però nello stesso modo tutti gli altri posti: Sucic, Diouf e Zielinski rientrano nelle soluzioni considerate, segnale che le gerarchie devono ancora essere consolidate.",
      },
      {
        heading: "Il consiglio PUORCIPIAZZATI",
        body: "Barella e Calhanoglu possono essere trattati come opzioni più affidabili. Sugli altri centrocampisti è meglio evitare certezze premature: schierali soltanto con una copertura sicura e ricontrolla le indicazioni nell’ultima giornata prima del match.",
      },
    ],
    sources: [
      {
        label: "Lega Serie A — Comunicato del Giudice Sportivo",
        url: "https://images.legaseriea.it/image/private/fl_attachment/prd/adxsfqrj7ymznkdnnjtg.pdf",
      },
      {
        label: "Fantapazz — Probabili formazioni",
        url: "https://www.fantapazz.com/calcio/fantacalcio/serie-a/probabili-formazioni",
      },
      {
        label: "PianetaFanta — Probabili formazioni",
        url: "https://www.pianetafanta.it/probabili-formazioni-complete-serie-a-live.asp",
      },
    ],
  },
  {
    category: "Indisponibili",
    slug: "udinese-como-kabasele-squalificato",
    publishedLabel: "Aggiornato il 18 agosto 2026",
    reliability: "Alta",
    title: "Udinese-Como: Kabasele è fuori, difesa da monitorare",
    summary:
      "Il difensore dell’Udinese non sarà disponibile per la prima giornata. Prima di scegliere il suo sostituto conviene aspettare le indicazioni definitive.",
    fantasyTakeaway:
      "Kabasele non va schierato. Non promuovere automaticamente un altro difensore dell’Udinese: aspetta una proiezione aggiornata dell’undici titolare.",
    decisionSupport: {
      verdict: "Sostituisci Kabasele con un difensore dalla titolarità già verificata, senza inseguire automaticamente il suo possibile rimpiazzo.",
      hiddenEdge: "L'assenza apre un posto nella linea difensiva ma non garantisce novanta minuti a un singolo sostituto, perché può cambiare anche il modulo.",
      action: "Preferisci oggi una copertura sicura; valuta un altro bianconero solo dopo indicazioni concordi su modulo e undici iniziale.",
      flipSignal: "Una formazione aggiornata e confermata da più fonti può rendere utilizzabile il sostituto individuato dall'allenatore.",
    },
    sections: [
      {
        heading: "L’assenza confermata",
        body: "Il comunicato del Giudice Sportivo riporta la squalifica di Christian Kabasele. L’Udinese giocherà contro il Como sabato 22 agosto alle 18:30 e dovrà quindi modificare almeno un elemento del reparto difensivo.",
      },
      {
        heading: "Impatto al fantacalcio",
        body: "L’assenza rende inutilizzabile Kabasele per il primo turno, ma non basta per individuare con certezza il sostituto. Modulo, condizione fisica e ultime sedute possono cambiare la scelta dell’allenatore.",
      },
      {
        heading: "Il consiglio PUORCIPIAZZATI",
        body: "Se possiedi Kabasele, prepara un’alternativa con titolarità più sicura. Se stai valutando un altro difensore bianconero, attendi le formazioni aggiornate: una singola assenza non garantisce automaticamente novanta minuti a un sostituto specifico.",
      },
    ],
    sources: [
      {
        label: "Lega Serie A — Comunicato del Giudice Sportivo",
        url: "https://images.legaseriea.it/image/private/fl_attachment/prd/adxsfqrj7ymznkdnnjtg.pdf",
      },
      {
        label: "Fantacalcio.it — Squalificati della prima giornata",
        url: "https://www.fantacalcio.it/news/calcio-italia/25_05_2026/serie-a-2026-2027-gli-squalificati-per-la-1-giornata-493440",
      },
      {
        label: "Udinese — Programma delle gare di agosto",
        url: "https://www.udinese.it/news/squad/our-august-fixtures",
      },
    ],
  },
  {
    category: "Gestione formazione",
    slug: "prima-giornata-scadenza-formazione-22-agosto",
    publishedLabel: "Aggiornato il 18 agosto 2026",
    reliability: "Alta",
    title: "Prima giornata: attenzione alla scadenza della formazione",
    summary:
      "Inter-Monza e Udinese-Como aprono il turno sabato alle 18:30. Chi gioca al fantacalcio deve controllare in anticipo l’orario limite della propria lega.",
    fantasyTakeaway:
      "Non aspettare le gare serali: verifica il regolamento della tua piattaforma e prepara formazione e panchina prima delle 18:30 di sabato 22 agosto.",
    decisionSupport: {
      verdict: "Prepara la formazione entro venerdì e trattala come definitiva prima delle gare delle 18:30, salvo aggiornamenti verificati.",
      hiddenEdge: "Il vero rischio non è soltanto dimenticare un titolare: una panchina ordinata male può annullare il vantaggio delle ultime notizie.",
      action: "Controlla prima il blocco della tua lega, poi ordina ogni riserva per probabilità di voto e non solo per potenziale bonus.",
      flipSignal: "Modifica all'ultimo soltanto davanti a una notizia ufficiale o a più fonti concordi, non per una singola indiscrezione.",
    },
    sections: [
      {
        heading: "Quando comincia la giornata",
        body: "Il calendario ufficiale colloca Inter-Monza e Udinese-Como sabato 22 agosto alle 18:30. Sono le prime due partite del nuovo campionato e determinano il momento da tenere sotto controllo per l’inserimento della formazione.",
      },
      {
        heading: "Perché conta al fantacalcio",
        body: "Ogni lega può applicare una regola diversa: alcune bloccano l’intera formazione prima della prima gara, altre permettono una gestione differente. Il calendario della Serie A non sostituisce quindi il regolamento della propria lega.",
      },
      {
        heading: "Il consiglio PUORCIPIAZZATI",
        body: "Prepara una prima versione della formazione entro venerdì e aggiornala sabato dopo le ultime notizie. Controlla soprattutto squalificati, indisponibili e ballottaggi, poi assicurati che ogni titolare abbia una riserva coerente con il ruolo.",
      },
    ],
    sources: [
      {
        label: "Lega Serie A — Date e orari",
        url: LEGA_SERIE_A_SCHEDULE_URL,
      },
      {
        label: "Inter — Match center Inter-Monza",
        url: "https://www.inter.it/it/match_center/5369",
      },
      {
        label: "Udinese — Programma delle gare di agosto",
        url: "https://www.udinese.it/news/squad/our-august-fixtures",
      },
    ],
  },
];

export function getEditorialNews(slug: string) {
  return editorialNews.find((item) => item.slug === slug);
}

export const sourceComparison = {
  question: "Inter-Monza sarà la gara d’esordio dell’Inter?",
  result: "2 fonti ufficiali su 2 confermano l’incontro",
  note: "Le formazioni saranno aggiunte soltanto quando disponibili da fonti attendibili.",
  sources: [
    {
      label: "Lega Serie A",
      state: "Confermato",
      url: LEGA_SERIE_A_SCHEDULE_URL,
    },
    {
      label: "Inter",
      state: "Confermato",
      url: "https://www.inter.it/it/match_center/5369",
    },
  ],
};

function match(
  homeTeam: string,
  awayTeam: string,
  dateLabel: string,
  timeLabel: string,
): UpcomingMatch {
  return {
    awayTeam,
    dateLabel,
    homeTeam,
    slug: `${slugify(homeTeam)}-${slugify(awayTeam)}`,
    sourceLabel: "Lega Serie A",
    sourceUrl: LEGA_SERIE_A_SCHEDULE_URL,
    timeLabel,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
