import { formatPrice, getRegistrationPrice } from "@/lib/pricing";
import { getPublicSiteUrl } from "@/lib/server-site-url";

type ConfirmationEmail = {
  email: string;
  firstName: string;
  paymentMethod: string;
  referralCode: string;
  amountPaidCents: number;
};

type EditionCancellationEmail = {
  email: string;
  firstName: string;
  paymentMethod: "paypal" | "instant_bank_transfer" | "cash";
  paymentStatus: "paid" | "pending";
  isTest?: boolean;
};

type EmailLayout = {
  preheader: string;
  eyebrow: string;
  title: string;
  content: string;
  cta?: { label: string; url: string };
};

function methodLabel(method: string) {
  return (
    {
      paypal: "PayPal",
      instant_bank_transfer: "Bonifico istantaneo",
      cash: "Pagamento in contanti",
    }[method] ?? method
  );
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  options: { urgent?: boolean } = {},
) {
  const from = process.env.EMAIL_FROM;
  const brevoApiKey = process.env.BREVO_API_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!from || (!brevoApiKey && !resendApiKey)) {
    return false;
  }

  const response = brevoApiKey
    ? await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": brevoApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: parseSender(from),
          to: [{ email: to }],
          subject,
          htmlContent: html,
          ...(options.urgent
            ? { headers: { "X-Priority": "1", Importance: "high" } }
            : {}),
        }),
      })
    : await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject,
          html,
          ...(options.urgent
            ? { headers: { "X-Priority": "1", Importance: "high" } }
            : {}),
        }),
      });

  if (!response.ok) {
    throw new Error("Invio email non riuscito.");
  }

  return true;
}

function parseSender(value: string) {
  const match = value.match(/^\s*(.*?)\s*<([^<>]+)>\s*$/);
  if (!match) return { email: value.trim(), name: "PUORCIPIAZZATI" };
  return { name: match[1].trim() || "PUORCIPIAZZATI", email: match[2].trim() };
}

function emailLayout({ preheader, eyebrow, title, content, cta }: EmailLayout) {
  const appUrl = getPublicSiteUrl();
  const logo = appUrl ? `${appUrl}/puorcipiazzati-icon.png` : "";
  const safeCtaUrl = cta?.url ? escapeHtml(cta.url) : "";

  return `<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>${escapeHtml(title)}</title>
    <style>
      @media only screen and (max-width: 620px) {
        .email-shell { padding: 18px 10px !important; }
        .email-card { width: 100% !important; }
        .email-header, .email-content, .email-footer { padding-left: 22px !important; padding-right: 22px !important; }
        .email-title { font-size: 30px !important; line-height: 34px !important; }
        .summary-cell { display: block !important; width: 100% !important; box-sizing: border-box !important; }
        .summary-gap { height: 8px !important; }
        .email-cta { display: block !important; text-align: center !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:#050505;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#050505;">
      <tr>
        <td class="email-shell" align="center" style="padding:34px 14px;">
          <table class="email-card" role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:600px;max-width:600px;background:#111111;border:1px solid #2b2b2b;border-collapse:separate;">
            <tr><td style="height:7px;background:#e00019;font-size:0;line-height:0;">&nbsp;</td></tr>
            <tr>
              <td class="email-header" style="padding:28px 38px 24px;border-bottom:1px solid #292929;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="58" valign="middle">
                      ${logo ? `<img src="${escapeHtml(logo)}" width="48" height="48" alt="PUORCIPIAZZATI" style="display:block;width:48px;height:48px;border:0;border-radius:10px;">` : `<div style="width:48px;height:48px;border-radius:10px;background:#e00019;color:#fff;font-size:18px;font-weight:900;line-height:48px;text-align:center;">PP</div>`}
                    </td>
                    <td valign="middle" style="font-size:22px;font-weight:900;letter-spacing:-0.5px;color:#ffffff;">FANTA<span style="color:#e00019;">PUORCI</span></td>
                    <td align="right" valign="middle" style="font-size:10px;font-weight:800;letter-spacing:1.5px;color:#9a9a9a;text-transform:uppercase;">STAGIONE 2026/2027</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="email-content" style="padding:38px;">
                <p style="margin:0 0 12px;color:#e00019;font-size:11px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
                <h1 class="email-title" style="margin:0 0 24px;color:#ffffff;font-size:38px;line-height:42px;letter-spacing:-1.3px;text-transform:uppercase;">${escapeHtml(title)}</h1>
                ${content}
                ${cta ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px;"><tr><td style="background:#e00019;"><a class="email-cta" href="${safeCtaUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:15px 24px;color:#ffffff;font-size:12px;font-weight:900;letter-spacing:0.8px;text-decoration:none;text-transform:uppercase;">${escapeHtml(cta.label)} &rarr;</a></td></tr></table>` : ""}
              </td>
            </tr>
            <tr>
              <td class="email-footer" style="padding:22px 38px;border-top:1px solid #292929;color:#797979;font-size:11px;line-height:18px;">
                Messaggio automatico di PUORCIPIAZZATI. Per la tua sicurezza, lo staff non ti chiederà mai password o codici di accesso via email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function paragraph(content: string) {
  return `<p style="margin:0 0 18px;color:#d6d6d6;font-size:16px;line-height:25px;">${content}</p>`;
}

