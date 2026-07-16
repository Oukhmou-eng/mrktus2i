
import "../../css/Boutiques.css";
import { useState } from "react";
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'


function Boutiques(){
const [boutiques, setBoutiques] = useState([]);
const [search, setSearch] = useState("");
const[Vtrie , setVtrie] = useState("");





const handleGetBoutiques = async () => {
    try {
      const res = await fetch('http://localhost:3000/boutiques');
      const data = await res.json();
      setBoutiques(data?.boutiques ?? []);
        console.log(data);
   
    } catch (error) {
      console.error('An error ', error);
    }
  }


  useEffect(() => {   handleGetBoutiques(); } , []);



   const handleChange =  async (e) => {
    const value = e.target.value;
    setVtrie(value);


    try {
      const res = await fetch('http://localhost:3000/boutiques/trie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Vtrie:value })
      });
      const data = await res.json();
      setBoutiques(data?.boutiques ?? []);
        console.log(data);

    } catch (error) {
      console.error('An error ', error);
    }

    
  };









   const handleSearch = async () => {
    try {
      const res = await fetch('http://localhost:3000/boutiques/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ search })
      });
      const data = await res.json();
      setBoutiques(data?.boutiques ?? []);
        console.log(data);
   
    } catch (error) {
      console.error('An error ', error);
    }
  }



  useEffect(() => {   handleGetBoutiques(); } , []);


  



  const normalizeBoutiques = (items) => {
  const listeBoutiques = Array.isArray(items)
    ? items
    : items?.boutiques ?? [];

  return listeBoutiques.map((boutique) => ({
    id: boutique.id_boutique,
    nom: boutique.nom || "",
    slug: boutique.slug || "",
    logo: boutique.logo_url || "",
    note: Number(boutique.note_moyenne ?? 0),
    estVerifier: Boolean(boutique.estVerifier),
    nbrProduits: Number(boutique.nbr_produits ?? 0),
  }));
};

return (

<main className="main" id="visitorMain">

<section className="view active" id="boutiques">
      <div className="topline">
        <div><span className="kicker">Boutiques</span><h1>Découvrir les boutiques de la plateforme</h1></div>
      </div>
      <div className="searchbar" style={{ maxWidth: '420px' }}> <input placeholder=" 🔍Rechercher une boutique…"  value={search}
        onChange={(e) => setSearch(e.target.value)}  />
      <button className="btn teal"  onClick={handleSearch}>
        Rechercher
      </button>
      </div>
      
      <div className="sortbar">
        <span style={{ fontSize: '12.5px', color: 'var(--ink-soft)' }}>5 boutiques</span>
        <select value={Vtrie} onChange={handleChange}>
          <option value="">Trier par : Pertinence</option>
          <option value="mieux_notees">Mieux notées</option>
          <option value="plus_produits">Plus de produits</option>
          <option value="nouvelles">Nouvelles boutiques</option>
        </select>
      </div>
      




     <div className="shop-list-grid">
  {normalizeBoutiques(boutiques).map((boutique) => (
    <div
      key={boutique.id}
      className="shop-list-card"
      data-page="boutique.html"
    >
      <div className="shop-list-logo">
        {boutique.logo && (
          <img
            src={boutique.logo}
            alt={boutique.nom}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "14px",
            }}
          />
        )}
      </div>

      <div className="info">
        <div className="name">{boutique.nom}</div>

        <span className="stars">
          ⭐ {boutique.note}
        </span>

        <div className="meta">
          {boutique.nbrProduits} produit{boutique.nbrProduits > 1 ? "s" : ""}
          {boutique.estVerifier ? " · Vendeur vérifié" : ""}
        </div>
      </div>

      <div className="shop-list-actions">
        <button
          className="btn teal btn-sm"
          data-page="boutique.html"
        >
          Voir la boutique
        </button>

        <button className="btn outline btn-sm shop-follow-btn">
          + Suivre
        </button>
      </div>
    </div>
  ))}
</div>

<div className="pagination">
  <button className="nav">← Précédent</button>
  <button className="active">1</button>
  <button className="nav">Suivant →</button>
</div>





     
    </section>

  
    
  </main>
);

}

export default Boutiques
  
