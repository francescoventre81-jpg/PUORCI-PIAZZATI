"use client";

import {
  BadgeCheck,
  CalendarClock,
  CircleX,
  CreditCard,
  MailCheck,
  MapPin,
  PackageCheck,
  RefreshCcw,
  Search,
  Users,
  WalletCards,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  formatPrice,
  STANDARD_PRICE_EUR,
  STANDARD_PRICE_START,
} from "@/lib/pricing-config";

type Registration = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  team_name: string;
  fantasy_username: string;
  created_at: string;
  payment_method: string;
  payment_status: string;
  registration_status: string;
  bank_transfer_reference?: string | null;
  bank_transfer_cro_trn?: string | null;
  bank_transfer_declared_at?: string | null;
  cash_pickup_status?: string | null;
  cash_city?: string | null;
  cash_province?: string | null;
  cash_postal_code?: string | null;
  cash_address?: string | null;
  cash_street_number?: string | null;
  cash_locality?: string | null;
  cash_preferred_times?: string | null;
  cash_scheduled_at?: string | null;
  cash_scheduled_time_window?: string | null;
  cash_schedule_notes?: string | null;
  cash_assigned_organizer?: string | null;
  receiptUrl?: string | null;
  amount_due_cents: number;
  amount_paid_cents?: number | null;
  pricing_tier: "early_bird" | "standard";
  payment_confirmed_at?: string | null;
  paid_at?: string | null;
  paypal_order_id?: string | null;
  paypal_capture_id?: string | null;
  personal_referral_code?: string | null;
  referral_code_used?: string | null;
  confirmation_email_sent_at?: string | null;
};

type Reward = {
  id: string;
  reward_code: string;
  owner_registration_id: string;
  unlocked_at: string;
  delivered_at?: string | null;
  confirmedReferrals: Array<{
    id: string;
    name: string;
    paidAt?: string | null;
  }>;
};