function statusBox(content: string, tone: "success" | "warning" = "success") {
  const border = tone === "success" ? "#e00019" : "#ffffff";
  return `<div style="margin:22px 0;padding:17px 18px;border-left:5px solid ${border};background:#1b1b1b;color:#ffffff;font-size:14px;font-weight:800;line-height:22px;">${content}</div>`;
}

function paymentSummary(amountCents: number, paymentMethod: string) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
    <tr>
      <td class="summary-cell" width="49%" style="padding:17px;background:#080808;border:1px solid #303030;">
        <span style="display:block;margin-bottom:7px;color:#8d8d8d;font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;">Importo</span>
        <strong style="color:#ffffff;font-size:24px;">${formatPrice(amountCents)}</strong>
      </td>
      <td class="summary-gap" width="2%" style="font-size:0;">&nbsp;</td>
      <td class="summary-cell" width="49%" style="padding:17px;background:#080808;border:1px solid #303030;">
        <span style="display:block;margin-bottom:7px;color:#8d8d8d;font-size:10px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;">Metodo</span>
        <strong style="color:#ffffff;font-size:15px;">${escapeHtml(methodLabel(paymentMethod))}</strong>
      </td>
    </tr>
  </table>`;
}

function codeBox(label: string, code: string) {
  return `<div style="margin:26px 0;padding:24px 18px;background:#e00019;text-align:center;">
    <span style="display:block;margin-bottom:9px;color:#ffffff;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">${escapeHtml(label)}</span>
    <strong style="display:block;color:#ffffff;font-size:30px;line-height:34px;letter-spacing:3px;">${escapeHtml(code)}</strong>
  </div>`;
}

function registrationPriceMessage() {
  const price = getRegistrationPrice();

  return price.tier === "early_bird"
    ? "🔥 Fino al 10 agosto la quota è di <strong style=\"color:#ffffff;\">35 €</strong>.<br>Dall’11 agosto la quota sarà di <strong style=\"color:#ffffff;\">40 €</strong>."
    : "La quota di iscrizione è di <strong style=\"color:#ffffff;\">40 €</strong>.";
}

function numberedSteps(steps: string[]) {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:22px 0;">${steps
    .map(
      (step, index) =>
        `<tr><td width="36" valign="top" style="padding:7px 0;color:#e00019;font-size:18px;font-weight:900;">${index + 1}.</td><td style="padding:7px 0;color:#ffffff;font-size:15px;line-height:22px;">${escapeHtml(step)}</td></tr>`,
    )
    .join("")}</table>`;
}

export async function sendWelcomeRegistrationEmail(
  email: string,
  firstName: string,
) {
  const appUrl = getPublicSiteUrl();
  const registrationUrl = appUrl ? `${appUrl}/iscrizione` : "";
  const greeting = firstName
    ? `Ciao <strong style="color:#ffffff;">${escapeHtml(firstName)}</strong>!`
    : "Ciao!";

  return sendEmail(
    email,
    "🐷 Benvenuto su PUORCIPIAZZATI — completa ora la tua iscrizione",
    emailLayout({
      preheader: "Il tuo account è attivo: completa ora l’iscrizione al fantacalcio.",
      eyebrow: "Account verificato",
      title: "Benvenuto su PUORCIPIAZZATI",
      content:
        paragraph(greeting) +
        paragraph("La registrazione del tuo account PUORCIPIAZZATI è stata completata correttamente.") +
        statusBox("⚠️ ATTENZIONE: la registrazione al sito non equivale ancora all’iscrizione al fantacalcio.", "warning") +
        paragraph("Per partecipare devi:") +
        numberedSteps([
          "Accedere al tuo account",
          "Cliccare su “Iscriviti”",
          "Compilare il modulo",
          "Scegliere il metodo di pagamento",
          "Completare il pagamento",
        ]) +
        statusBox(registrationPriceMessage()) +
        paragraph("Prima di procedere, consulta il regolamento completo disponibile sul sito.") +
        paragraph("PUORCIPIAZZATI"),
      cta: registrationUrl
        ? { label: "COMPLETA L’ISCRIZIONE", url: registrationUrl }
        : undefined,
    }),
  );
}

