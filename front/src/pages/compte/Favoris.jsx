import "../../css/Favoris.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Favoris() {
  const [info, setInfo] = useState([]);
  const [favoris, setFavoris] = useState(new Set()); // ids des produits en favoris
  const navigate = useNavigate();
  const { id } = useParams();

  const normalizeProducts = (items) => {
    const products = Array.isArray(items)
      ? items
      : items?.produitsVedette ?? [];

    return products.map((item) => ({
      id: item.id_produit,
      nom: item.nom || "",
      prix: item.prix ?? 0,
      boutique: item.boutique_nom || "",
      url: item.url || "",
      type: (item.type || "").toLowerCase(),
    }));
  };

  const handleGetHomeData = async () => {
    try {
      const res = await fetch(`http://localhost:3000/favoris/${id}`);
      if (!res.ok) {
        throw new Error(`Erreur HTTP ${res.status}`);
      }

      const data = await res.json();
      setInfo(data?.produitsVedette ?? []);

      // Comme cette page liste déjà les favoris de l'utilisateur,
      // on initialise le Set avec tous les ids reçus
      const ids = (data?.produitsVedette ?? []).map((p) => p.id_produit);
      setFavoris(new Set(ids));
    } catch (error) {
      console.error("Erreur lors du chargement des favoris :", error);
      setInfo([]);
    }
  };

  useEffect(() => {
    handleGetHomeData();
  }, [id]);

  const toggleFavori = async (produitId) => {
    const estFavori = favoris.has(produitId);

    // Mise à jour optimiste de l'UI
    setFavoris((prev) => {
      const next = new Set(prev);
      if (estFavori) next.delete(produitId);
      else next.add(produitId);
      return next;
    });

    try {
      const res = await fetch(
        `http://localhost:3000/favoris/${id}/${produitId}`,
        { method: estFavori ? "DELETE" : "POST" }
      );

      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      // Si on vient de retirer un favori sur la page Favoris,
      // on peut aussi l'enlever de la liste affichée
      if (estFavori) {
        setInfo((prev) => prev.filter((p) => p.id_produit !== produitId));
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des favoris :", error);
      // rollback en cas d'échec
      setFavoris((prev) => {
        const next = new Set(prev);
        if (estFavori) next.add(produitId);
        else next.delete(produitId);
        return next;
      });
    }
  };

  const produits = normalizeProducts(info);

  return (
    <main className="content-area">
      <section className="cview active" id="page-favoris">
        <div className="topline">
          <div>
            <span className="kicker">Envies</span>
            <h1>Favoris</h1>
          </div>
          <a className="link-sub" onClick={() => navigate("/catalogue")}>
            <label>Voir le catalogue →</label>
          </a>
        </div>

        <div
          className="active-filters"
          id="homeActiveFilters"
          style={{ display: "none" }}
        ></div>

        <div className="grid" id="homeGrid">
          {produits.map((produit) => {
            const estFavori = favoris.has(produit.id);
            return (
              <div
                key={produit.id}
                className="card"
                data-page="produit.html"
                data-name={produit.nom}
                data-cat=""
              >
                <div className="thumb">
                  {produit.type?.startsWith("video") ? (
                    <video
                      src={produit.url}
                      muted
                      loop
                      playsInline
                      onMouseOver={(e) => e.target.play()}
                      onMouseOut={(e) => {
                        e.target.pause();
                        e.target.currentTime = 0;
                      }}
                    />
                  ) : (
                    <img src={produit.url} alt={produit.nom} />
                  )}

                  {produit.type?.startsWith("video") && (
                    <span className="play">▶</span>
                  )}
                </div>

                <div className="card-body">
                  <div className="name">{produit.nom}</div>
                  <div className="shop">{produit.boutique}</div>
                  <div className="price">{produit.prix} MAD</div>

                  <button
                    type="button"
                    className={`fav-btn ${estFavori ? "fav-active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavori(produit.id);
                    }}
                    aria-label={
                      estFavori
                        ? "Retirer des favoris"
                        : "Ajouter aux favoris"
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>

        {produits.length === 0 && (
          <div>
            <h2>Aucun favori pour le moment</h2>
            <p>
              Cliquez sur le cœur d'un produit pour le retrouver ici
              facilement.
            </p>
            <a className="link-sub" onClick={() => navigate("/catalogue")}>
              <label style={{ textAlign: "center" }}>
                Voir le catalogue →
              </label>
            </a>
          </div>
        )}
      </section>
    </main>
  );
}

export default Favoris;