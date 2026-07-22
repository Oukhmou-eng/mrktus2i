import "../../css/Boutiques.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";






function Boutiques() {

  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const AuthDialog = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <h3>Connexion requise</h3>
        <p>Vous devez être connecté pour suivre cette boutique. Voulez-vous vous connecter ?</p>
        <div className="dialog-actions">
          <button onClick={onCancel} className="btn-secondary">
            Annuler
          </button>
          <button onClick={onConfirm} className="btn-primary">
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
};
  const navigate = useNavigate();
  // Le reste du catalogue utilise actuellement cet utilisateur de démonstration.
  // À remplacer par l'identifiant issu de la session quand l'authentification sera branchée.
  const userId = 1;
  const [boutiques, setBoutiques] = useState([]);
  const [followedIds, setFollowedIds] = useState(new Set());
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  




  useEffect(() => {
    const loadBoutiques = async () => {
      const token = localStorage.getItem("token");
      try {
        setError("");
        const [response, followedResponse] = await Promise.all([
          fetch("http://localhost:3000/boutiques"),
          fetch(`http://localhost:3000/boutiques/suiviess`, {
            method: "POST",
            headers: {
    Authorization: `Bearer ${token}`,
  }, }
   ) ]);
        if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`);
        const data = await response.json();
        setBoutiques(data?.boutiques ?? []);
        if (followedResponse.ok) {
          const followedData = await followedResponse.json();
          setFollowedIds(new Set((followedData?.boutiques ?? []).map((boutique) => boutique.id_boutique)));
        }
      } catch (requestError) {
        console.error("Erreur lors du chargement des boutiques :", requestError);
        setError("Impossible de charger les boutiques pour le moment.");
      } finally {
        setLoading(false);
      }
    };
    loadBoutiques();
  }, []);






  const toggleFollow = async (boutiqueId) => {
     const token = localStorage.getItem("token");

if (!token) {
    setShowAuthDialog(true);
  return;
}

    const isFollowed = followedIds.has(boutiqueId);
    setFollowedIds((current) => {
      const next = new Set(current);
      if (isFollowed) next.delete(boutiqueId);
      else next.add(boutiqueId);
      return next;
    });

    try {
      const response = await fetch(
        `http://localhost:3000/boutiques/${boutiqueId}/suivies`,
        { method: isFollowed ? "DELETE" : "POST" ,
          headers: {
    Authorization: `Bearer ${token}`,
  },
        },
      );
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error(data?.message || "Erreur de suivi");
    } catch (requestError) {
      console.error("Erreur lors de la mise à jour du suivi :", requestError);
      setFollowedIds((current) => {
        const next = new Set(current);
        if (isFollowed) next.add(boutiqueId);
        else next.delete(boutiqueId);
        return next;
      });
      setError("La mise à jour du suivi n’a pas pu être enregistrée.");
    }
  };








  const displayedBoutiques = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    const result = boutiques
      .map((boutique) => ({
        id: boutique.id_boutique,
        nom: boutique.nom || "Boutique sans nom",
        slug: boutique.slug || "",
        logo: boutique.logo_url || "",
        note: Number(boutique.note_moyenne ?? 0),
        estVerifiee: Boolean(boutique.estVerifier),
        nbrProduits: Number(boutique.nbr_produits ?? 0),
        dateCreation: boutique.date_creation || "",
      }))
      .filter((boutique) => !term || `${boutique.nom} ${boutique.slug}`.toLocaleLowerCase().includes(term));

    return result.sort((a, b) => {
      if (sort === "mieux_notees") return b.note - a.note;
      if (sort === "plus_produits") return b.nbrProduits - a.nbrProduits;
      if (sort === "nouvelles") return new Date(b.dateCreation) - new Date(a.dateCreation);
      return a.nom.localeCompare(b.nom, "fr");
    });
  }, [boutiques, search, sort]);

  return (
    <main className="directory-shops-page">
      <section className="directory-shops" aria-labelledby="directory-shops-title">
        <header className="directory-shops__header">
          <span className="directory-shops__eyebrow">La plateforme</span>
          <h1 id="directory-shops-title">Découvrez les boutiques</h1>
          <p>Explorez des vendeurs indépendants et trouvez vos prochaines trouvailles.</p>
        </header>

        <div className="directory-shops__tools">
          <label className="directory-shops__search">
            <span aria-hidden="true">⌕</span>
            <input type="search" placeholder="Rechercher une boutique" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <label className="directory-shops__sort">
            <span>Trier par</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="">Nom de la boutique</option>
              <option value="mieux_notees">Mieux notées</option>
              <option value="plus_produits">Plus de produits</option>
              <option value="nouvelles">Plus récentes</option>
            </select>
          </label>
        </div>

        {!loading && !error && <p className="directory-shops__count">{displayedBoutiques.length} boutique{displayedBoutiques.length > 1 ? "s" : ""} disponible{displayedBoutiques.length > 1 ? "s" : ""}</p>}
        {loading && <div className="directory-shops__notice">Chargement des boutiques…</div>}
        {error && <div className="directory-shops__notice directory-shops__notice--error">{error}</div>}

        {!loading && !error && displayedBoutiques.length === 0 && (
          <div className="directory-shops__empty">
            <span aria-hidden="true">⌕</span>
            <h2>Aucune boutique trouvée</h2>
            <p>Essayez un autre terme de recherche.</p>
          </div>
        )}

        <div className="directory-shops__list">
          {displayedBoutiques.map((boutique) => {
            const isFollowed = followedIds.has(boutique.id);
            return (
            <article className="directory-shop-card" key={boutique.id}>
              <div className="directory-shop-card__logo">
                {boutique.logo ? <img src={boutique.logo} alt="" /> : boutique.nom.slice(0, 1).toUpperCase()}
              </div>
              <div className="directory-shop-card__content">
                <h2>{boutique.nom}</h2>
                <div className="directory-shop-card__details">
                  <span className="directory-shop-card__rating">★ {boutique.note.toFixed(1)}</span>
                  <span>{boutique.nbrProduits} produit{boutique.nbrProduits > 1 ? "s" : ""}</span>
                  {boutique.estVerifiee && <span className="directory-shop-card__verified">Vendeur vérifié</span>}
                </div>
              </div>
              <div className="directory-shop-card__actions">
                <button className="btn teal btn-sm" onClick={() => navigate(`/boutique/${boutique.id}`)}>Voir la boutique</button>
                <button
                  className={`directory-shop-card__follow ${isFollowed ? "is-followed" : ""}`}
                  onClick={() => toggleFollow(boutique.id)}
                  aria-pressed={isFollowed}
                >
                  {isFollowed ? "✓ Suivie" : "+ Suivre"}
                </button>
              </div>
            </article>
            );
          })}
        </div>
        <AuthDialog
          isOpen={showAuthDialog}
          onConfirm={() => {
            setShowAuthDialog(false);
            navigate('/login');
          }}
          onCancel={() => setShowAuthDialog(false)}
        />
      </section>
    </main>
  );
}

export default Boutiques;
