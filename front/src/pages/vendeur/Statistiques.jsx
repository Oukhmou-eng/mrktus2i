import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const API_BASE_URL = "http://localhost:3000/commandes/statistiques";

export default function StatistiquesVente() {
  const [periode, setPeriode] = useState(7);
  const [resume, setResume] = useState(null);
  const [ventesParJour, setVentesParJour] = useState([]);
  const [topProduits, setTopProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState(null);

  const chargerDonnees = useCallback(async (periodeChoisie) => {
    setLoading(true);
    setErreur(null);
    const token = localStorage.getItem('token');

    if (!token) {
      setErreur('Vous devez être connecté(e) pour voir les statistiques.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ periode: periodeChoisie }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || `Erreur HTTP ${res.status}`);
      }

      const data = await res.json();
      setResume(data?.resume ?? null);
      setVentesParJour(data?.ventesParJour ?? []);
      setTopProduits(data?.topProduits ?? []);
    } catch (err) {
      setErreur(err.message || 'Une erreur est survenue.');
      setResume(null);
      setVentesParJour([]);
      setTopProduits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerDonnees(periode);
  }, [periode, chargerDonnees]);

  const formatMAD = (nombre) =>
    typeof nombre === "number"
      ? `${nombre.toLocaleString("fr-FR")} MAD`
      : "—";

  const formatNombre = (nombre) =>
    typeof nombre === "number" ? nombre.toLocaleString("fr-FR") : "—";

  return (
    <main className="stats-page">
      <style>{css}</style>

      <div className="stats-topline">
        <div>
          <span className="stats-kicker">Analyse</span>
          <h1>Statistiques de vente</h1>
        </div>
      </div>

      {erreur && (
        <div className="stats-alert-error">
          {erreur}{" "}
          <button className="stats-retry-btn" onClick={() => chargerDonnees(periode)}>
            Réessayer
          </button>
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          label="Ventes totales"
          value={loading ? "…" : formatMAD(resume?.ventesTotales)}
          delta={resume?.deltaVentes}
          loading={loading}
        />
        <StatCard
          label="Visites boutique"
          value={loading ? "…" : formatNombre(resume?.visitesBoutique)}
          delta={resume?.deltaVisites}
          loading={loading}
        />
        <StatCard
          label="Taux de conversion"
          value={loading ? "…" : `${resume?.tauxConversion ?? "—"}%`}
          delta={resume?.deltaConversion}
          loading={loading}
        />
      </div>

      <div className="stats-chart-card">
        <div className="stats-chart-header">
          <div className="stats-chart-title">
            Ventes par jour ({periode} derniers jours)
          </div>
          <select
            className="stats-select"
            value={periode}
            onChange={(e) => setPeriode(Number(e.target.value))}
          >
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
          </select>
        </div>

        <div className="stats-chart-body">
          {loading ? (
            <div className="stats-chart-placeholder">Chargement…</div>
          ) : ventesParJour.length === 0 ? (
            <div className="stats-chart-placeholder">Aucune donnée disponible.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={ventesParJour} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="statsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--stats-accent)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--stats-accent)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--stats-line)" />
                <XAxis
                  dataKey="jour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--stats-text-muted)", fontFamily: "Sora", fontSize: 13 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--stats-text-muted)", fontFamily: "Sora", fontSize: 13 }}
                  tickFormatter={(value) => `${value.toLocaleString('fr-FR')} MAD`}
                  width={60}
                />
                <Tooltip
                  cursor={{ stroke: "var(--stats-accent)", strokeWidth: 2, strokeDasharray: "4 4" }}
                  formatter={(value) => [formatMAD(value), "Ventes"]}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--stats-line)",
                    fontFamily: "Sora",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="ventes"
                  stroke="var(--stats-accent)"
                  strokeWidth={3}
                  fill="url(#statsGradient)"
                  activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2 }}
                  dot={{ r: 4, fill: "#ffffff", stroke: "var(--stats-accent)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="stats-table-card">
        <h3>Top produits vendus</h3>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Ventes</th>
              <th>Revenus</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="stats-table-empty">Chargement…</td>
              </tr>
            ) : topProduits.length === 0 ? (
              <tr>
                <td colSpan={3} className="stats-table-empty">Aucun produit vendu sur cette période.</td>
              </tr>
            ) : (
              topProduits.map((produit, i) => (
                <tr key={i}>
                  <td>{produit.produit}</td>
                  <td>{formatNombre(produit.ventes)}</td>
                  <td className="stats-mono">{formatMAD(produit.revenus)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function StatCard({ label, value, delta, loading }) {
  const isUp = typeof delta === "number" && delta >= 0;
  return (
    <div className="stats-card">
      <div className="stats-card-label">{label}</div>
      <div className="stats-card-value">{value}</div>
      {!loading && typeof delta === "number" && (
        <div className={`stats-card-delta ${isUp ? "stats-up" : "stats-down"}`}>
          {isUp ? "↑" : "↓"} {Math.abs(delta)}% ce mois
        </div>
      )}
    </div>
  );
}

const css = `
  .stats-page {
    --stats-accent: #14b8a6;
    --stats-text: #1f2937;
    --stats-text-muted: #6b7280;
    --stats-line: #e5e7eb;
    --stats-bg-card: #ffffff;
    font-family: 'Sora', sans-serif;
    color: var(--stats-text);
    padding: 28px 32px;
    background: #f7f8fa;
  }

  .stats-topline { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
  .stats-kicker { display: block; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--stats-accent); font-weight: 600; margin-bottom: 4px; }
  .stats-topline h1 { margin: 0; font-size: 26px; font-weight: 700; }

  .stats-alert-error {
    background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c;
    padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;
    display: flex; align-items: center; gap: 12px; font-size: 14px;
  }
  .stats-retry-btn {
    border: 1px solid #b91c1c; background: transparent; color: #b91c1c;
    padding: 4px 10px; border-radius: 6px; cursor: pointer; font-family: inherit;
  }

  .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
  .stats-card { background: var(--stats-bg-card); border: 1px solid var(--stats-line); border-radius: 12px; padding: 20px; }
  .stats-card-label { color: var(--stats-text-muted); font-size: 13px; margin-bottom: 8px; }
  .stats-card-value { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
  .stats-card-delta { font-size: 13px; font-weight: 600; }
  .stats-up { color: #059669; }
  .stats-down { color: #dc2626; }

  .stats-chart-card { background: var(--stats-bg-card); border: 1px solid var(--stats-line); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
  .stats-chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .stats-chart-title { font-weight: 600; font-size: 15px; }
  .stats-select { padding: 6px 10px; border-radius: 6px; border: 1px solid var(--stats-line); font-family: 'Sora', sans-serif; background: white; }
  .stats-chart-body { min-height: 280px; display: flex; align-items: center; justify-content: center; }
  .stats-chart-placeholder { color: var(--stats-text-muted); font-size: 14px; }

  .stats-table-card { background: var(--stats-bg-card); border: 1px solid var(--stats-line); border-radius: 12px; padding: 20px; }
  .stats-table-card h3 { margin: 0 0 16px 0; font-size: 16px; }
  .stats-table { width: 100%; border-collapse: collapse; }
  .stats-table th { text-align: left; font-size: 12px; color: var(--stats-text-muted); text-transform: uppercase; letter-spacing: 0.04em; padding: 8px 0; border-bottom: 1px solid var(--stats-line); }
  .stats-table td { padding: 12px 0; border-bottom: 1px solid var(--stats-line); font-size: 14px; }
  .stats-mono { font-variant-numeric: tabular-nums; font-family: monospace; }
  .stats-table-empty { text-align: center; color: var(--stats-text-muted); padding: 20px 0; }
`;