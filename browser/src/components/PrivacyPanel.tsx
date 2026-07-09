import { formatLovelace, toHex } from '../por/PorBrowserClient';

interface PrivacyRow {
  field: string;
  visibility: 'public' | 'private';
  value: string;
  note: string;
}

interface PrivacyPanelProps {
  totalLiabilities: bigint;
  customerCount: number;
  ledger: {
    solvent: boolean;
    published: boolean;
    reservesSnapshot: bigint;
    reservesSlot: bigint;
    owner: Uint8Array;
    liabilitiesRoot: Uint8Array;
  } | null;
}

export function PrivacyPanel({ totalLiabilities, customerCount, ledger }: PrivacyPanelProps) {
  const rows: PrivacyRow[] = [
    {
      field: 'Solvent verdict',
      visibility: 'public',
      value: ledger ? (ledger.solvent ? '✓ Solvent' : '✗ Insolvent') : '—',
      note: 'Published on Midnight ledger after proof',
    },
    {
      field: 'Reserves snapshot',
      visibility: 'public',
      value: ledger ? formatLovelace(ledger.reservesSnapshot) : '—',
      note: 'Total reserves you attested in the proof',
    },
    {
      field: 'Liabilities Merkle root',
      visibility: 'public',
      value: ledger ? `${toHex(ledger.liabilitiesRoot).slice(0, 16)}…` : '—',
      note: 'Commitment to the liability tree — not the balances',
    },
    {
      field: 'Reserves slot',
      visibility: 'public',
      value: ledger ? ledger.reservesSlot.toString() : '—',
      note: 'Timestamp anchor for the attestation',
    },
    {
      field: 'Contract owner',
      visibility: 'public',
      value: ledger ? `${toHex(ledger.owner).slice(0, 12)}…` : '—',
      note: 'Custodian public key hash',
    },
    {
      field: 'Total liabilities',
      visibility: 'private',
      value: `${formatLovelace(totalLiabilities)} (${customerCount} customers)`,
      note: 'Used inside the ZK circuit — never written to the public ledger',
    },
    {
      field: 'Per-customer balances',
      visibility: 'private',
      value: `${customerCount} leaf values in witness`,
      note: 'Only the prover sees individual balances; chain sees root + sum check',
    },
  ];

  return (
    <section className="panel privacy-panel">
      <header>
        <h2>Privacy boundary</h2>
        <p>What Midnight publishes vs what stays in the proof.</p>
      </header>
      <div className="privacy-grid">
        {rows.map((row) => (
          <article key={row.field} className={`privacy-row privacy-row--${row.visibility}`}>
            <div className="privacy-row__meta">
              <span className={`badge badge--${row.visibility}`}>
                {row.visibility === 'public' ? 'On-chain' : 'Witness only'}
              </span>
              <h3>{row.field}</h3>
            </div>
            <p className="privacy-row__value">{row.value}</p>
            <p className="privacy-row__note">{row.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
