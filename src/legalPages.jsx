import React from 'react';
import './rtTheme.css';

/* Impressum (#impressum) + Datenschutzerklärung (#datenschutz) — required
   under §5 DDG (Impressum) and DSGVO (Datenschutz) before real client data
   is collected in Germany. [FILL] markers are the operator's to complete —
   everything else describes what this app actually does. */

function Shell({ title, children }) {
  return (
    <div className="rt-light">
      <div className="rt-wrap" style={{ paddingTop: 40, maxWidth: 640 }}>
        <div className="rt-header">
          <img src="/rt-logo-white.webp" alt="Rising Tide Collective" className="rt-logo" />
        </div>
        <h1 className="rt-h1">{title}</h1>
        <div style={{ fontSize: 14, lineHeight: 1.7 }}>{children}</div>
        <p className="rt-note" style={{ marginTop: 32 }}>
          <a href="#impressum" style={{ color: 'var(--rt-teal)', marginRight: 16 }}>Impressum</a>
          <a href="#datenschutz" style={{ color: 'var(--rt-teal)', marginRight: 16 }}>Datenschutz</a>
          <a href="#terms" style={{ color: 'var(--rt-teal)' }}>Terms</a>
        </p>
      </div>
    </div>
  );
}

export function Impressum() {
  return (
    <Shell title="Impressum">
      <p><strong>Angaben gemäß § 5 DDG</strong></p>
      <p>
        [FILL: Full legal name of the operator or entity]<br />
        [FILL: Street address]<br />
        [FILL: Postal code, city]<br />
        Germany
      </p>
      <p>
        <strong>Kontakt</strong><br />
        E-Mail: hello@risingtide.store<br />
        [FILL: Phone number, optional]
      </p>
      <p>
        [FILL if applicable: Umsatzsteuer-Identifikationsnummer gemäß §27a UStG]<br />
        [FILL if applicable: Handelsregister, Registergericht, Registernummer]
      </p>
      <p>
        <strong>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</strong><br />
        [FILL: Name and address, if different from above]
      </p>
      <p style={{ color: 'var(--rt-muted)', fontSize: 12, marginTop: 24 }}>
        This page must be completed with real entity details before RT Network is used with real clients or providers.
      </p>
    </Shell>
  );
}

// NOTE: DRAFT copy pending German AGB/lawyer review. Discloses the planner 2%
// service fee and frames RT as a neutral facilitator (not a party to the service
// contract, not an employer/supplier of staff) — see docs/money-flow-and-liability.md.
export function ClientTerms() {
  return (
    <Shell title="Terms for event requests">
      <p>
        Submitting a request through <code>/#plan</code> sends your event package to the providers you selected
        (venue, catering, DJ/AV, crew, photography) so each can confirm availability and price. <strong>Submitting
        is not a booking</strong> — your event is only confirmed once every selected provider has accepted.
      </p>
      <p>
        Prices shown are quoted by each provider at submission time. Final contracts, deposits and payment terms
        are agreed directly between you and each confirmed provider unless stated otherwise.
      </p>
      <p>
        RT Network (Rising Tide Collective) is a booking-facilitation platform — it introduces you to providers and
        confirms availability, but is <strong>not a party to your contract</strong> with any provider. For this service,
        RT Network charges you a <strong>2% service fee</strong> on the confirmed total, shown to you before you submit;
        each venue separately pays RT Network a booking fee. Payment for the services themselves is made directly to each
        provider.
      </p>
      <p>
        All providers — including any crew or staffing — are <strong>independent businesses</strong>, solely responsible
        for their own services, personnel and obligations. RT Network is not their employer or agent and neither
        supervises nor supplies staff.
      </p>
      <p>
        You can check your request's status anytime at the link emailed to you, or by revisiting your quote
        reference at <code>/#quote/&lt;reference&gt;</code>.
      </p>
      <p>For how we handle your data, see <a href="#datenschutz" style={{ color: 'var(--rt-teal)' }}>Datenschutz</a>.</p>
    </Shell>
  );
}

export function Datenschutz() {
  return (
    <Shell title="Datenschutzerklärung">
      <p><strong>1. Verantwortlicher</strong></p>
      <p>[FILL: same entity/address as Impressum]. Fragen zum Datenschutz: hello@risingtide.store</p>

      <p><strong>2. Welche Daten wir verarbeiten</strong></p>
      <p>
        Beim Absenden einer Anfrage über den Event-Planer (<code>/#plan</code>) verarbeiten wir: Name, E-Mail-Adresse,
        optional Telefonnummer, Eventdetails (Art, Datum, Gästezahl, Budget) und die von Ihnen ausgewählten
        Dienstleistungen. Diese Daten werden in einer Cloudflare-D1-Datenbank in der EU (Region EEUR) gespeichert.
      </p>
      <p>
        Anbieter (Venues, Catering, DJ, Personal, Fotografie) erhalten über einen personalisierten Link
        (<code>/#backstage/…</code>) Zugriff auf die für sie relevanten Anfragen — Eventart, Datum, Gästezahl und
        den vereinbarten Betrag.
      </p>
      <p>
        Die interne CRM-Ansicht (<code>/#ops</code>) speichert Planungsdaten ausschließlich lokal im Browser des
        Betreibers (localStorage) — diese Daten verlassen das Gerät nicht, außer über die oben genannte
        Quotes-Funktion.
      </p>

      <p><strong>3. Zweck und Rechtsgrundlage</strong></p>
      <p>
        Verarbeitung zur Vertragsanbahnung und -abwicklung (Art. 6 Abs. 1 lit. b DSGVO) — die Vermittlung einer
        Buchungsanfrage zwischen Ihnen und den ausgewählten Dienstleistern.
      </p>

      <p><strong>4. E-Mail-Versand</strong></p>
      <p>
        Bestätigungs- und Statusmails werden über [FILL: Resend, USA/EU-Subprozessor je nach Konfiguration] versendet.
        [FILL: add an Auftragsverarbeitungsvertrag (AVV) reference once Resend is active in production.]
      </p>

      <p><strong>5. Empfänger</strong></p>
      <p>
        Ihre Eventdetails werden an die von Ihnen ausgewählten Dienstleister (Venue, Catering, DJ, Personal,
        Fotografie) weitergegeben, damit diese die Anfrage bestätigen können. Keine Weitergabe an Dritte darüber hinaus.
      </p>

      <p><strong>6. Speicherdauer</strong></p>
      <p>[FILL: define a retention period, e.g. 24 months after the event date, then deletion/anonymization.]</p>

      <p><strong>7. Ihre Rechte</strong></p>
      <p>
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit
        und Widerspruch (Art. 15–21 DSGVO). Wenden Sie sich dazu an hello@risingtide.store. Sie haben zudem das
        Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
      </p>

      <p><strong>8. Cookies / Tracking</strong></p>
      <p>
        Diese Anwendung setzt keine Analyse- oder Marketing-Cookies. Technisch notwendige Daten (z. B. localStorage
        für Ihren Warenkorb / Ihre Planung) verbleiben in Ihrem Browser.
      </p>

      <p style={{ color: 'var(--rt-muted)', fontSize: 12, marginTop: 24 }}>
        [FILL] markers must be completed — and the Resend/e-mail section confirmed — before this page is considered final.
      </p>
    </Shell>
  );
}
