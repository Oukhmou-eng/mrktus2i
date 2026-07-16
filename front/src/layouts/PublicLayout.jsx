import "../css/PublicLayout.css";
import { useState } from "react";
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'


function PublicLayout() {
  const [search, setSearch] = useState("");
   const [showList, setShowList] = useState(false);
    const [categories, setCategories] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [btnq, setBtnq] = useState(false);
  const handleClick = () => {
    if(btnq) {
    setBtnq(false);
  }
  else{
    setBtnq(true);
  } 
}


const handleShowList = () => {
    setShowList(!showList);
  };

  const normalizeCategories = (items) => {
    if (!Array.isArray(items)) return [];

    return items
      .map((item) => {
        if (typeof item === "string") return item.trim();
        if (item && typeof item === "object") {
          return item.nom || item.name || item.label || "";
        }
        return "";
      })
      .filter(Boolean);
  };

const handleCat = async () => {
    try {
      const res = await fetch('http://localhost:3000/categories');
      const data = await res.json();
      setCategories(normalizeCategories(data));
      console.log(data);
    } catch (error) {
      console.error('An error ', error);
    }
  }
  const handleForgotPassword = () => {
    console.log({
      email,
    });
  }

useEffect(() => {  handleCat(); }, []);


  return (
    <nav className="rail">
      <div className="rail-top">
        <button className="rail-brand" data-page="index.html">
          <span className="dot"></span>
          Le Panier
        </button>

        <div className="cats-dropdown-wrap">
          <button className="rail-cats-btn" onClick={handleShowList}>
            <span className="hamburger">☰</span> Catégories
          </button>
          <div className={`cats-dropdown ${showList ? "open" : ""}`}>
            {normalizeCategories(categories).map((category, index) => (
              <button key={`${category}-${index}`}>
                {category}
              </button>
            ))}
          </div>
        </div> 

        <div className="rail-search">

         <input
        type="text"
        placeholder="Rechercher un produit, une boutique…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <button onClick={() => console.log(search)}>
        🔍
      </button>



          
        </div>

        <div className="rail-right">
          <button className="rail-link" data-page="connexion.html" id="railLoginBtn"  
           onClick={() => {if (!btnq) {navigate('/login'); } else {  navigate('/registre'); };handleClick();} }>
               {btnq ? 'Sign In' : 'Sign Up'}
          </button>

          <div
            className="header-user-wrap"
            id="headerUserMenu"
            style={{ display: "none" }}
          >
            <button className="header-user-btn" id="headerUserBtn">
              <span className="hu-ava">SE</span>
              <span className="hu-name">Sara</span>
            </button>

            <div className="header-user-dropdown" id="headerUserDropdown">
              <button
                data-cgoto-header="soon"
                data-page="compte/parametres.html"
              >
                👤 Mon profil / Paramètres
              </button>

              <div className="hu-sep"></div>

              <button id="headerLogoutBtn" className="hu-danger">
                ⏻ Se déconnecter
              </button>
            </div>
          </div>

          <button
            className="rail-icon-btn"
            title="Favoris"
            data-page="compte/favoris.html"
          >
            ♡
          </button>

          <button
            className="rail-icon-btn"
            data-page="panier.html"
            title="Panier"
          >
            🛒
          </button>
        </div>
      </div>

      <div className="rail-cats">
        <div className="rail-cats-list">
          <button onClick={() => {navigate('/home');} }>Accueil</button>
          <button data-page="catalogue.html">Promotion</button>
          <button data-page="catalogue.html">Catalogue</button>
          <button onClick={() => {navigate('/boutiques');} }>Boutique</button>
          <button data-page="support.html">Aide</button>
        </div>
      </div>
    </nav>
  );
}

export default PublicLayout;