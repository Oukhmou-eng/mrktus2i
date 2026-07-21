import "../../css/Home.css";
import "../../css/Favoris.css";
import { useState } from "react";
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'

function Home() {
const [info, setInfo] = useState([]);
const [favoris, setFavoris] = useState(new Set());
const navigate = useNavigate();

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
      const res = await fetch('http://localhost:3000/home');
      const data = await res.json();
      setInfo(data?.produitsVedette ?? []);
      console.log(data);
    } catch (error) {
      console.error('An error ', error);
    }
  }

useEffect(() => { handleGetHomeData();  }, []);

const toggleFavori = async (produitId) => {


  const token = localStorage.getItem("token");

if (!token) {
  navigate("/login");
  return;
}
  
  const estFavori = favoris.has(produitId);

  setFavoris((prev) => {
    const next = new Set(prev);
    if (estFavori) next.delete(produitId);
    else next.add(produitId);
    return next;
  });

  try {
    const res = await fetch(`http://localhost:3000/favoris/${produitId}`, {
      method: estFavori ? "DELETE" : "POST",
      headers: {
    Authorization: `Bearer ${token}`,
  },
    });

    if (!res.ok) {
      throw new Error(`Erreur HTTP ${res.status}`);
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour des favoris :", error);
    setFavoris((prev) => {
      const next = new Set(prev);
      if (estFavori) next.add(produitId);
      else next.delete(produitId);
      return next;
    });
  }
};

return (
 <main className="main" id="visitorMain">

<section className="view active" id="accueil">
      <div className="section-head">
        <h2>Produits en vedette test</h2>
        <a
  className="link-sub"
  onClick={() => navigate("/catalogue")}
>
  <label>Voir le catalogue →</label> 
</a>
        
      </div>
      <div className="active-filters" id="homeActiveFilters" style={{ display: "none" }}></div>
      <div className="grid" id="homeGrid">
  {normalizeProducts(info).map((produit) => {
    const estFavori = favoris.has(produit.id);
    return (
    <div
      key={produit.id}
      className="card"
      data-page="produit.html"
      data-name={produit.nom}
      data-cat=""
      onClick={() => navigate(`/produit/${produit.id}`)}
      
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
          <img
            src={produit.url}
            alt={produit.nom}
          />
        )}

        {produit.type?.startsWith("video") && (
          <span className="play">▶</span>
        )}
      </div>

      <div className="card-body">
        <button
          type="button"
          className={`fav-btn ${estFavori ? "fav-active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleFavori(produit.id);
          }}
          aria-label={estFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
        />
        <div className="name">{produit.nom}</div>
        <div className="shop">{produit.boutique}</div>
        <div className="price">{produit.prix} MAD</div>
      </div>
    </div>
    );
  })}
</div>
      
    </section>

   
  </main>
);


}

export default Home ;




