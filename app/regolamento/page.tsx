import { PublicPageHero } from "@/components/public-page-hero";
import { PriceNotice } from "@/components/price-notice";

const sections = [
  {
    title: "Requisiti di partecipazione",
    content: (
      <>
        <p>Possono partecipare al PUORCIPIAZZATI tutte le persone che:</p>
        <ul>
          <li>completano correttamente la registrazione sul sito ufficiale;</li>
          <li>effettuano il pagamento della quota di iscrizione;</li>
          <li>
            entrano nella lega entro i termini comunicati dall’organizzazione;
          </li>
          <li>accettano integralmente il presente regolamento.</li>
        </ul>
        <p>
          Ogni partecipante può iscrivere una o più squadre. Ogni squadra deve
          essere registrata separatamente ed è valida solo dopo il pagamento
          della relativa quota di iscrizione.
        </p>
        <p>
          L’organizzazione si riserva il diritto di annullare iscrizioni
          fraudolente, non pagate o non conformi al regolamento.
        </p>
      </>
    ),
  },
  {
    title: "Quota di iscrizione",
    content: (
      <>
        <p>La quota di iscrizione è:</p>
        <ul>
          <li>35 euro per le iscrizioni completate entro il 10 agosto 2026;</li>
          <li>40 euro per le iscrizioni completate dall’11 agosto 2026.</li>
        </ul>
        <p>
          L’iscrizione è considerata valida solo dopo la conferma del pagamento.
        </p>
      </>
    ),
  },
  {
    title: "Modalità di pagamento",
    content: (
      <>
        <p>La quota di iscrizione può essere versata tramite:</p>
        <ul>
          <li>PayPal;</li>
          <li>bonifico istantaneo;</li>
          <li>contanti, previo accordo con lo staff.</li>
        </ul>
        <p>
          L’accesso alla lega sarà consentito solo dopo la verifica del
          pagamento.
        </p>
      </>
    ),
  },
  {
    title: "Modalità della competizione",
    content: (
      <>
        <p>La competizione si svolgerà sulla piattaforma Leghe Fantacalcio.</p>
        <p>La lega utilizzerà:</p>
        <ul>
          <li>modalità Classic;</li>
          <li>competizione 1 contro Tutti;</li>
          <li>listone con disponibilità multipla dei calciatori.</li>
        </ul>
        <p>
          Ogni giornata i partecipanti dovranno schierare la propria formazione.
          La classifica generale sarà determinata dalla somma dei fantapunti
          ottenuti durante la stagione.
        </p>
      </>
    ),
  },
  {
    title: "Creazione della rosa e mercato",
    content: (
      <>
        <p>
          Ogni partecipante dovrà creare la propria rosa rispettando le
          impostazioni previste dalla lega.
        </p>
        <p>
          Le operazioni di mercato, le modifiche della rosa e l’inserimento
          delle formazioni saranno gestiti tramite Leghe Fantacalcio.
        </p>
        <p>
          Le impostazioni definitive saranno comunicate prima dell’inizio della
          competizione.
        </p>
      </>
    ),
  },
  {
    title: "Premi",
    content: (
      <>
        <p>
          I premi pubblicati sul sito rappresentano il montepremi previsto
          dall’organizzazione.
        </p>
        <p>
          I premi pubblicati sono garantiti al raggiungimento di almeno 100
          partecipanti. Qualora il numero degli iscritti fosse inferiore, il
          montepremi e i premi potranno essere rideterminati in modo
          proporzionale al numero effettivo dei partecipanti.
        </p>
        <p>
          In base al numero complessivo degli iscritti, i premi potranno
          aumentare, essere integrati con ulteriori premi oppure subire
          variazioni di modello o caratteristiche.
        </p>
        <p>
          Eventuali modifiche saranno comunicate attraverso il sito e i canali
          ufficiali di PUORCIPIAZZATI.
        </p>
      </>
    ),
  },
  {
    title: "Promozione “Porta 5 amici”",
    content: (
      <>
        <p>
          Dopo la conferma dell’iscrizione e del pagamento, ogni partecipante
          riceverà un codice personale.
        </p>
        <p>Un invito sarà considerato valido solo quando il nuovo partecipante:</p>
        <ul>
          <li>utilizza il codice personale ricevuto;</li>
          <li>completa correttamente l’iscrizione;</li>
          <li>paga la relativa quota di partecipazione.</li>
        </ul>
        <p>
          Al raggiungimento di 5 iscrizioni valide, il partecipante avrà diritto
          a una maglia da calcio gratuita.
        </p>
        <p>
          Iscrizioni annullate, duplicate, fraudolente o non pagate non saranno
          conteggiate.
        </p>
        <p>
          La consegna della maglia sarà effettuata dopo la verifica delle
          iscrizioni da parte dello staff.
        </p>
      </>
    ),
  },
  {
    title: "Contatti e assistenza",
    content: (
      <>
        <p>
          Per informazioni o assistenza è possibile contattare lo staff tramite
          WhatsApp:
        </p>
        <p>
          Francesco: 329 414 7232
          <br />
          Giuseppe: 389 004 8102
          <br />
          Giovanni: 389 893 3413
        </p>
        <p>
          È inoltre possibile contattare PUORCIPIAZZATI attraverso i canali social
          ufficiali.
        </p>
      </>
    ),
  },
  {
    title: "Decisioni dell’organizzazione",
    content: (
      <>
        <p>
          L’organizzazione si riserva la facoltà di adottare le decisioni
          necessarie per garantire il regolare svolgimento della competizione e
          per risolvere eventuali situazioni non espressamente previste dal
          presente regolamento.
        </p>
        <p>
          Le decisioni saranno comunicate ai partecipanti attraverso i canali
          ufficiali.
        </p>
      </>
    ),
  },
  {
    title: "Accettazione del regolamento",
    content: (
      <p>
        Con il completamento dell’iscrizione e il pagamento della quota, il
        partecipante dichiara di aver letto, compreso e accettato integralmente
        il presente regolamento.
      </p>
    ),
  },
];

export const metadata = {
  title: "Regolamento",
  description: "Il regolamento della stagione PUORCIPIAZZATI.",
  alternates: {
    canonical: "/regolamento",
  },
};

export const dynamic = "force-dynamic";

export default function RegolamentoPage() {
  return (
    <>
      <PublicPageHero
        description="Regole di partecipazione, competizione, pagamenti, premi e promozioni PUORCIPIAZZATI."
        eyebrow="Regole della competizione"
        number="02"
        title="REGOLAMENTO"
      />
      <section className="public-section">
        <div className="container">
          <PriceNotice />
        </div>
        <div className="container rules-list">
          {sections.map((section, index) => (
            <article className="rule-row" key={section.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.title}</h2>
                {section.content}
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
