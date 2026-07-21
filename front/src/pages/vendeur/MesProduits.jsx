import "../../css/MesProduits.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function MesProduits() {
  const [info, setInfo] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const handleGetMesProduits = async () => {
    if (!id) {
      setError("Vendeur introuvable.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`http://localhost:3000/produits/${id}/mes-produits`);
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
  }, [id]);

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
          <button className="btn teal" onClick={() => navigate("/publier-produit")}>+ Ajouter un produit</button>
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
                    <td><div className="actions-cell"><button className="icon-btn" title="Voir le produit" onClick={() => navigate(`/produit/${produit.id_produit}`)}>👁</button><button className="icon-btn icon-btn--danger" title="Supprimer le produit" onClick={() => deleteProduit(produit.id_produit)} disabled={deletingId === produit.id_produit}>{deletingId === produit.id_produit ? "…" : "🗑"}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default MesProduits;