export async function sendRegistrationReminderEmail(
  email: string,
  firstName: string,
) {
  const appUrl = getPublicSiteUrl();
  const registrationUrl = appUrl ? `${appUrl}/iscrizione` : "";
  const greeting = firstName
    ? `Ciao <strong style="color:#ffffff;">${escapeHtml(firstName)}</strong>!`
    : "Ciao!";

  return sendEmail(
    email,
    "⚠️ Non sei ancora iscritto a PUORCIPIAZZATI",
    emailLayout({
      preheader: "Il tuo account esiste, ma l’iscrizione alla competizione non è ancora completa.",
      eyebrow: "Iscrizione incompleta",
      title: "Non sei ancora iscritto",
      content:
        paragraph(greeting) +
        paragraph("Sono passate alcune ore dalla tua registrazione su PUORCIPIAZZATI, ma la tua iscrizione al fantacalcio non risulta ancora completata.") +
        statusBox("⚠️ Il tuo account è stato creato, ma questo NON significa che sei già iscritto alla competizione.", "warning") +
        paragraph("Per partecipare devi ancora accedere, premere “Iscriviti” e completare la procedura di pagamento.") +
        statusBox(registrationPriceMessage()) +
        paragraph("Se vuoi partecipare, ti consigliamo di completare l’iscrizione ora.") +
        paragraph("Se hai avuto problemi durante la procedura, rispondi direttamente a questa email e ti aiuteremo.") +
        paragraph("PUORCIPIAZZATI"),
      cta: registrationUrl
        ? { label: "ISCRIVITI ORA", url: registrationUrl }
        : undefined,
    }),
  );
}

export async function sendUrgentDeadlineEmail(
  email: string,
  firstName: string,
) {
  const appUrl = getPublicSiteUrl();
  const registrationUrl = appUrl ? `${appUrl}/iscrizione` : "";
  const greeting = firstName
    ? `Ciao <strong style="color:#ffffff;">${escapeHtml(firstName)}</strong>!`
    : "Ciao!";

  return sendEmail(
    email,
    "🚨 URGENTE: mancano solo 2 giorni per iscriverti a 35 €",
    emailLayout({
      preheader: "Avviso urgente: dal giorno 11 agosto la quota aumenterà a 40 €.",
      eyebrow: "Comunicazione urgente",
      title: "Ultime 48 ore",
      content:
        paragraph(greeting) +
        statusBox("🚨 <strong>URGENTE:</strong> la tua iscrizione a PUORCIPIAZZATI non risulta ancora completata.", "warning") +
        paragraph("Mancano soltanto due giorni per completare l’iscrizione alla quota di 35 €.") +
        `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:26px 0;border:1px solid #3a3a3a;background:#080808;">
          <tr>
            <td align="center" style="padding:12px;background:#e00019;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">🚨 Scadenza imminente</td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 18px 12px;color:#ffffff;">
              <span style="display:block;margin-bottom:6px;color:#a5a5a5;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;">Quota fino al 10 agosto</span>
              <strong style="display:block;color:#ffffff;font-family:Arial Black,Arial,Helvetica,sans-serif;font-size:64px;line-height:68px;letter-spacing:-3px;">35 €</strong>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:0 18px 26px;color:#b9b9b9;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;">
              Iscriviti entro il <strong style="color:#ffffff;">10 agosto</strong><br>
              Dall’11 agosto la quota sarà di <strong style="color:#ffffff;font-size:18px;">40 €</strong>
            </td>
          </tr>
        </table>` +
        statusBox("⚡ Non aspettare: completare l’iscrizione richiede soltanto <strong>due minuti</strong>.") +
        paragraph("Accedi al sito, premi “Iscriviti”, compila il modulo e completa il pagamento per confermare la tua partecipazione.") +
        paragraph("PUORCIPIAZZATI"),
      cta: registrationUrl
        ? { label: "COMPLETA SUBITO L’ISCRIZIONE", url: registrationUrl }
        : undefined,
    }),
  );
}

