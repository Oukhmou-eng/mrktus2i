import "../../css/MesProduits.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MesProduits() {
  const [info, setInfo] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  

  const token = localStorage.getItem('token');
  const id_b =  localStorage.getItem('id_boutique');

  const handleGetMesProduits = async () => {
    if (!token) {
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`http://localhost:3000/produits/${id_b}/mes-produits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const data = await res.json();
      setInfo(data?.produits ?? []);
    } catch (requestError) {
      console.error("Erreur lors du chargement des produits :", requestError);
      setInfo([]);
      setError("Impossible de charger vos produits. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetMesProduits();
  }, [id_b]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        setPlansError('');
        const res = await fetch('http://localhost:3000/promotions/plans', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data = await res.json();
        setPlans(data || []);
      } catch (requestError) {
        console.error('Erreur lors du chargement des plans de promotion :', requestError);
        setPlans([]);
        setPlansError('Impossible de charger les plans de promotion.');
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, [token]);

  const categories = [...new Set(info.map((produit) => produit.categorie_nom).filter(Boolean))];
  const produits = info.filter((produit) => {
    const text = `${produit.nom} ${produit.id_produit}`.toLowerCase();
    return text.includes(search.toLowerCase())
      && (!category || produit.categorie_nom === category)
      && (!status || produit.statut === status);
  });

  const deleteProduit = async (produitId) => {
    if (!window.confirm("Supprimer ce produit ?")) return;

    setDeletingId(produitId);
    setError("");
    try {
      const res = await fetch(`http://localhost:3000/produits/${produitId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      const data = await res.json();
      if (!data?.success) throw new Error(data?.error || "Suppression impossible");
      setInfo((current) => current.filter((produit) => produit.id_produit !== produitId));
    } catch (requestError) {
      console.error("Erreur lors de la suppression du produit :", requestError);
      setError("Le produit n’a pas pu être supprimé.");
    } finally {
      setDeletingId(null);
    }
  };

  const [selectedProduitId, setSelectedProduitId] = useState(null);
  const [panelAction, setPanelAction] = useState(null);
  const [actionPanelOpen, setActionPanelOpen] = useState(false);

  const [typeReduction, setTypeReduction] = useState('pourcentage');
  const [valeurReduction, setValeurReduction] = useState('0');
  const [prixPromo, setPrixPromo] = useState('0');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [submittingSolde, setSubmittingSolde] = useState(false);
  const [soldeError, setSoldeError] = useState('');

  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [factureError, setFactureError] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiration, setCardExpiration] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [promoSubmitting, setPromoSubmitting] = useState(false);
  const [promoError, setPromoError] = useState('');

  const openSoldePanel = (produitId) => {
    setSelectedProduitId(produitId);
    setPanelAction('solde');
    setTypeReduction('pourcentage');
    setValeurReduction('0');
    setPrixPromo('0');
    setDateDebut('');
    setDateFin('');
    setSoldeError('');
    setActionPanelOpen(true);
  };

  const openPromoPanel = (produitId) => {
    setSelectedProduitId(produitId);
    setPanelAction('promo');
    setSelectedPlanId(null);
    setFactureError('');
    setPromoError('');
    setCardNumber('');
    setCardHolder('');
    setCardExpiration('');
    setCardCvv('');
    setActionPanelOpen(true);
  };

  const closeActionPanel = () => {
    setActionPanelOpen(false);
    setSelectedProduitId(null);
    setPanelAction(null);
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    if (!token) return navigate('/login');
    setPromoSubmitting(true);
    setPromoError('');
    setFactureError('');

    if (!selectedPlanId) {
      setPromoError('Veuillez choisir un plan de promotion.');
      setPromoSubmitting(false);
      return;
    }

    try {
      const body = {
        id_produit: selectedProduitId,
        plan_tarif_id: Number(selectedPlanId),
        type_facture: 'promotion',
        reference_id: selectedProduitId,
        card_number: cardNumber || undefined,
        card_holder: cardHolder || undefined,
        card_expiration: cardExpiration || undefined,
        card_cvv: cardCvv || undefined,
      };
      const res = await fetch('http://localhost:3000/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Erreur HTTP ${res.status}`);
      }
      await handleGetMesProduits();
      closeActionPanel();
    } catch (err) {
      console.error('Erreur création promotion:', err);
      setPromoError(err.message || 'Impossible de créer la promotion.');
    } finally {
      setPromoSubmitting(false);
    }
  };

  const handleSoldeSubmit = async (e) => {
    e.preventDefault();
    if (!token) return navigate('/login');
    setSubmittingSolde(true);
    setSoldeError('');
    try {
      const body = {
        type_reduction: typeReduction,
        valeur_reduction: Number(valeurReduction),
        prix_promo: Number(prixPromo),
        date_debut: dateDebut,
        date_fin: dateFin,
      };
      const res = await fetch(`http://localhost:3000/produits/${selectedProduitId}/solde`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Erreur HTTP ${res.status}`);
      }
      await handleGetMesProduits();
      closeActionPanel();
    } catch (err) {
      console.error('Erreur création solde:', err);
      setSoldeError(err.message || 'Impossible de créer le solde.');
    } finally {
      setSubmittingSolde(false);
    }
  };

  const statusLabel = {
    en_ligne: "En ligne",
    brouillon: "Brouillon",
    rupture: "Hors stock",
    archive: "Archivé",
  };

  return (
    <main className="my-products-page">
      <section className="my-products" aria-labelledby="my-products-title">
        <header className="my-products__header">
          <div>
            <span className="my-products__eyebrow">Catalogue</span>
            <h1 id="my-products-title">Mes produits</h1>
            <p>Gérez les articles proposés dans vos boutiques.</p>
          </div>
          <button className="btn teal" onClick={() => navigate("/publierProduit")}>+ Ajouter un produit</button>
        </header>

        <div className="my-products__filters">
          <label className="my-products__search">
            <span aria-hidden="true">🔍</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filtrer par nom ou référence" />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">Toutes les catégories</option>
            {categories.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Tous les statuts</option>
            <option value="en_ligne">En ligne</option>
            <option value="brouillon">Brouillon</option>
            <option value="rupture">Hors stock</option>
            <option value="archive">Archivé</option>
          </select>
        </div>

        {!loading && !error && <p className="my-products__count">{produits.length} produit{produits.length > 1 ? "s" : ""}</p>}
        {error && <div className="my-products__notice my-products__notice--error">{error}</div>}
        {loading && <div className="my-products__notice">Chargement de vos produits…</div>}

        {!loading && !error && produits.length === 0 && (
          <div className="my-products__empty">
            <span aria-hidden="true">▦</span>
            <h2>{search || category || status ? "Aucun produit trouvé" : "Vous n’avez encore aucun produit"}</h2>
            <p>{search || category || status ? "Modifiez vos filtres pour élargir votre recherche." : "Ajoutez votre premier produit pour commencer à vendre."}</p>
          </div>
        )}

        {!loading && !error && produits.length > 0 && (
          <div className="my-products__content">
            <div className="my-products__table-wrap">
              <table className="product-table">
                <thead><tr><th>Produit</th><th>Statut</th><th>Prix</th><th>Stock</th><th>Ventes</th><th>Actions</th></tr></thead>
                <tbody>
                  {produits.map((produit) => (
                    <tr key={produit.id_produit}>
                      <td><div className="prod-info"><div className="prod-thumb">{produit.image_url ? <img src={produit.image_url} alt="" /> : produit.nom?.slice(0, 1).toUpperCase()}</div><div><div className="prod-name">{produit.nom}</div><div className="prod-cat">{produit.categorie_nom || "Sans catégorie"} · #PRD-{produit.id_produit}</div></div></div></td>
                      <td><span className={`status-chip ${produit.statut}`}>{statusLabel[produit.statut] || produit.statut}</span></td>
                      <td className="price-cell">{Number(produit.prix).toLocaleString("fr-MA")} MAD</td>
                      <td className={`stock-cell ${Number(produit.stock) <= 2 ? "stock-low" : ""}`}>{produit.stock}</td>
                      <td>{produit.ventes}</td>
                      <td><div className="actions-cell"><button className="icon-btn" title="Voir le produit" onClick={() => navigate(`/produit/${produit.id_produit}`)}>👁</button><button className="icon-btn" title="Modifier le produit" onClick={() => navigate(`/publierProduit/${produit.id_produit}`)}>✎</button><button className="icon-btn" title="Soldes" onClick={() => openSoldePanel(produit.id_produit)}>💸</button><button className="icon-btn" title="Promouvoir" onClick={() => openPromoPanel(produit.id_produit)}>✦</button><button className="icon-btn icon-btn--danger" title="Supprimer le produit" onClick={() => deleteProduit(produit.id_produit)} disabled={deletingId === produit.id_produit}>{deletingId === produit.id_produit ? "…" : "🗑"}</button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {actionPanelOpen && (
          <div className="action-modal-overlay" onClick={closeActionPanel}>
            <section className="action-modal-card" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
              <div className="action-panel__header">
                <div>
                  <span className="action-panel__eyebrow">Action produit</span>
                  <h2>{panelAction === 'solde' ? 'Créer un solde' : 'Promouvoir un produit'}</h2>
                  <p>Remplissez les informations pour ce produit sans quitter la page.</p>
                </div>
                <button type="button" className="btn outline" onClick={closeActionPanel}>Fermer</button>
              </div>

              <form onSubmit={panelAction === 'solde' ? handleSoldeSubmit : handlePromoSubmit} className="action-panel__form">
                {panelAction === 'solde' ? (
                  <>
                    <label>Type de réduction
                      <select value={typeReduction} onChange={(e) => setTypeReduction(e.target.value)}>
                        <option value="pourcentage">Pourcentage</option>
                        <option value="montant_fixe">Montant fixe</option>
                      </select>
                    </label>
                    <label>Valeur de réduction
                      <input type="number" step="0.01" value={valeurReduction} onChange={(e) => setValeurReduction(e.target.value)} />
                    </label>
                    <label>Prix promo
                      <input type="number" step="0.01" value={prixPromo} onChange={(e) => setPrixPromo(e.target.value)} />
                    </label>
                    <label>Date début
                      <input type="datetime-local" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
                    </label>
                    <label>Date fin
                      <input type="datetime-local" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
                    </label>
                    {soldeError && <div className="notice error">{soldeError}</div>}
                  </>
                ) : (
                  <>
                      <div className="promo-plans-section">
                      <div className="plan-list-heading">Plans disponibles</div>
                      {plansLoading ? (
                        <div className="plan-loading">Chargement des plans…</div>
                      ) : plansError ? (
                        <div className="plan-error">{plansError}</div>
                      ) : plans.length === 0 ? (
                        <div className="plan-empty">Aucun plan de promotion actif.</div>
                      ) : (
                        <div className="plan-card-list">
                          {plans.map((plan, index) => {
                            const planId = plan.id ?? plan.id_plan ?? index;
                            const isSelected = String(selectedPlanId) === String(planId);
                            return (
                              <button
                                key={planId}
                                type="button"
                                className={`plan-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => setSelectedPlanId(planId)}
                              >
                                <div className="plan-card__title">{plan.nom_plan}</div>
                                <div className="plan-card__info">Prix : {Number(plan.prix).toLocaleString('fr-MA')} MAD</div>
                                <div className="plan-card__info">Durée : {plan.duree_jours} jours</div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <label>Numéro de carte
                      <input type="text" inputMode="numeric" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="1234 5678 9012 3456" />
                    </label>
                    <label>Nom du titulaire
                      <input type="text" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} placeholder="NOM SUR LA CARTE" />
                    </label>
                    <div className="card-row">
                      <label>Expiration
                        <input type="text" value={cardExpiration} onChange={(e) => setCardExpiration(e.target.value)} placeholder="MM/AA" />
                      </label>
                      <label>CVV
                        <input type="text" inputMode="numeric" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="123" />
                      </label>
                    </div>
                    <div className="plan-duration-note">La durée est définie par le plan sélectionné, vous ne pouvez pas modifier la période.</div>
                    {(promoError || factureError) && <div className="notice error">{promoError || factureError}</div>}
                  </>
                )}

                <div className="action-panel__actions">
                  <button type="button" className="btn" onClick={closeActionPanel}>Annuler</button>
                  <button type="submit" className="btn teal" disabled={panelAction === 'solde' ? submittingSolde : promoSubmitting}>
                    {panelAction === 'solde' ? (submittingSolde ? '…' : 'Créer le solde') : (promoSubmitting ? '…' : 'Créer la promotion')}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}

export default MesProduits;
