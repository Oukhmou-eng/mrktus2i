import "../../css/Boutiques.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTokenPayload } from "../../store/authStore";

export default function BoutiquesAdmin() {
  const [boutiques, setBoutiques] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadAdminBoutiques = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté(e) pour accéder à cette page admin.");
        setLoading(false);
        return;
      }

      const payload = getTokenPayload(token);
      if (!payload?.role || payload.role !== "admin") {
        setError("Accès refusé : vous devez être administrateur pour voir cette page.");
        setLoading(false);
        return;
      }

      try {
        setError("");
        const response = await fetch("http://localhost:3000/boutiques/admin/boutiques", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message || `Erreur HTTP ${response.status}`);
        }

        const data = await response.json();
        setBoutiques(data?.boutiques ?? []);
      } catch (requestError) {
        console.error("Erreur lors du chargement des boutiques admin :", requestError);
        setError(requestError.message || "Impossible de charger les boutiques admin.");
      } finally {
        setLoading(false);
      }
    };

    loadAdminBoutiques();
  }, []);

  const displayedBoutiques = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return boutiques
      .filter((boutique) => {
        if (statusFilter !== "all" && boutique.statut !== statusFilter) {
          return false;
        }
        if (!normalizedSearch) return true;
        return boutique.nom.toLowerCase().includes(normalizedSearch) || boutique.slug.toLowerCase().includes(normalizedSearch);
      })
      .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  }, [boutiques, search, statusFilter]);

  const saveStatus = async (boutiqueId, boutiqueNom, nextStatus, previousStatus) => {
    if (nextStatus === previousStatus) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté(e) pour modifier le statut.");
      return;
    }

    setSavingId(boutiqueId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`http://localhost:3000/boutiques/admin/${boutiqueId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ statut: nextStatus }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !(data?.success ?? true)) {
        throw new Error(data?.message || `Erreur HTTP ${response.status}`);
      }

      setBoutiques((current) =>
        current.map((item) =>
          item.id_boutique === boutiqueId
            ? { ...item, statut: nextStatus }
            : item,
        ),
      );
      setMessage(`Statut de ${boutiqueNom} mis à jour en « ${nextStatus} ». `);
    } catch (requestError) {
      console.error("Erreur lors de la mise à jour du statut :", requestError);
      setError(requestError.message || "Impossible de mettre à jour le statut.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <main className="directory-shops-page">
      <section className="directory-shops" aria-labelledby="admin-boutiques-title">
        <header className="directory-shops__header">
          <span className="directory-shops__eyebrow">Administration</span>
          <h1 id="admin-boutiques-title">Gestion des boutiques</h1>
          <p>Affichez les boutiques actives et suspendues, puis modifiez rapidement leur statut.</p>
        </header>

        <div className="directory-shops__tools">
          <label className="directory-shops__search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Rechercher une boutique"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className="directory-shops__sort">
            <span>Filtrer par statut</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </label>
        </div>

        {message && <div className="directory-shops__notice">{message}</div>}
        {error && <div className="directory-shops__notice directory-shops__notice--error">{error}</div>}

        {!loading && !error && (
          <p className="directory-shops__count">
            {displayedBoutiques.length} boutique{displayedBoutiques.length > 1 ? "s" : ""} affichée{displayedBoutiques.length > 1 ? "s" : ""}
          </p>
        )}
        {loading && <div className="directory-shops__notice">Chargement des boutiques…</div>}

        {!loading && !error && displayedBoutiques.length === 0 && (
          <div className="directory-shops__empty">
            <span aria-hidden="true">⌕</span>
            <h2>Aucune boutique trouvée</h2>
            <p>Essayez un autre filtre ou statut.</p>
          </div>
        )}

        <div className="directory-shops__list">
          {displayedBoutiques.map((boutique) => {
            const nextStatus = boutique.statut;
            return (
              <article className="directory-shop-card" key={boutique.id_boutique}>
                <div className="directory-shop-card__logo">
                  {boutique.logo_url ? <img src={boutique.logo_url} alt={boutique.nom} /> : boutique.nom.slice(0, 1).toUpperCase()}
                </div>
                <div className="directory-shop-card__content">
                  <h2>{boutique.nom}</h2>
                  <div className="directory-shop-card__details">
                    <span className="directory-shop-card__rating">★ {Number(boutique.note_moyenne ?? 0).toFixed(1)}</span>
                    <span>{boutique.nbr_produits ?? 0} produit{(boutique.nbr_produits ?? 0) > 1 ? "s" : ""}</span>
                    <span className={boutique.statut === 'suspendu' ? 'directory-shop-card__verified' : ''}>
                      Statut : {boutique.statut}
                    </span>
                  </div>
                </div>
                <div className="directory-shop-card__actions" style={{ alignItems: 'flex-start' }}>
                  <button className="btn teal btn-sm" onClick={() => navigate(`/boutique/${boutique.id_boutique}`)}>
                    Voir la boutique
                  </button>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <select
                      value={nextStatus}
                      onChange={(event) => saveStatus(boutique.id_boutique, boutique.nom, event.target.value, boutique.statut)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--line)', fontFamily: 'inherit' }}
                      disabled={savingId === boutique.id_boutique}
                    >
                      <option value="actif">Actif</option>
                      <option value="suspendu">Suspendu</option>
                    </select>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