export async function sendRegistrationConfirmationEmail({
  email,
  firstName,
  paymentMethod,
  referralCode,
  amountPaidCents,
}: ConfirmationEmail) {
  const appUrl = getPublicSiteUrl();
  const referralLink = appUrl
    ? `${appUrl}/registrati?ref=${encodeURIComponent(referralCode)}`
    : "";

  return sendEmail(
    email,
    "🚨 URGENTE — conserva il tuo codice amico PUORCIPIAZZATI",
    emailLayout({
      preheader: `Pagamento confermato. Conserva e condividi il codice ${referralCode}.`,
      eyebrow: "Comunicazione urgente",
      title: "Il tuo codice amico è pronto",
      content:
        paragraph(`Ciao <strong style="color:#ffffff;">${escapeHtml(firstName)}</strong>, abbiamo verificato il tuo pagamento. Ora sei ufficialmente iscritto a PUORCIPIAZZATI.`) +
        paymentSummary(amountPaidCents, paymentMethod) +
        codeBox("Il tuo codice amico", referralCode) +
        paragraph("📋 Per copiarlo dal telefono, tieni premuto sul codice e seleziona “Copia”. Condividilo insieme al tuo link personale.") +
        statusBox("🚨 <strong>INVITA 5 AMICI:</strong> quando cinque amici useranno il tuo codice e completeranno iscrizione e pagamento, riceverai gratuitamente una maglia da calcio a tua scelta tra quelle disponibili.") +
        paragraph("Come funziona:") +
        numberedSteps([
          "Copia e condividi il tuo codice amico",
          "Il tuo amico inserisce il codice durante l’iscrizione",
          "L’amico completa il pagamento",
          "Dopo 5 amici pagati e confermati sblocchi la maglia",
        ]) +
        statusBox(registrationPriceMessage(), "warning") +
        paragraph("Gli account creati ma non pagati non vengono conteggiati. Il premio si sblocca una sola volta al raggiungimento di cinque inviti validi.") +
        (referralLink
          ? `<p style="margin:18px 0 0;color:#8f8f8f;font-size:12px;line-height:19px;word-break:break-all;">Il tuo link personale da condividere:<br><a href="${escapeHtml(referralLink)}" style="color:#ffffff;font-weight:700;">${escapeHtml(referralLink)}</a></p>`
          : ""),
      cta: referralLink
        ? { label: "APRI IL TUO LINK PERSONALE", url: referralLink }
        : appUrl
          ? { label: "Apri la dashboard", url: `${appUrl}/dashboard` }
          : undefined,
    }),
  );
}

export async function sendRewardEmail(
  email: string,
  firstName: string,
  rewardCode: string,
) {
  const whatsapp = process.env.ORGANIZER_WHATSAPP_URL;
  const appUrl = getPublicSiteUrl();
  return sendEmail(
    email,
    "Hai vinto una maglia da calcio",
    emailLayout({
      preheader: `Hai vinto una maglia da calcio. Codice premio ${rewardCode}.`,
      eyebrow: "Premio sbloccato",
      title: `Complimenti, ${firstName}!`,
      content:
        paragraph("Hai raggiunto 5 amici pagati e confermati: hai vinto una maglia da calcio.") +
        codeBox("Codice premio", rewardCode) +
        statusBox("Conserva questo codice e comunicalo agli organizzatori. Il premio può essere ritirato una sola volta."),
      cta: whatsapp
        ? { label: "Contatta gli organizzatori", url: whatsapp }
        : appUrl
          ? { label: "Apri la dashboard", url: `${appUrl}/dashboard` }
          : undefined,
    }),
  );
}

