import { CheckCircle2, ExternalLink, Scale } from "lucide-react";
import { sourceComparison } from "@/lib/editorial-data";

export function SourceComparison() {
  return (
    <article className="source-comparison-card">
      <div className="portal-card-kicker">
        <Scale size={17} /> Confronto delle fonti
      </div>
      <span className="portal-demo-pill">Confronto verificato</span>
      <h2>“{sourceComparison.question}”</h2>
      <div className="source-list">
        {sourceComparison.sources.map((source) => (
          <div className="source-row" key={source.label}>
            <a href={source.url} rel="noopener noreferrer" target="_blank">
              {source.label} <ExternalLink size={13} />
            </a>
            <strong className="is-positive">
              <CheckCircle2 size={16} />
              {source.state}
            </strong>
          </div>
        ))}
      </div>
      <div className="source-result">
        <span>RISULTATO DEL CONFRONTO</span>
        <strong>{sourceComparison.result}</strong>
        <small>{sourceComparison.note}</small>
      </div>
    </article>
  );
}
