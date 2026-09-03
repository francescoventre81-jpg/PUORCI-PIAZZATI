import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getCountdownValue } from "../lib/countdown.ts";
import {
  EARLY_BIRD_DEADLINE,
  getRegistrationPrice,
  STANDARD_PRICE_START,
} from "../lib/pricing.ts";
import {
  isPaymentSufficient,
  isPayPalPaymentValid,
} from "../lib/payment-validation.ts";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("renderizza la homepage PUORCIPIAZZATI e i collegamenti pubblici", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /PUORCIPIAZZATI/);
  assert.match(html, /IL CALCIO,/);
  assert.match(html, /SENZA FILTRI/);
  assert.match(html, /Probabili formazioni/);
  assert.match(html, /Confronto delle fonti/);
  assert.match(html, /Consigli di giornata/);
  assert.match(html, /SIAMO PUORCIPIAZZATI/);
  assert.match(html, /INFORMAZIONI, STRUMENTI, COMMUNITY/);
  assert.match(html, /href="\/#probabili-formazioni"/);
  assert.match(html, /href="\/#chi-siamo"/);
  assert.match(
    html,
    /href="\/news\/sebastiano-esposito-rigorista-rischio-cagliari"/,
  );
  assert.match(html, /Leggi l’analisi PUORCIPIAZZATI/);
  assert.doesNotMatch(html, /href="\/iscrizione"/);
  assert.doesNotMatch(html, /PP AI|PUORCIPIAZZATI AI/);
  assert.match(html, /href="\/formazioni\/milan-venezia"/);
  assert.match(html, /Vedi probabili formazioni/);
});

test("le probabili formazioni della seconda giornata mostrano titolari, panchina e percentuali", async () => {
  const response = await render("/formazioni/cagliari-inter");
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Inter/);
  assert.match(html, /Cagliari/);
  assert.match(html, /2ª giornata/);
  assert.match(html, /Probabile formazione/);
  assert.match(html, /Calciatori a disposizione/);
  assert.match(html, /Lautaro/);
  assert.doesNotMatch(html, /Ballottaggi per squadra/);
  assert.match(html, /Infortuni, squalifiche e dubbi/);
  assert.match(html, /Idrissi/);
  assert.match(html, /probabili, non ufficiali/);
  assert.match(html, /Titolarità da monitorare/);
});

test("ogni calciatore della formazione apre una scheda dedicata", async () => {
  const response = await render("/giocatori/inter-lautaro");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /SCHEDA GIOCATORE/);
  assert.match(html, /Lautaro/);
  assert.match(html, /NUMERI STAGIONALI/);
  assert.match(html, /Partite da titolare/);
  assert.match(html, /Ingresso dalla panchina/);
  assert.match(html, /AGGIORNAMENTI/);
  assert.match(html, /Lautaro/);
  assert.match(html, /Prossima partita:/);
  assert.match(html, /Cagliari - Inter/);
});

test("le news aprono articoli originali PUORCIPIAZZATI con le fonti in fondo", async () => {
  const response = await render(
    "/news/sebastiano-esposito-rigorista-rischio-cagliari",
  );
  assert.equal(response.status, 200);

  const html = await response.text();
  assert.match(html, /Esposito rigorista/);
  assert.match(html, /IN BREVE/);
  assert.match(html, /Il vantaggio PUORCIPIAZZATI/);
  assert.match(html, /Questa è una sintesi originale PUORCIPIAZZATI/);
  assert.match(html, /Fonti consultate/);
  assert.match(html, /sport\.sky\.it/);
  assert.match(html, /sosfanta\.com/);
});

test("la AI è stata rimossa dall’interfaccia e dal Worker", async () => {
  const [worker, page, header] = await Promise.all([
    readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/site-header.tsx", import.meta.url), "utf8"),
  ]);
  assert.doesNotMatch(worker, /puorcipiazzati-ai|GEMINI_API_KEY|TAVILY_API_KEY|env\.AI\.run/);
  assert.doesNotMatch(page, /PuorcipiazzatiAi|pp-ai/);
  assert.doesNotMatch(header, /PP AI|pp-ai/);
});

test("Google Analytics parte soltanto dopo il consenso", async () => {
  const analytics = await readFile(
    new URL("../components/google-analytics.tsx", import.meta.url),
    "utf8",
  );

  assert.match(analytics, /G-52FMKSBSLY/);
  assert.match(analytics, /analytics_storage: "denied"/);
  assert.match(analytics, /choice === "granted"/);
  assert.match(analytics, /googletagmanager\.com\/gtag\/js/);
  assert.match(analytics, /page_view/);
  assert.match(analytics, /Non inviamo nomi, email o dati di pagamento/);
});

