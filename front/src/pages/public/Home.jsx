import "../../css/Home.css";
import "../../css/Favoris.css";
import "../../css/Dialogue.css";
import { useState } from "react";
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'

function Home() {
const [info, setInfo] = useState([]);
const [favoris, setFavoris] = useState(new Set());
const navigate = useNavigate();
const [showFavDialog, setShowFavDialog] = useState(false);

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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3000/home', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setInfo(data?.produitsVedette ?? []);
      setFavoris(new Set(data?.favoris ?? []));
      console.log(data);
    } catch (error) {
      console.error('An error ', error);
    }
  }

useEffect(() => { handleGetHomeData();  }, []);



const toggleFavori = async (produitId) => {


  const token = localStorage.getItem("token");

if (!token) {
  setShowFavDialog(true); 
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
 <FavDialog
          isOpen={showFavDialog}
          onConfirm={() => {
            setShowFavDialog(false);
            navigate('/login');
          }}
          onCancel={() => setShowFavDialog(false)}
      />
      
    </section>

   
  </main>
);


}

export default Home ;





const FavDialog = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
        <h3>Connexion requise</h3>
        <p>Vous devez être connecté pour ajouter ce produit au favoris . Voulez-vous vous connecter ?</p>
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




