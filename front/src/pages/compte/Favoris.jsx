import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/Favoris.css";

function Favoris() {
  const [user, setUser] = useState(null);
  const [favoris, setFavoris] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // TODO: récupérer la session utilisateur (contexte Auth, cookie, store, etc.)
    // TODO: récupérer la liste des favoris (appel API / service)
    //
    // Exemple de squelette attendu :
    // async function init() {
    //   setIsLoading(true);
    //   setLoadError(false);
    //   try {
    //     const sessionUser = ...;
    //     setUser(sessionUser);
    //     const data = ...;
    //     setFavoris(data);
    //   } catch (err) {
    //     setLoadError(true);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // }
    // init();
  }, []);

  const handleProductClick = (id) => {
    // TODO: navigation vers la fiche produit
  };

  const handleRemoveFavori = (e, id) => {
    e.stopPropagation();
    // TODO: appel API de suppression du favori
    // puis mise à jour locale, ex :
    // setFavoris((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    
    <main className="content-area">
      <section className="cview active" id="page-favoris">
        <div className="topline"><div><span class="kicker">Envies</span><h1>Favoris</h1></div></div>

        <div className="grid" id="favGrid">
          <div className="card fav-card"><button className="fav-heart" title="Retirer des favoris">♥</button><div className="thumb"></div><div class="card-body"><div class="name">Enceinte portable Nova</div><div class="shop">SoundStore</div><div class="price">349 MAD</div></div></div>
          <div className="card fav-card"><button className="fav-heart" title="Retirer des favoris">♥</button><div className="thumb"></div><div class="card-body"><div class="name">Sac en cuir tressé</div><div class="shop">Atelier Nour</div><div class="price">590 MAD</div></div></div>
          <div className="card fav-card"><button className="fav-heart" title="Retirer des favoris">♥</button><div className="thumb"></div><div class="card-body"><div class="name">Théière artisanale</div><div class="shop">Souk Béni Mellal</div><div class="price">180 MAD</div></div></div>
          <div className="card fav-card"><button className="fav-heart" title="Retirer des favoris">♥</button><div className="thumb"></div><div class="card-body"><div class="name">Lampe céramique Aya</div><div class="shop">Maison Rif</div><div class="price">220 MAD</div></div></div>
          <div className="card fav-card"><button className="fav-heart" title="Retirer des favoris">♥</button><div className="thumb"></div><div class="card-body"><div class="name">Coffret soins visage</div><div class="shop">Belle Amira</div><div class="price">260 MAD</div></div></div>
          <div className="card fav-card"><button className="fav-heart" title="Retirer des favoris">♥</button><div className="thumb"></div><div class="card-body"><div class="name">Miel de thym bio</div><div class="shop">Rucher Atlas</div><div class="price">140 MAD</div></div></div>
        </div>
        <div className="fav-empty" id="favEmpty">
          <div className="ic">♡</div>
          <h2>Aucun favori pour le moment</h2>
          <p>Cliquez sur le cœur d'un produit pour le retrouver ici facilement.</p>
        </div>

      </section>
    </main>
  );
}

export default Favoris;