export function AdminPaymentPanel({
  registrations,
  rewards,
  currentPriceCents,
}: {
  registrations: Registration[];
  rewards: Reward[];
  currentPriceCents: number;
}) {
  const [message, setMessage] = useState("");
  const [rewardSearch, setRewardSearch] = useState("");
  const [registrationSearch, setRegistrationSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [emailBusy, setEmailBusy] = useState(false);
  const [cancellationTestBusy, setCancellationTestBusy] = useState(false);
  const [cancellationSendBusy, setCancellationSendBusy] = useState(false);
  const [livePriceCents, setLivePriceCents] = useState(currentPriceCents);
  const paypal = registrations.filter((row) => row.payment_method === "paypal");
  const banks = registrations.filter(
    (row) => row.payment_method === "instant_bank_transfer",
  );
  const cash = registrations.filter((row) => row.payment_method === "cash");
  const registrationById = useMemo(
    () => new Map(registrations.map((row) => [row.id, row])),
    [registrations],
  );
  const normalizedCodeSearch = rewardSearch.trim().toUpperCase();
  const referralOwner = normalizedCodeSearch
    ? registrations.find(
        (row) =>
          row.personal_referral_code?.trim().toUpperCase() ===
          normalizedCodeSearch,
      )
    : undefined;
  const referralUses = referralOwner
    ? registrations.filter(
        (row) =>
          row.referral_code_used?.trim().toUpperCase() ===
          normalizedCodeSearch,
      )
    : [];
  const confirmedReferralUses = referralUses.filter(
    (row) =>
      row.payment_status === "paid" && row.registration_status === "confirmed",
  );
  const pendingReferralUses = referralUses.filter(
    (row) =>
      row.payment_status === "pending" &&
      row.registration_status === "pending",
  );
  const matchedRewards = normalizedCodeSearch
    ? rewards.filter(
        (reward) =>
          reward.reward_code.trim().toUpperCase() === normalizedCodeSearch,
      )
    : [];
  const summary = useMemo(
    () => ({
      total: registrations.length,
      confirmed: registrations.filter(
        (row) =>
          row.payment_status === "paid" &&
          row.registration_status === "confirmed",
      ).length,
      pending: registrations.filter((row) => row.payment_status === "pending")
        .length,
      collectedCents: registrations.reduce(
        (total, row) =>
          total + (row.payment_status === "paid" ? row.amount_paid_cents ?? 0 : 0),
        0,
      ),
    }),
    [registrations],
  );
  const filteredRegistrations = useMemo(() => {
    const query = registrationSearch.trim().toLowerCase();
    return registrations.filter((row) => {
      const matchesStatus =
        statusFilter === "all" || row.payment_status === statusFilter;
      const searchable = [
        row.first_name,
        row.last_name,
        row.email,
        row.phone,
        row.team_name,
        row.fantasy_username,
        row.personal_referral_code,
        row.referral_code_used,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [registrationSearch, registrations, statusFilter]);

  useEffect(() => {
    if (livePriceCents === STANDARD_PRICE_EUR * 100) return;
    const target = new Date(STANDARD_PRICE_START).getTime();
    const update = () => {
      if (Date.now() >= target) setLivePriceCents(STANDARD_PRICE_EUR * 100);
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [livePriceCents]);

  async function action(id: string, payload: Record<string, unknown>) {
    setMessage("");
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };
      setMessage(data.message ?? data.error ?? "Operazione completata.");
      if (response.ok) window.location.reload();
    } catch {
      setMessage("Connessione non disponibile. Riprova tra qualche secondo.");
    } finally {
      setBusyId(null);
    }
  }

  async function schedule(
    event: FormEvent<HTMLFormElement>,
    registrationId: string,
  ) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    await action(registrationId, { action: "cash_scheduled", ...values });
  }

  async function confirmBank(
    event: FormEvent<HTMLFormElement>,
    registrationId: string,
  ) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    await action(registrationId, { action: "bank_confirmed", ...values });
  }

  async function sendMissingConfirmationEmails() {
    setMessage("");
    setEmailBusy(true);
    try {
      const response = await fetch("/api/admin/confirmation-emails", {
        method: "POST",
      });
      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };
      setMessage(data.message ?? data.error ?? "Operazione completata.");
      if (response.ok) window.location.reload();
    } catch {
      setMessage("Connessione non disponibile. Riprova tra qualche secondo.");
    } finally {
      setEmailBusy(false);
    }
  }

  async function sendCancellationTestEmail() {
    setMessage("");
    setCancellationTestBusy(true);
    try {
      const response = await fetch("/api/admin/edition-cancellation-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "test" }),
      });
      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };
      setMessage(data.message ?? data.error ?? "Operazione completata.");
    } catch {
      setMessage("Connessione non disponibile. Riprova tra qualche secondo.");
    } finally {
      setCancellationTestBusy(false);
    }
  }

  async function sendCancellationEmails() {
    setMessage("");
    setCancellationSendBusy(true);
    try {
      const previewResponse = await fetch(
        "/api/admin/edition-cancellation-emails",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "preview" }),
        },
      );
      const preview = (await previewResponse.json()) as {
        eligible?: number;
        alreadySent?: number;
        breakdown?: {
          paypal: number;
          bankTransfer: number;
          cashPaid: number;
          cashPending: number;
        };
        error?: string;
      };

      if (!previewResponse.ok || preview.eligible === undefined) {
        throw new Error(preview.error ?? "Verifica destinatari non riuscita.");
      }

      if (preview.eligible === 0) {
        setMessage(
          preview.alreadySent
            ? `Nessuna email da inviare: ${preview.alreadySent} comunicazioni risultano già inviate.`
            : "Nessun partecipante idoneo trovato. Nessuna email inviata.",
        );
        return;
      }

      const breakdown = preview.breakdown;
      const confirmed = window.confirm(
        `Confermi l’invio definitivo a ${preview.eligible} partecipanti?\n\n` +
          `PayPal: ${breakdown?.paypal ?? 0}\n` +
          `Bonifico: ${breakdown?.bankTransfer ?? 0}\n` +
          `Contanti pagati: ${breakdown?.cashPaid ?? 0}\n` +
          `Contanti in attesa: ${breakdown?.cashPending ?? 0}\n\n` +
          "Gli amministratori e gli account senza iscrizione idonea sono esclusi.",
      );
      if (!confirmed) {
        setMessage("Invio annullato. Nessuna email è stata spedita.");
        return;
      }

      const response = await fetch("/api/admin/edition-cancellation-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "send",
          confirmation: "CONFERMO_INVIO_DEFINITIVO_RIMBORSI",
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };
      setMessage(data.message ?? data.error ?? "Operazione completata.");
      if (response.ok) window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Connessione non disponibile. Riprova tra qualche secondo.",
      );
    } finally {
      setCancellationSendBusy(false);
    }
  }

  return (
    <div className="container admin-sections">
      {message ? <p className="admin-message">{message}</p> : null}

      <section className="admin-overview" aria-labelledby="admin-overview-title">
        <div className="admin-overview-heading">
          <div>
            <span>QUADRO GENERALE</span>
            <h2 id="admin-overview-title">Situazione iscrizioni</h2>
          </div>
          <div className="admin-overview-actions">
            <button
              disabled={emailBusy}
              onClick={() => void sendMissingConfirmationEmails()}
              type="button"
            >
              <MailCheck size={16} />
              {emailBusy ? "Invio in corso…" : "Invia codici mancanti"}
            </button>
            <button
              disabled={cancellationTestBusy}
              onClick={() => void sendCancellationTestEmail()}
              type="button"
            >
              <MailCheck size={16} />
              {cancellationTestBusy
                ? "Invio prova in corso…"
                : "Invia prova comunicazione rimborsi"}
            </button>
            <button
              disabled={cancellationSendBusy}
              onClick={() => void sendCancellationEmails()}
              type="button"
            >
              <MailCheck size={16} />
              {cancellationSendBusy
                ? "Invio definitivo in corso…"
                : "Invia comunicazione a tutti"}
            </button>
            <button onClick={() => window.location.reload()} type="button">
              <RefreshCcw size={16} /> Aggiorna dati
            </button>
          </div>
        </div>
        <div className="admin-summary-grid">
          <SummaryCard icon={<Users />} label="Richieste totali" value={summary.total} />
          <SummaryCard icon={<BadgeCheck />} label="Iscrizioni confermate" value={summary.confirmed} />
          <SummaryCard icon={<CalendarClock />} label="Pagamenti in attesa" value={summary.pending} />
          <SummaryCard icon={<WalletCards />} label="Totale incassato" value={formatPrice(summary.collectedCents)} />
        </div>
      </section>

      <section className="admin-section">
        <header>
          <span>TUTTE LE ISCRIZIONI</span>
          <h2>Elenco completo</h2>
        </header>
        <div className="admin-filterbar">
          <label className="admin-registration-search">
            <Search size={18} />
            <span className="sr-only">Cerca iscrizione</span>
            <input
              onChange={(event) => setRegistrationSearch(event.target.value)}
              placeholder="Cerca nome, email, squadra o codice"
              type="search"
              value={registrationSearch}
            />
          </label>
          <label>
            <span className="sr-only">Filtra per stato pagamento</span>
            <select
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value="all">Tutti gli stati</option>
              <option value="pending">In attesa</option>
              <option value="paid">Pagati</option>
              <option value="rejected">Rifiutati</option>
            </select>
          </label>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-registration-table">
            <thead>
              <tr>
                <th>Iscritto</th>
                <th>Pagamento</th>
                <th>Importo</th>
                <th>Codice personale</th>
                <th>Codice usato</th>
                <th>Email codice</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.first_name} {row.last_name}</strong>
                    <span>{row.email}</span>
                    <span>{row.team_name}</span>
                  </td>
                  <td>
                    <span>{paymentMethodLabel(row.payment_method)}</span>
                    <strong className={`status status-${row.payment_status}`}>
                      {paymentStatusLabel(row.payment_status)}
                    </strong>
                  </td>
                  <td>
                    <strong>{formatPrice(row.amount_paid_cents ?? row.amount_due_cents)}</strong>
                    <span>{registrationStatusLabel(row.registration_status)}</span>
                  </td>
                  <td><code>{row.personal_referral_code ?? "—"}</code></td>
                  <td><code>{row.referral_code_used ?? "—"}</code></td>
                  <td>
                    {row.payment_status !== "paid"
                      ? "Non ancora dovuta"
                      : row.confirmation_email_sent_at
                        ? "Inviata"
                        : "Da inviare"}
                  </td>
                  <td>{formatDate(row.created_at, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredRegistrations.length ? (
            <p className="admin-empty">Nessuna iscrizione corrisponde alla ricerca.</p>
          ) : null}
        </div>
      </section>

      <section className="admin-section">
        <header>
          <span>PAYPAL</span>
          <h2>Pagamenti automatici</h2>
          <p className="admin-section-note">
            PayPal viene confermato esclusivamente dal webhook verificato. Non è prevista una conferma manuale.
          </p>
        </header>
        <div className="admin-card-grid">
          {paypal.length ? paypal.map((row) => (
            <article className="admin-card" key={row.id}>
              <PaymentCardHeader row={row} />
              <dl>
                <Info label="Importo dovuto" value={formatPrice(row.amount_due_cents)} />
                <Info label="Importo pagato" value={row.amount_paid_cents !== null && row.amount_paid_cents !== undefined ? formatPrice(row.amount_paid_cents) : null} />
                <Info label="Ordine PayPal" value={row.paypal_order_id} />
                <Info label="Acquisizione PayPal" value={row.paypal_capture_id} />
                <Info label="Confermato il" value={formatDate(row.payment_confirmed_at ?? row.paid_at, true)} />
                <Info label="Codice referral" value={row.personal_referral_code} />
                <Info
                  label="Email con codice"
                  value={row.confirmation_email_sent_at ? "Inviata" : "Da inviare"}
                />
              </dl>
              <p className={`admin-verification admin-verification-${row.payment_status}`}>
                <CreditCard size={17} />
                {row.payment_status === "paid"
                  ? "Pagamento verificato automaticamente da PayPal"
                  : "In attesa della conferma sicura di PayPal"}
              </p>
            </article>
          )) : <EmptyState />}
        </div>
      </section>

      <section className="admin-section">
        <header>
          <span>BONIFICI</span>
          <h2>Bonifici da verificare</h2>
        </header>
        <div className="admin-card-grid">
          {banks.length ? (
            banks.map((row) => (
              <article className="admin-card" key={row.id}>
                <PaymentCardHeader row={row} />
                <dl>
                  <Info
                    label="Importo dovuto"
                    value={formatPrice(row.amount_due_cents)}
                  />
                  <Info
                    label="Importo verificato"
                    value={
                      row.amount_paid_cents
                        ? formatPrice(row.amount_paid_cents)
                        : null
                    }
                  />
                  <Info label="Causale" value={row.bank_transfer_reference} />
                  <Info label="CRO/TRN" value={row.bank_transfer_cro_trn} />
                  <Info
                    label="Data dichiarata"
                    value={formatDate(row.bank_transfer_declared_at)}
                  />
                </dl>
                {row.receiptUrl ? (
                  <a
                    className="admin-file-link"
                    href={row.receiptUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Apri ricevuta privata
                  </a>
                ) : (
                  <p className="admin-muted">Ricevuta non caricata</p>
                )}
                {row.payment_status === "pending" ? (
                  <>
                    <form
                      className="bank-review-form"
                      onSubmit={(event) => confirmBank(event, row.id)}
                    >
                      <label>
                        Importo verificato (€)
                        <input
                          inputMode="decimal"
                          min="0"
                          name="amount_paid_eur"
                          required
                          step="0.01"
                          type="number"
                        />
                      </label>
                      <label>
                        Data/ora effettiva del bonifico
                        <input
                          name="verified_payment_at"
                          required
                          type="datetime-local"
                        />
                      </label>
                      <button disabled={busyId === row.id} type="submit">
                        <BadgeCheck size={16} /> {busyId === row.id ? "Verifica…" : "Conferma bonifico"}
                      </button>
                    </form>
                    <div className="admin-actions">
                    <button
                      className="danger"
                      disabled={busyId === row.id}
                      onClick={() =>
                        action(row.id, { action: "bank_rejected" })
                      }
                      type="button"
                    >
                      <CircleX size={16} /> Rifiuta verifica
                    </button>
                    </div>
                  </>
                ) : null}
              </article>
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </section>

      <section className="admin-section">
        <header>
          <span>CONTANTI</span>
          <h2>Richieste pagamento in contanti</h2>
        </header>
        <div className="admin-card-grid">
          {cash.length ? (
            cash.map((row) => (
              <article className="admin-card cash-admin-card" key={row.id}>
                <PaymentCardHeader row={row} />
                <p className="admin-address">
                  <MapPin size={18} />
                  {row.cash_address} {row.cash_street_number}
                  {row.cash_locality ? `, ${row.cash_locality}` : ""},{" "}
                  {row.cash_postal_code} {row.cash_city} ({row.cash_province})
                </p>
                <dl>
                  <Info
                    label="Quota effettiva dovuta"
                    value={formatPrice(
                      row.payment_status === "paid"
                        ? row.amount_due_cents
                        : livePriceCents,
                    )}
                  />
                  <Info
                    label="Importo incassato"
                    value={
                      row.amount_paid_cents
                        ? formatPrice(row.amount_paid_cents)
                        : null
                    }
                  />
                  <Info label="Telefono" value={row.phone} />
                  <Info label="Fasce preferite" value={row.cash_preferred_times} />
                  <Info label="Stato ritiro" value={row.cash_pickup_status} />
                  <Info
                    label="Data richiesta"
                    value={formatDate(row.created_at, true)}
                  />
                </dl>
                {row.payment_status !== "paid" ? (
                  <>
                    <div className="admin-actions">
                      <button
                        disabled={busyId === row.id}
                        onClick={() =>
                          action(row.id, { action: "cash_approved" })
                        }
                        type="button"
                      >
                        Zona raggiungibile
                      </button>
                      <button
                        className="danger"
                        disabled={busyId === row.id}
                        onClick={() =>
                          action(row.id, { action: "cash_rejected" })
                        }
                        type="button"
                      >
                        Zona non raggiungibile
                      </button>
                    </div>
                    <form
                      className="schedule-form"
                      onSubmit={(event) => schedule(event, row.id)}
                    >
                      <h3>
                        <CalendarClock size={17} /> Programma ritiro
                      </h3>
                      <input name="scheduled_at" required type="datetime-local" />
                      <input
                        name="time_window"
                        placeholder="Fascia oraria"
                        required
                        type="text"
                      />
                      <input
                        name="assigned_organizer"
                        placeholder="Organizzatore incaricato"
                        required
                        type="text"
                      />
                      <textarea name="notes" placeholder="Note" rows={2} />
                      <button disabled={busyId === row.id} type="submit">Programma ritiro</button>
                    </form>
                    <div className="admin-actions">
                      <button
                        className="collect"
                        disabled={busyId === row.id}
                        onClick={() => {
                          const fullName = `${row.first_name} ${row.last_name}`;
                          if (
                            window.confirm(
                              `Confermi di aver ricevuto fisicamente ${formatPrice(livePriceCents)} da ${fullName}?`,
                            )
                          ) {
                            void action(row.id, { action: "cash_collected" });
                          }
                        }}
                        type="button"
                      >
                        Conferma incasso di {formatPrice(livePriceCents)}
                      </button>
                      <button
                        className="danger"
                        disabled={busyId === row.id}
                        onClick={() =>
                          action(row.id, { action: "cash_cancelled" })
                        }
                        type="button"
                      >
                        Annulla richiesta
                      </button>
                    </div>
                  </>
                ) : null}
              </article>
            ))
          ) : (
            <EmptyState />
          )}
        </div>
      </section>

      <section className="admin-section reward-section">
        <header>
          <span>CODICI INVITO E PREMIO</span>
          <h2>Verifica codici</h2>
        </header>
        <label className="reward-search">
          <Search />
          <input
            onChange={(event) => setRewardSearch(event.target.value)}
            placeholder="Inserisci codice referral o premio"
            type="search"
            value={rewardSearch}
          />
        </label>
        <div className="admin-card-grid">
          {!normalizedCodeSearch ? (
            <p className="admin-empty">
              Inserisci un codice completo per verificarne esistenza e utilizzi.
            </p>
          ) : null}

          {referralOwner ? (
            <article className="admin-card reward-verification-card">
              <strong className="reward-code">{normalizedCodeSearch}</strong>
              <p className="code-valid"><BadgeCheck /> Codice referral esistente</p>
              <p>
                Titolare: {referralOwner.first_name} {referralOwner.last_name}
              </p>
              <div className="code-usage-grid">
                <p>
                  <strong>{referralUses.length}</strong>
                  <span>Utilizzi totali</span>
                </p>
                <p>
                  <strong>{confirmedReferralUses.length}</strong>
                  <span>Amici pagati e confermati</span>
                </p>
                <p>
                  <strong>{pendingReferralUses.length}</strong>
                  <span>Richieste in attesa</span>
                </p>
              </div>
            </article>
          ) : null}

          {matchedRewards.map((reward) => {
              const owner = registrationById.get(reward.owner_registration_id);
              return (
                <article className="admin-card" key={reward.id}>
                  <strong className="reward-code">{reward.reward_code}</strong>
                  <p className="code-valid"><BadgeCheck /> Codice premio esistente</p>
                  <p>
                    Titolare: {owner?.first_name} {owner?.last_name}
                  </p>
                  <p>Sbloccato: {formatDate(reward.unlocked_at, true)}</p>
                  <p>
                    Referral confermati verificabili:{" "}
                    <strong>{reward.confirmedReferrals.length}</strong>
                  </p>
                  <ol className="reward-referrals">
                    {reward.confirmedReferrals.slice(0, 5).map((referral) => (
                      <li key={referral.id}>
                        {referral.name} — {formatDate(referral.paidAt, true)}
                      </li>
                    ))}
                  </ol>
                  {reward.delivered_at ? (
                    <p className="reward-delivered">
                      <PackageCheck /> Consegnata il{" "}
                      {formatDate(reward.delivered_at, true)}
                    </p>
                  ) : (
                    <button
                      disabled={busyId === reward.id}
                      onClick={() =>
                        action(reward.id, { action: "reward_delivered" })
                      }
                      type="button"
                    >
                      Segna maglia come consegnata
                    </button>
                  )}
                </article>
              );
            })}

          {normalizedCodeSearch &&
          !referralOwner &&
          matchedRewards.length === 0 ? (
            <p className="admin-empty code-invalid">
              <CircleX /> Codice inesistente. Controlla di averlo scritto
              correttamente.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function PaymentCardHeader({ row }: { row: Registration }) {
  return (
    <header className="admin-card-header">
      <div>
        <h3>
          {row.first_name} {row.last_name}
        </h3>
        <p>{row.email}</p>
      </div>
      <span className={`status status-${row.payment_status}`}>
        {paymentStatusLabel(row.payment_status)}
      </span>
    </header>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <article className="admin-summary-card">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function paymentMethodLabel(value: string) {
  const labels: Record<string, string> = {
    paypal: "PayPal",
    instant_bank_transfer: "Bonifico istantaneo",
    cash: "Contanti",
  };
  return labels[value] ?? value;
}

function paymentStatusLabel(value: string) {
  const labels: Record<string, string> = {
    pending: "In attesa",
    paid: "Pagato",
    rejected: "Rifiutato",
  };
  return labels[value] ?? value;
}

function registrationStatusLabel(value: string) {
  const labels: Record<string, string> = {
    pending: "Iscrizione in attesa",
    confirmed: "Iscrizione confermata",
    cancelled: "Iscrizione annullata",
  };
  return labels[value] ?? value;
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || "—"}</dd>
    </div>
  );
}

function EmptyState() {
  return <p className="admin-empty">Nessuna richiesta in questa sezione.</p>;
}

function formatDate(value?: string | null, includeTime = false) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
  }).format(new Date(value));
}