export async function sendCashStatusEmail(
  email: string,
  firstName: string,
  status: "approved" | "rejected",
  amountDueCents: number,
) {
  const body =
    status === "approved"
      ? `La tua zona è raggiungibile. Sarai contattato per concordare il ritiro. Quota attualmente dovuta: ${formatPrice(amountDueCents)}. Se l’incasso avviene dopo la scadenza promozionale, la quota verrà ricalcolata dal server.`
      : "La tua zona non è raggiungibile. Puoi scegliere PayPal o bonifico istantaneo dalla tua area personale.";
  const appUrl = getPublicSiteUrl();

  return sendEmail(
    email,
    "Aggiornamento pagamento in contanti",
    emailLayout({
      preheader: "Aggiornamento sulla richiesta di pagamento in contanti.",
      eyebrow: status === "approved" ? "Zona raggiungibile" : "Aggiornamento richiesta",
      title: status === "approved" ? "Possiamo organizzare il ritiro" : "Zona non raggiungibile",
      content:
        paragraph(`Ciao <strong style="color:#ffffff;">${escapeHtml(firstName)}</strong>,`) +
        statusBox(escapeHtml(body), status === "approved" ? "success" : "warning") +
        paragraph("L’iscrizione sarà confermata esclusivamente dopo la ricezione effettiva del pagamento."),
      cta: appUrl
        ? { label: "Apri la tua area personale", url: `${appUrl}/dashboard` }
        : undefined,
    }),
  );
}

export async function sendPaymentRequestEmail({
  email,
  firstName,
  paymentMethod,
  amountDueCents,
}: {
  email: string;
  firstName: string;
  paymentMethod: string;
  amountDueCents: number;
}) {
  const appUrl = getPublicSiteUrl();
  return sendEmail(
    email,
    "Richiesta di iscrizione PUORCIPIAZZATI ricevuta",
    emailLayout({
      preheader: `Richiesta ricevuta. Quota da versare: ${formatPrice(amountDueCents)}.`,
      eyebrow: "Richiesta ricevuta",
      title: "Ci siamo quasi",
      content:
        paragraph(`Ciao <strong style="color:#ffffff;">${escapeHtml(firstName)}</strong>, la tua richiesta di iscrizione è stata salvata correttamente.`) +
        paymentSummary(amountDueCents, paymentMethod) +
        statusBox("La richiesta non è ancora un’iscrizione valida. La confermeremo soltanto dopo aver ricevuto e verificato il pagamento.", "warning") +
        paragraph("Riceverai una nuova email con il tuo codice amico quando il pagamento sarà confermato."),
      cta: appUrl
        ? { label: "Controlla lo stato", url: `${appUrl}/dashboard` }
        : undefined,
    }),
  );
}