test("accesso e recupero password hanno un flusso Supabase completo", async () => {
  const [login, signup, forgot, update, resend, passwordField, callback] =
    await Promise.all([
    readFile(new URL("../components/login-form.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/signup-form.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../components/forgot-password-form.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../components/update-password-form.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../components/resend-confirmation-form.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../components/password-field.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../app/auth/callback/route.ts", import.meta.url), "utf8"),
  ]);

  assert.match(login, /href="\/password-dimenticata"/);
  assert.match(login, /Email o password non corretti/);
  assert.match(login, /role=\{messageKind === "error" \? "alert"/);
  assert.match(login, /options: \{ captchaToken \}/);
  assert.match(login, /window\.location\.assign\("\/dashboard"\)/);
  assert.match(signup, /Le due password non coincidono/);
  assert.match(signup, /next=\/email-confermata/);
  assert.match(forgot, /resetPasswordForEmail/);
  assert.match(forgot, /next=\/reimposta-password/);
  assert.match(forgot, /captchaToken/);
  assert.match(update, /auth\.updateUser/);
  assert.match(update, /password-aggiornata/);
  assert.match(resend, /auth\.resend/);
  assert.match(resend, /type: "signup"/);
  assert.match(resend, /next=\/email-confermata/);
  assert.match(passwordField, /Mostra password/);
  assert.match(passwordField, /Nascondi password/);
  assert.match(callback, /password-dimenticata\?errore=link/);
  assert.match(callback, /response\.cookies\.set/);
  assert.match(callback, /Cache-Control/);
  assert.match(callback, /value === "\/reimposta-password"/);
});

test("la conferma email mantiene la sessione e non richiede un nuovo accesso", async () => {
  const page = await readFile(
    new URL("../app/email-confermata/page.tsx", import.meta.url),
    "utf8",
  );

  assert.match(page, /Email confermata/);
  assert.match(page, /hai già/);
  assert.match(page, /href="\/dashboard"/);
  assert.match(page, /getVerifiedUser/);
});

test("tutti i collegamenti generati usano il dominio pubblico .it", async () => {
  const [
    siteUrl,
    signup,
    resend,
    forgot,
    referralShare,
    email,
    registrationApi,
    paymentMethodApi,
  ] = await Promise.all([
    readFile(new URL("../lib/site-url.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/signup-form.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../components/resend-confirmation-form.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../components/forgot-password-form.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../components/referral-share.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../lib/email.ts", import.meta.url), "utf8"),
    readFile(
      new URL("../app/api/registrations/route.ts", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL(
        "../app/api/registrations/payment-method/route.ts",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  assert.match(siteUrl, /https:\/\/puorcipiazzati\.it/);
  for (const source of [
    signup,
    resend,
    forgot,
    referralShare,
    email,
    registrationApi,
    paymentMethodApi,
  ]) {
    assert.doesNotMatch(source, /workers\.dev|window\.location\.origin/);
  }
  assert.match(signup, /PUBLIC_SITE_URL/);
  assert.match(resend, /PUBLIC_SITE_URL/);
  assert.match(forgot, /PUBLIC_SITE_URL/);
  assert.match(referralShare, /PUBLIC_SITE_URL/);
  assert.match(email, /getPublicSiteUrl/);
  assert.match(registrationApi, /getPublicSiteUrl/);
  assert.match(paymentMethodApi, /getPublicSiteUrl/);
});

test("i vecchi indirizzi workers.dev reindirizzano al dominio .it", async () => {
  const [middleware, viteConfig] = await Promise.all([
    readFile(new URL("../middleware.ts", import.meta.url), "utf8"),
    readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
  ]);

  assert.match(middleware, /host\.endsWith\("\.workers\.dev"\)/);
  assert.match(middleware, /request\.nextUrl\.search/);
  assert.match(middleware, /NextResponse\.redirect\(canonicalUrl, 308\)/);
  assert.match(viteConfig, /workers_dev:\s*true/);
});

test("mantiene segreti e conferme di pagamento esclusivamente server-side", async () => {
  const [form, paypal, webhook, adminClient, migration, envExample] =
    await Promise.all([
      readFile(
        new URL("../components/registration-form.tsx", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../lib/paypal.ts", import.meta.url), "utf8"),
      readFile(
        new URL("../app/api/paypal/webhook/route.ts", import.meta.url),
        "utf8",
      ),
      readFile(new URL("../lib/supabase/admin.ts", import.meta.url), "utf8"),
      readFile(
        new URL(
          "../supabase/migrations/002_payment_workflows.sql",
          import.meta.url,
        ),
        "utf8",
      ),
      readFile(new URL("../.env.example", import.meta.url), "utf8"),
    ]);

  assert.doesNotMatch(form, /PAYPAL_CLIENT_SECRET|SUPABASE_SECRET_KEY/);
  assert.match(paypal, /PAYPAL_CLIENT_SECRET/);
  assert.match(paypal, /verify-webhook-signature/);
  assert.match(webhook, /PAYMENT\.CAPTURE\.COMPLETED/);
  assert.match(adminClient, /SUPABASE_SECRET_KEY/);
  assert.doesNotMatch(adminClient, /NEXT_PUBLIC_SUPABASE_SECRET/);
  assert.match(migration, /enable row level security/);
  assert.match(migration, /to service_role/);
  assert.doesNotMatch(migration, /for insert\s+to anon/i);
  assert.match(envExample, /PAYPAL_WEBHOOK_ID=/);
  assert.match(envExample, /BANK_IBAN=/);
});

test("il premio referral è unico e si sblocca solo su iscrizioni pagate", async () => {
  const [migration, signup, form, api, dashboard] = await Promise.all([
    readFile(
      new URL(
        "../supabase/migrations/002_payment_workflows.sql",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../components/signup-form.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../components/registration-form.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../app/api/registrations/route.ts", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(migration, /owner_registration_id uuid not null unique/);
  assert.match(migration, /confirmed_referrals >= 5/);
  assert.match(migration, /invited\.payment_status = 'paid'/);
  assert.match(migration, /invited\.registration_status = 'confirmed'/);
  assert.match(migration, /reward_not_found_or_already_delivered/);
  assert.match(signup, /referral_code_used: referralCode/);
  assert.match(form, /defaultValue=\{initialReferralCode\}/);
  assert.match(api, /Il codice invito non è valido o non è ancora attivo/);
  assert.match(api, /\.eq\("payment_status", "paid"\)/);
  assert.match(dashboard, /<ReferralShare/);
});

test("il pannello amministratore copre iscrizioni e tutti i pagamenti", async () => {
  const [panel, adminApi, exportApi] = await Promise.all([
    readFile(
      new URL("../components/admin-payment-panel.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL(
        "../app/api/admin/registrations/[id]/route.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../app/api/admin/registrations/export/route.ts",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  assert.match(panel, /Situazione iscrizioni/);
  assert.match(panel, /Pagamenti automatici/);
  assert.match(panel, /Bonifici da verificare/);
  assert.match(panel, /Richieste pagamento in contanti/);
  assert.match(panel, /Codice personale/);
  assert.match(adminApi, /localDateTimeInZoneToDate/);
  assert.match(adminApi, /TIME_ZONE/);
  assert.match(exportApi, /getAdminUser/);
  assert.match(exportApi, /text\/csv/);
  assert.match(exportApi, /Codice referral personale/);
  assert.match(panel, /Codice referral esistente/);
  assert.match(panel, /Utilizzi totali/);
  assert.match(panel, /Amici pagati e confermati/);
  assert.match(panel, /Codice inesistente/);
});

test("invia automaticamente il codice solo dopo un pagamento confermato", async () => {
  const [email, confirmation, webhook, adminApi, recoveryApi, envExample] =
    await Promise.all([
      readFile(new URL("../lib/email.ts", import.meta.url), "utf8"),
      readFile(new URL("../lib/confirmation.ts", import.meta.url), "utf8"),
      readFile(
        new URL("../app/api/paypal/webhook/route.ts", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL(
          "../app/api/admin/registrations/[id]/route.ts",
          import.meta.url,
        ),
        "utf8",
      ),
      readFile(
        new URL(
          "../app/api/admin/confirmation-emails/route.ts",
          import.meta.url,
        ),
        "utf8",
      ),
      readFile(new URL("../.env.example", import.meta.url), "utf8"),
    ]);

  assert.match(email, /Il tuo codice amico/);
  assert.match(email, /emailLayout/);
  assert.match(email, /Comunicazione urgente/);
  assert.match(email, /URGENTE — conserva il tuo codice amico/);
  assert.match(email, /INVITA 5 AMICI/);
  assert.match(email, /tieni premuto sul codice/);
  assert.match(email, /maglia da calcio a tua scelta tra quelle disponibili/);
  assert.match(email, /Richiesta non è ancora|non è ancora un’iscrizione valida/i);
  assert.match(email, /api\.brevo\.com\/v3\/smtp\/email/);
  assert.match(confirmation, /confirmation_email_sent_at/);
  assert.match(webhook, /await deliverConfirmationEmails/);
  assert.match(adminApi, /if \(approved\) await deliverConfirmationEmails/);
  assert.match(adminApi, /nextStatus === "collected"/);
  assert.match(recoveryApi, /payment_status", "paid"/);
  assert.match(recoveryApi, /registration_status", "confirmed"/);
  assert.match(recoveryApi, /confirmation_email_sent_at/);
  assert.match(envExample, /BREVO_API_KEY=/);
});

test("la comunicazione di annullamento distingue pagati confermati e contanti in attesa", async () => {
  const [email, route, migration, adminPanel] = await Promise.all([
    readFile(new URL("../lib/email.ts", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../app/api/admin/edition-cancellation-emails/route.ts",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../supabase/migrations/007_edition_cancellation_refunds.sql",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL("../components/admin-payment-panel.tsx", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(email, /URGENTE – Comunicazione importante – PUORCIPIAZZATI/);
  assert.match(email, /"X-Priority": "1"/);
  assert.match(email, /Importance: "high"/);
  assert.match(email, /RIMBORSO INTEGRALE/);
  assert.match(email, /329 414 7232/);
  assert.match(email, /api\.whatsapp\.com\/send\/\?phone=393294147232/);
  assert.match(email, /target="_blank"/);
  assert.match(email, /non inviare password, PIN, codici OTP/i);
  assert.match(email, /RICHIESTA IN CONTANTI ANNULLATA/);
  assert.match(email, /non risulta incassato/i);
  assert.match(route, /mode === "test"/);
  assert.match(route, /mode === "preview"/);
  assert.match(route, /isPaidConfirmed/);
  assert.match(route, /isPendingCash/);
  assert.match(route, /payment_method === "cash"/);
  assert.match(route, /adminIds\.has/);
  assert.match(route, /CONFERMO_INVIO_DEFINITIVO_RIMBORSI/);
  assert.doesNotMatch(route, /pagamento in contanti senza istruzioni/);
  assert.doesNotMatch(route, /capturePayPalOrder|confirm_payment/);
  assert.match(migration, /refund_pending/);
  assert.match(migration, /refund_completed/);
  assert.match(migration, /refunded_at/);
  assert.match(adminPanel, /Invia prova comunicazione rimborsi/);
  assert.match(adminPanel, /Invia comunicazione a tutti/);
  assert.match(adminPanel, /CONFERMO_INVIO_DEFINITIVO_RIMBORSI/);
});

test("le iscrizioni sono chiuse nella pagina e anche lato server", async () => {
  const [page, api, status] = await Promise.all([
    readFile(new URL("../app/iscrizione/page.tsx", import.meta.url), "utf8"),
    readFile(
      new URL("../app/api/registrations/route.ts", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../lib/registration-status.ts", import.meta.url),
      "utf8",
    ),
  ]);

  assert.match(status, /REGISTRATIONS_CLOSED = true/);
  assert.match(status, /Iscrizioni chiuse, ci vediamo l’anno prossimo/);
  assert.match(page, /REGISTRATIONS_CLOSED_MESSAGE/);
  assert.match(api, /status: 410/);
  assert.match(api, /REGISTRATIONS_CLOSED_MESSAGE/);
});

test("invia welcome e reminder senza duplicati solo agli account incompleti", async () => {
  const [email, automation, cronRoute, worker, viteConfig, migration, envExample] =
    await Promise.all([
      readFile(new URL("../lib/email.ts", import.meta.url), "utf8"),
      readFile(
        new URL("../lib/registration-email-automation.ts", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL(
          "../app/api/internal/registration-emails/route.ts",
          import.meta.url,
        ),
        "utf8",
      ),
      readFile(new URL("../worker/index.ts", import.meta.url), "utf8"),
      readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
      readFile(
        new URL(
          "../supabase/migrations/003_registration_email_automation.sql",
          import.meta.url,
        ),
        "utf8",
      ),
      readFile(new URL("../.env.example", import.meta.url), "utf8"),
    ]);

  assert.match(email, /Benvenuto su PUORCIPIAZZATI — completa ora la tua iscrizione/);
  assert.match(email, /COMPLETA L’ISCRIZIONE/);
  assert.match(email, /Non sei ancora iscritto a PUORCIPIAZZATI/);
  assert.match(email, /ISCRIVITI ORA/);
  assert.match(email, /getRegistrationPrice/);
  assert.match(automation, /claim_welcome_registration_emails/);
  assert.match(automation, /claim_registration_reminders/);
  assert.match(automation, /release_registration_email_job/);
  assert.match(cronRoute, /CRON_SECRET/);
  assert.match(worker, /async scheduled/);
  assert.match(viteConfig, /\*\/5 \* \* \* \*/);
  assert.match(migration, /welcome_registration_email_sent_at/);
  assert.match(migration, /registration_reminder_sent_at/);
  assert.match(migration, /interval '5 hours'/);
  assert.match(migration, /public\.admin_users/);
  assert.match(migration, /registrations\.payment_status = 'paid'/);
  assert.match(migration, /registrations\.registration_status = 'confirmed'/);
  assert.match(migration, /enable row level security/);
  assert.doesNotMatch(migration, /to anon|to authenticated/);
  assert.match(envExample, /CRON_SECRET=/);
});

test("invia una sola email promozionale agli account non ancora iscritti", async () => {
  const [email, automation, migration] = await Promise.all([
    readFile(new URL("../lib/email.ts", import.meta.url), "utf8"),
    readFile(
      new URL("../lib/registration-email-automation.ts", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL(
        "../supabase/migrations/005_promotion_deadline_email.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  assert.match(email, /URGENTE: mancano solo 2 giorni/);
  assert.match(email, /COMPLETA SUBITO L’ISCRIZIONE/);
  assert.match(email, /\/iscrizione/);
  assert.match(automation, /claim_urgent_deadline_emails/);
  assert.match(migration, /promotion_deadline_email_sent_at/);
  assert.match(migration, /registrations\.payment_status = 'paid'/);
  assert.match(migration, /registrations\.registration_status = 'confirmed'/);
  assert.match(migration, /public\.admin_users/);
});

test("1. un istante prima della scadenza applica 35 euro", () => {
  const price = getRegistrationPrice(
    new Date("2026-08-10T23:59:58.999+02:00"),
  );
  assert.equal(price.amountCents, 3500);
  assert.equal(price.tier, "early_bird");
});

test("2. esattamente alla scadenza dichiarata resta early bird", () => {
  // La dicitura «fino alle 23:59:59» include l'inizio di quel secondo.
  const price = getRegistrationPrice(new Date(EARLY_BIRD_DEADLINE));
  assert.equal(price.amountCents, 3500);
  assert.equal(price.tier, "early_bird");
});

test("3. da mezzanotte dell'11 agosto applica 40 euro", () => {
  const atCutover = getRegistrationPrice(new Date(STANDARD_PRICE_START));
  const after = getRegistrationPrice(
    new Date("2026-08-11T00:00:00.001+02:00"),
  );
  assert.equal(atCutover.amountCents, 4000);
  assert.equal(after.amountCents, 4000);
  assert.equal(after.tier, "standard");
});

test("4. il countdown arriva a zero e non diventa negativo", () => {
  const target = new Date(STANDARD_PRICE_START).getTime();
  assert.deepEqual(getCountdownValue(target, target), {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: true,
  });
  assert.deepEqual(getCountdownValue(target + 60_000, target), {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: true,
  });
});

test("5. PayPal con importo errato non è valido", () => {
  const order = {
    status: "COMPLETED",
    purchase_units: [
      {
        custom_id: "registration-1",
        payments: {
          captures: [
            {
              status: "COMPLETED",
              amount: { currency_code: "EUR", value: "34.00" },
            },
          ],
        },
      },
    ],
  };
  assert.equal(
    isPayPalPaymentValid(order, "registration-1", 3500),
    false,
  );
});

test("6. un bonifico insufficiente non può essere confermato", () => {
  assert.equal(isPaymentSufficient(3500, 3499), false);
  assert.equal(isPaymentSufficient(4000, 3999), false);
});

test("7. contanti confermati dopo la scadenza richiedono 40 euro", async () => {
  const price = getRegistrationPrice(
    new Date("2026-08-11T00:00:01+02:00"),
  );
  assert.equal(price.amountCents, 4000);

  const migration = await readFile(
    new URL("../supabase/migrations/002_payment_workflows.sql", import.meta.url),
    "utf8",
  );
  assert.match(
    migration,
    /confirmed_amount_cents <>[\s\S]*registration_amount_due_cents\(now\(\)\)/,
  );
});

test("8. gli importi già pagati sono immutabili dopo la scadenza", async () => {
  const migration = await readFile(
    new URL("../supabase/migrations/002_payment_workflows.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /protect_confirmed_registration_price/);
  assert.match(migration, /old\.payment_status = 'paid'/);
  assert.match(migration, /confirmed_pricing_is_immutable/);
});
