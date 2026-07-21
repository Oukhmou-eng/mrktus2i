import "../../css/BoutiquesS.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:3000";

function BoutiquesSuivies() {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const [boutiques, setBoutiques] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const loadBoutiques = useCallback(async () => {
    if (!userId) {
      setError("Utilisateur introuvable.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (sort) params.set("sort", sort);
      const response = await fetch(
        `${API_URL}/boutiques/${userId}/suivies?${params.toString()}`,
      );
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
      const data = await response.json();
      setBoutiques(data?.boutiques ?? []);
    } catch (requestError) {
      console.error("Erreur lors du chargement des boutiques suivies :", requestError);
      setBoutiques([]);
      setError("Impossible de charger vos boutiques suivies. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  }, [search, sort, userId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(loadBoutiques, 250);
    return () => window.clearTimeout(timeoutId);
  }, [loadBoutiques]);

  const normalizedBoutiques = useMemo(
    () =>
      boutiques.map((boutique) => ({
        id: boutique.id_boutique,
        nom: boutique.nom || "Boutique sans nom",
        slug: boutique.slug || "",
        logo: boutique.logo_url || "",
        note: Number(boutique.note_moyenne ?? 0),
        estVerifiee: Boolean(boutique.estVerifier),
        nbrProduits: Number(boutique.nbr_produits ?? 0),
      })),
    [boutiques],
  );

  const removeFollow = async (boutiqueId) => {
    setRemovingId(boutiqueId);
    setError("");
    try {
      const response = await fetch(
        `${API_URL}/boutiques/${userId}/${boutiqueId}/suivies`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
      const data = await response.json();
      if (!data?.success) throw new Error(data?.message || "Suppression impossible");
      setBoutiques((current) =>
        current.filter((boutique) => boutique.id_boutique !== boutiqueId),
      );
    } catch (requestError) {
      console.error("Erreur lors du désabonnement :", requestError);
      setError("La boutique n’a pas pu être retirée de vos suivis.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <main className="followed-shops-page">
      <section className="followed-shops" aria-labelledby="followed-shops-title">
        <header className="followed-shops__header">
          <div>
            <span className="followed-shops__eyebrow">Votre sélection</span>
            <h1 id="followed-shops-title">Boutiques suivies</h1>
            <p>Retrouvez les vendeurs que vous souhaitez garder à portée de main.</p>
          </div>
          <button className="followed-shops__catalog-link" onClick={() => navigate("/boutiques")}>
            Découvrir des boutiques <span aria-hidden="true">→</span>
          </button>
        </header>

        <div className="followed-shops__tools">
          <label className="followed-shops__search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Rechercher une boutique suivie"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label className="followed-shops__sort">
            <span>Trier par</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="">Pertinence</option>
              <option value="mieux_notees">Mieux notées</option>
              <option value="plus_produits">Plus de produits</option>
              <option value="nouvelles">Plus récentes</option>
            </select>
          </label>
        </div>

        {!loading && !error && (
          <p className="followed-shops__count">
            {normalizedBoutiques.length} boutique{normalizedBoutiques.length > 1 ? "s" : ""} suivie{normalizedBoutiques.length > 1 ? "s" : ""}
          </p>
        )}

        {error && <div className="followed-shops__notice followed-shops__notice--error">{error}</div>}
        {loading && <div className="followed-shops__notice">Chargement de vos boutiques…</div>}

        {!loading && !error && normalizedBoutiques.length === 0 && (
          <div className="followed-shops__empty">
            <span aria-hidden="true">♡</span>
            <h2>{search ? "Aucun résultat" : "Vous ne suivez encore aucune boutique"}</h2>
            <p>{search ? "Essayez un autre nom de boutique." : "Explorez la plateforme puis suivez vos vendeurs préférés."}</p>
            {!search && <button className="btn teal" onClick={() => navigate("/boutiques")}>Explorer les boutiques</button>}
          </div>
        )}

        <div className="followed-shops__list">
          {normalizedBoutiques.map((boutique) => (
            <article className="followed-shop-card" key={boutique.id}>
              <div className="followed-shop-card__logo" aria-hidden={!boutique.logo}>
                {boutique.logo ? <img src={boutique.logo} alt="" /> : boutique.nom.slice(0, 1).toUpperCase()}
              </div>
              <div className="followed-shop-card__content">
                <h2>{boutique.nom}</h2>
                <div className="followed-shop-card__details">
                  <span className="followed-shop-card__rating">★ {boutique.note.toFixed(1)}</span>
                  <span>{boutique.nbrProduits} produit{boutique.nbrProduits > 1 ? "s" : ""}</span>
                  {boutique.estVerifiee && <span className="followed-shop-card__verified">Vendeur vérifié</span>}
                </div>
              </div>
              <div className="followed-shop-card__actions">
                <button className="btn teal btn-sm" onClick={() => navigate(`/boutique/${boutique.id}`)}>Voir la boutique</button>
                <button className="followed-shop-card__unfollow" onClick={() => removeFollow(boutique.id)} disabled={removingId === boutique.id}>
                  {removingId === boutique.id ? "Retrait…" : "Ne plus suivre"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default BoutiquesSuivies;