export async function sendEditionCancellationEmail({
  email,
  firstName,
  paymentMethod,
  paymentStatus,
  isTest = false,
}: EditionCancellationEmail) {
  const greeting = firstName
    ? `Buongiorno <strong style="color:#ffffff;">${escapeHtml(firstName)}</strong>,`
    : "Buongiorno,";
  const isBankTransfer = paymentMethod === "instant_bank_transfer";
  const isUnpaidCash = paymentMethod === "cash" && paymentStatus === "pending";
  const cancellationDecision = isUnpaidCash
    ? statusBox(
        "<strong>RICHIESTA IN CONTANTI ANNULLATA</strong><br>Per questo motivo abbiamo deciso di non dare il via all’edizione attuale. Il pagamento in contanti non risulta incassato: non devi versare alcuna quota e non è necessario richiedere un rimborso.",
        "warning",
      )
    : statusBox(
        "<strong>RIMBORSO INTEGRALE</strong><br>Per questo motivo abbiamo deciso di non dare il via all’edizione attuale e la quota di iscrizione versata verrà rimborsata integralmente.",
        "warning",
      );
  const refundInstructions = isBankTransfer
    ? statusBox(
        `<strong>RIMBORSO TRAMITE BONIFICO</strong><br><br>Per permetterci di restituirti integralmente la quota versata, inviaci tramite WhatsApp l’IBAN sul quale desideri ricevere il rimborso al numero:<br><br><strong style="font-size:22px;">329 414 7232</strong><br><br>Nel messaggio indica anche <strong>NOME E COGNOME</strong> utilizzati durante l’iscrizione, in modo da permetterci di identificare correttamente il pagamento.<br><br><span style="font-weight:400;">Per la tua sicurezza non inviare password, PIN, codici OTP, credenziali bancarie o altri codici di sicurezza. Per procedere con il rimborso abbiamo bisogno esclusivamente dell’IBAN e dei dati necessari a identificare l’iscrizione.</span>`,
        "warning",
      )
    : isUnpaidCash
      ? statusBox(
          "<strong>NON DEVI EFFETTUARE ALCUNA OPERAZIONE</strong><br><br>La richiesta di pagamento in contanti non risulta incassata. Non devi pagare nulla e non è dovuto alcun rimborso.",
        )
      : paymentMethod === "cash"
        ? statusBox(
            "<strong>RIMBORSO DEL PAGAMENTO IN CONTANTI</strong><br><br>Lo staff ti contatterà per concordare la restituzione integrale della quota versata. Non inviare password, PIN, codici OTP o credenziali bancarie.",
            "warning",
          )
        : statusBox(
        "<strong>RIMBORSO INTEGRALE</strong><br><br>Non devi effettuare alcuna operazione. Provvederemo al rimborso integrale della quota attraverso il metodo di pagamento utilizzato per l’iscrizione.",
      );

  return sendEmail(
    email,
    `${isTest ? "[TEST] " : ""}🚨 URGENTE – Comunicazione importante – PUORCIPIAZZATI`,
    emailLayout({
      preheader:
        isUnpaidCash
          ? "L’edizione attuale non partirà e la richiesta di pagamento in contanti viene annullata."
          : "L’edizione attuale non partirà e la quota versata verrà rimborsata integralmente.",
      eyebrow: isTest ? "Anteprima amministratore" : "Comunicazione importante",
      title: "Edizione attuale non avviata",
      content:
        (isTest
          ? statusBox(
              "Questa è l’unica email di prova. Nessun partecipante ha ricevuto questa comunicazione.",
              "warning",
            )
          : "") +
        paragraph(greeting) +
        paragraph(
          "Prima di tutto vogliamo ringraziarti per aver creduto in PUORCIPIAZZATI e per aver scelto di partecipare alla nostra prima edizione.",
        ) +
        paragraph(
          "Purtroppo, nonostante l’impegno e l’entusiasmo con cui abbiamo portato avanti il progetto, non abbiamo raggiunto il numero di partecipanti che ci eravamo prefissati.",
        ) +
        paragraph(
          "PUORCIPIAZZATI è nato con l’obiettivo di creare una competizione importante, con premi all’altezza del progetto che avevamo immaginato. Non avendo raggiunto il numero necessario di iscritti, abbiamo deciso di non ridimensionare la competizione e, soprattutto, di non proporre ai partecipanti qualcosa di diverso rispetto a ciò per cui avevano scelto di iscriversi.",
        ) +
        cancellationDecision +
        paragraph(
          "Tutto lo staff di PUORCIPIAZZATI si scusa sinceramente per il disagio e per il tempo che ci avete dedicato. Vogliamo però ringraziarvi soprattutto per la fiducia che avete riposto in un progetto appena nato.",
        ) +
        `<h2 style="margin:30px 0 14px;color:#ffffff;font-family:Arial Black,Arial,Helvetica,sans-serif;font-size:25px;line-height:30px;text-transform:uppercase;">Questo non è un addio.</h2>` +
        paragraph(
          "Stiamo valutando di riproporre PUORCIPIAZZATI in occasione del girone di ritorno oppure direttamente nella prossima stagione, dandoci più tempo per costruire una community più grande e realizzare la competizione esattamente come l’avevamo immaginata.",
        ) +
        paragraph(
          "Nel frattempo continueremo a lavorare sul progetto e sui nostri canali.",
        ) +
        refundInstructions +
        paragraph(
          "Grazie ancora per aver creduto in noi fin dalla prima edizione.",
        ) +
        paragraph(
          "Ci auguriamo di ritrovarti quando PUORCIPIAZZATI tornerà, ancora più grande e organizzato.",
        ) +
        paragraph("Lo staff di PUORCIPIAZZATI 🐷⚽"),
      cta: isBankTransfer
        ? {
            label: "INVIA L’IBAN SU WHATSAPP",
            url: "https://api.whatsapp.com/send/?phone=393294147232&text=Ciao%20PUORCIPIAZZATI%2C%20devo%20comunicare%20l%27IBAN%20per%20il%20rimborso%20della%20mia%20iscrizione.&type=phone_number&app_absent=0",
          }
        : undefined,
    }),
    { urgent: true },
  );
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      (
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        } as Record<string, string>
      )[character],
  );
}
