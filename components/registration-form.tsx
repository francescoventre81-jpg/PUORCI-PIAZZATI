"use client";

import {
  Banknote,
  Check,
  CheckCircle2,
  Copy,
  Landmark,
  Send,
  ShieldCheck,
  Upload,
  WalletCards,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { PaymentMethod } from "@/lib/payments";
import type { RegistrationPrice } from "@/lib/pricing-config";

type RegistrationFormProps = {
  initialFirstName?: string;
  initialLastName?: string;
  initialPrice: RegistrationPrice;
  initialReferralCode?: string;
  standardPriceEur: number;
  standardPriceStart: string;
  verifiedEmail: string;
};

type RegistrationResult = {
  registrationId: string;
  paymentMethod: PaymentMethod;
  approvalUrl?: string;
  amount?: string;
  message?: string;
  bank?: {
    accountHolder: string;
    iban: string;
    reference: string;
  };
};

export function RegistrationForm({
  initialFirstName = "",
  initialLastName = "",
  initialPrice,
  initialReferralCode = "",
  standardPriceEur,
  standardPriceStart,
  verifiedEmail,
}: RegistrationFormProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("paypal");
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayPrice, setDisplayPrice] = useState(initialPrice.amountEur);
  const [displayTier, setDisplayTier] = useState(initialPrice.tier);
  const paymentOptions = useMemo(
    () => [
      {
        value: "paypal" as const,
        title: "Paga con PayPal",
        icon: WalletCards,
        description: `Paga online ${displayPrice} € in modo sicuro tramite PayPal. L’iscrizione verrà confermata automaticamente dopo il completamento del pagamento.`,
      },
      {
        value: "instant_bank_transfer" as const,
        title: "Bonifico istantaneo",
        icon: Landmark,
        description: `Effettua un bonifico istantaneo di ${displayPrice} €. L’iscrizione verrà confermata dopo la verifica del pagamento.`,
      },
      {
        value: "cash" as const,
        title: "Pagamento in contanti",
        icon: Banknote,
        description:
          "Disponibile esclusivamente nelle zone raggiungibili dagli organizzatori. La quota definitiva dipende dalla data dell’incasso effettivo.",
      },
    ],
    [displayPrice],
  );

  useEffect(() => {
    if (displayTier === "standard") return;
    const target = new Date(standardPriceStart).getTime();
    const update = () => {
      if (Date.now() >= target) {
        setDisplayPrice(standardPriceEur);
        setDisplayTier("standard");
      }
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [displayTier, standardPriceEur, standardPriceStart]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
          rules_accepted: formData.get("rules_accepted") === "on",
        }),
      });
      const data = (await response.json()) as RegistrationResult & {
        error?: string;
      };

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

  if (result?.paymentMethod === "instant_bank_transfer" && result.bank) {
    return <BankTransferInstructions result={result} />;
  }

  if (result?.paymentMethod === "cash") {
    return (
      <div className="form-success cash-success" role="status">
        <CheckCircle2 aria-hidden="true" />
        <span>RICHIESTA IN ATTESA</span>
        <h2>Il ritiro non è ancora confermato.</h2>
        <p>{result.message}</p>
      </div>
    );
  }

  return (
    <form className="sport-form" onSubmit={handleSubmit}>
      <div className="form-intro">
        <span>DATI DEL FANTALLENATORE</span>
        <p>
          {displayTier === "early_bird"
            ? `Quota promozionale: ${displayPrice} € fino al 10 agosto 2026`
            : `Quota di iscrizione: ${displayPrice} €`}
          . I campi con * sono obbligatori.
        </p>
      </div>

      <div className="form-grid">
        <label>
          <span>Nome *</span>
          <input
            autoComplete="given-name"
            defaultValue={initialFirstName}
            name="first_name"
            required
            type="text"
          />
        </label>
        <label>
          <span>Cognome *</span>
          <input
            autoComplete="family-name"
            defaultValue={initialLastName}
            name="last_name"
            required
            type="text"
          />
        </label>
        <label>
          <span>Data di nascita *</span>
          <input name="birth_date" required type="date" />
        </label>
        <label>
          <span>Numero di telefono *</span>
          <input autoComplete="tel" name="phone" required type="tel" />
        </label>
        <label>
          <span>Email *</span>
          <input
            autoComplete="email"
            className="verified-input"
            readOnly
            type="email"
            value={verifiedEmail}
          />
          <small className="verified-label">Email verificata</small>
        </label>
        <label>
          <span>Nome squadra *</span>
          <input name="team_name" required type="text" />
        </label>
        <label>
          <span>Username Fantacalcio *</span>
          <input name="fantasy_username" required type="text" />
        </label>
        <label>
          <span>Codice invito <small>(facoltativo)</small></span>
          <input
            defaultValue={initialReferralCode}
            maxLength={9}
            name="referral_code_used"
            pattern="FP-[A-Za-z0-9]{6}"
            placeholder="FP-7K2Q9D"
            type="text"
          />
          {initialReferralCode ? (
            <small className="verified-label">
              Codice collegato dal link di invito
            </small>
          ) : null}
        </label>
      </div>

      <fieldset className="payment-fieldset">
        <legend>Scegli come pagare {displayPrice} € *</legend>
        <div className="payment-option-grid">
          {paymentOptions.map((option) => {
            const Icon = option.icon;
            return (
              <label
                className={`payment-option ${selectedMethod === option.value ? "selected" : ""}`}
                key={option.value}
              >
                <input
                  checked={selectedMethod === option.value}
                  name="payment_method"
                  onChange={() => setSelectedMethod(option.value)}
                  type="radio"
                  value={option.value}
                />
                <span className="payment-option-icon">
                  <Icon aria-hidden="true" />
                </span>
                <strong>{option.title}</strong>
                <p>{option.description}</p>
                <span className="payment-option-check">
                  <Check size={14} />
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {selectedMethod === "cash" ? (
        <CashFields
          displayPrice={displayPrice}
          earlyBird={displayTier === "early_bird"}
          standardPriceEur={standardPriceEur}
        />
      ) : null}

      <div className="payment-warning">
        <ShieldCheck aria-hidden="true" />
        <p>
          L&apos;invio della richiesta o di una ricevuta non conferma
          l&apos;iscrizione. Diventerai ufficialmente iscritto soltanto dopo
          l&apos;effettiva conferma del pagamento.
        </p>
      </div>

      <div className="consent-list">
        <label>
          <input name="rules_accepted" required type="checkbox" />
          <span>
            <i aria-hidden="true" />
            Ho letto e accetto il Regolamento e sono consapevole che il
            montepremi e i premi possono variare in base al numero totale degli
            iscritti, come indicato nel regolamento.
          </span>
        </label>
        <label>
          <input name="privacy_accepted" required type="checkbox" />
          <span>
            <i aria-hidden="true" />
            Acconsento al trattamento dei dati personali *
          </span>
        </label>
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button className="form-submit" disabled={loading} type="submit">
        {loading ? "INVIO IN CORSO..." : "CONTINUA CON IL PAGAMENTO"}{" "}
        <Send size={19} />
      </button>
    </form>
  );
}

function CashFields({
  displayPrice,
  earlyBird,
  standardPriceEur,
}: {
  displayPrice: number;
  earlyBird: boolean;
  standardPriceEur: number;
}) {
  return (
    <section className="cash-fields">
      <div className="cash-notice">
        <strong>PRIMA DI INVIARE</strong>
        <p>
          Il pagamento in contanti è disponibile soltanto nelle zone
          raggiungibili dagli organizzatori. L&apos;invio della richiesta non
          garantisce che il ritiro possa essere effettuato.
        </p>
        <p>
          {earlyBird
            ? `La quota promozionale di ${displayPrice} € vale soltanto se l’incasso viene confermato entro il 10 agosto 2026. Se il ritiro avviene dopo, saranno dovuti ${standardPriceEur} €.`
            : `La quota da consegnare agli organizzatori è di ${displayPrice} €.`}
        </p>
      </div>
      <div className="form-grid">
        <label>
          <span>Comune *</span>
          <input name="cash_city" required type="text" />
        </label>
        <label>
          <span>Provincia *</span>
          <input maxLength={2} name="cash_province" required type="text" />
        </label>
        <label>
          <span>CAP *</span>
          <input inputMode="numeric" name="cash_postal_code" required type="text" />
        </label>
        <label>
          <span>Indirizzo *</span>
          <input name="cash_address" required type="text" />
        </label>
        <label>
          <span>Numero civico *</span>
          <input name="cash_street_number" required type="text" />
        </label>
        <label>
          <span>Frazione o località <small>(facoltativo)</small></span>
          <input name="cash_locality" type="text" />
        </label>
        <label className="form-wide">
          <span>Giorni o fasce orarie preferite *</span>
          <textarea name="cash_preferred_times" required rows={3} />
        </label>
        <label>
          <span>Telefono per essere contattato *</span>
          <input autoComplete="tel" name="cash_contact_phone" required type="tel" />
        </label>
        <label>
          <span>Indicazioni aggiuntive <small>(facoltativo)</small></span>
          <textarea name="cash_notes" rows={3} />
        </label>
      </div>
    </section>
  );
}

function BankTransferInstructions({ result }: { result: RegistrationResult }) {
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
  }

  async function uploadReceipt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setUploadMessage("");
    const response = await fetch(
      `/api/registrations/${result.registrationId}/receipt`,
      { method: "POST", body: new FormData(event.currentTarget) },
    );
    const payload = (await response.json()) as {
      message?: string;
      error?: string;
    };
    setUploadMessage(payload.message ?? payload.error ?? "Operazione non riuscita.");
    setUploading(false);
  }

  return (
    <div className="bank-result">
      <header>
        <CheckCircle2 />
        <div>
          <span>RICHIESTA SALVATA</span>
          <h2>Completa il bonifico istantaneo</h2>
        </div>
      </header>
      <p className="bank-warning">
        Il caricamento della ricevuta non conferma automaticamente
        l&apos;iscrizione. Un amministratore verificherà il pagamento.
      </p>
      <dl className="bank-details">
        <div>
          <dt>Importo</dt>
          <dd>{result.amount}</dd>
        </div>
        <div>
          <dt>Intestatario</dt>
          <dd>{result.bank?.accountHolder}</dd>
        </div>
        <div>
          <dt>IBAN</dt>
          <dd>{result.bank?.iban}</dd>
          <button onClick={() => copy(result.bank?.iban ?? "")} type="button">
            <Copy size={16} /> Copia IBAN
          </button>
        </div>
        <div>
          <dt>Causale obbligatoria</dt>
          <dd>{result.bank?.reference}</dd>
          <button
            onClick={() => copy(result.bank?.reference ?? "")}
            type="button"
          >
            <Copy size={16} /> Copia causale
          </button>
        </div>
      </dl>
      <form className="receipt-form" onSubmit={uploadReceipt}>
        <h3>Invia i dati del bonifico</h3>
        <label>
          <span>Ricevuta PDF, JPG o PNG *</span>
          <input
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            name="receipt"
            required
            type="file"
          />
        </label>
        <label>
          <span>CRO/TRN <small>(facoltativo)</small></span>
          <input name="cro_trn" type="text" />
        </label>
        <label>
          <span>Data del bonifico *</span>
          <input name="declared_at" required type="date" />
        </label>
        <button className="button button-primary" disabled={uploading} type="submit">
          <Upload size={17} /> {uploading ? "CARICAMENTO..." : "CARICA RICEVUTA"}
        </button>
        {uploadMessage ? <p role="status">{uploadMessage}</p> : null}
      </form>
    </div>
  );
}
