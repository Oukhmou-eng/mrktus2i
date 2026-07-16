import "../../css/Boutique.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from 'react-router-dom';

function Boutique(){
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [modalOpen, setModalOpen] = useState(false);
  const [afficherTousProduits, setAfficherTousProduits] = useState(true);

  const [boutique, setBoutique] = useState(null);
  const [produits, setProduits] = useState([]);

  useEffect(() => {
    const chargerBoutique = async () => {
      try {
        const res = await fetch("http://localhost:3000/boutiques/detail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        const data = await res.json();

        // Informations de la boutique
        setBoutique(data.boutique);

        // Liste des produits
        setProduits(data.produits);

      } catch (error) {
        console.error(error);
      }
    };

    chargerBoutique();
  }, [id]);

  // URLs banniere/logo venant des données de la boutique renvoyées par le backend
  const bannerUrl = boutique?.banniere_url || "";
  const logoUrl = boutique?.logo_url || "";

  const [bannerExists, setBannerExists] = useState(false);
  const [logoExists, setLogoExists] = useState(false);

  useEffect(() => {
    if (bannerUrl) {
      const img = new Image();
      img.onload = () => setBannerExists(true);
      img.onerror = () => setBannerExists(false);
      img.src = bannerUrl;
    } else {
      setBannerExists(false);
    }
  }, [bannerUrl]);

  useEffect(() => {
    if (logoUrl) {
      const img = new Image();
      img.onload = () => setLogoExists(true);
      img.onerror = () => setLogoExists(false);
      img.src = logoUrl;
    } else {
      setLogoExists(false);
    }
  }, [logoUrl]);

  const afficherP = () => {
    setAfficherTousProduits(true);
    setModalOpen(false);
  }

  const ouvrirModal = () => {
    if (!modalOpen) {
      setModalOpen(true);
      setAfficherTousProduits(false);
    } else {
      setModalOpen(false);
      setAfficherTousProduits(true);
    }
  }

  const fermerModal = () => { setModalOpen(false); setAfficherTousProduits(true); }

  // Affichage des produits : 6 par défaut, puis tous au clic sur "Afficher tous les produits"
  const NB_PRODUITS_DEFAUT = 6;
  const [nombreProduitsAffiches, setNombreProduitsAffiches] = useState(NB_PRODUITS_DEFAUT);
  const produitsVisibles = produits.slice(0, nombreProduitsAffiches);
  const afficherTousLesProduits = () => setNombreProduitsAffiches(produits.length);

  return (
    <>
    <main className="main">

  <div
    className={`shop-banner ${bannerExists ? '' : 'no-banner'}`}
    id="shopBanner"
    style={bannerExists ? { backgroundImage: `url(${bannerUrl})` } : undefined}
  ></div>
  <div className="shop-head">
    <div
      className={`shop-logo ${logoExists ? '' : 'no-logo'}`}
      id="shopLogo"
      style={logoExists ? { backgroundImage: `url(${logoUrl})` } : undefined}
    ></div>
    <div className="shop-meta">
      <h1>{boutique?.nom}</h1>
      <div className="stars">
        ★★★★★ {boutique?.note_moyenne}{boutique?.estVerifier ? ' · Vendeur vérifié' : ''}
      </div>
    </div>
    <div className="shop-head-actions">
      <button className="btn-follow" >+ Suivre</button>
    </div>
  </div>

  <div className="shop-stats">
    <div>{produits.length}<span>Produits</span></div>
    <div>2.4k<span>Ventes</span></div>
    <div>98%<span>Satisfaction</span></div>
    <div>2022<span>Sur Le Panier</span></div>
  </div>

  <div className="tabs">
    <button className="btn-report" onClick={() => afficherP()} >Produits</button>
    <button className="btn-report" onClick={() => ouvrirModal()} >Avis (128)</button>
    <button className="btn-report" onClick={() => ouvrirModal()} >⚑ Signaler</button>
  </div>

<>
  {afficherTousProduits && (

  <div id="shop-pane-produits">
    <div className="grid" >
      {produitsVisibles.map((produit) => (
        <div className="card" key={produit.id_produit}>
          <div
            className="thumb"
            style={produit.url && produit.type === 'image' ? { backgroundImage: `url(${produit.url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            <span className="play">▶</span>
          </div>
          <div className="card-body">
            <div className="name">{produit.nom}</div>
            <div className="shop">{boutique?.nom}</div>
            <div className="price">{produit.prix} MAD</div>
          </div>
        </div>
      ))}
    </div>

    {nombreProduitsAffiches < produits.length && (
      <div className="show-more-wrap">
        <button className="btn outline" onClick={afficherTousLesProduits}>
          Afficher tous les produits ({produits.length})
        </button>
      </div>
    )}
  </div>
   )} </>

  <div  style={{ display: 'none' }}>

    <div className="reviews-summary">
      <div>
        <div className="score">4.8</div>
        <div className="score-sub">sur 5</div>
      </div>
      <div>
        <div className="stars-big">★★★★★</div>
        <div className="score-sub">128 avis</div>
      </div>
      <div style={{ marginLeft: 'auto' }}>
        <button className="btn teal">✎ Laisser un avis</button>
      </div>
    </div>

    <div className="add-review-card" >
      <h3>Votre avis sur SoundStore</h3>
      <div className="star-picker" >
        <span data-star="1">★</span>
        <span data-star="2">★</span>
        <span data-star="3">★</span>
        <span data-star="4">★</span>
        <span data-star="5">★</span>
      </div>
      <div className="field">
        <label>Votre commentaire</label>
        <textarea  placeholder="Décrivez votre expérience avec cette boutique…"></textarea>
      </div>
      <div className="add-review-actions">
        <button className="btn teal" id="submitReviewBtn">Publier l'avis</button>
        <button className="btn outline" id="cancelReviewBtn">Annuler</button>
      </div>
    </div>

    <div id="reviewsList">
      <div className="review">
        <div className="avatar"></div>
        <div>
          <div className="stars">★★★★★<span className="date">Yasmine B. · il y a 3 jours</span></div>
          <p>Très bon son pour le prix, la batterie tient vraiment 12h comme annoncé.</p>
        </div>
      </div>
      <div className="review">
        <div className="avatar"></div>
        <div>
          <div className="stars">★★★★☆<span className="date">Omar T. · il y a 1 semaine</span></div>
          <p>Livraison rapide, produit conforme à la vidéo de présentation.</p>
        </div>
      </div>
      <div className="review">
        <div className="avatar"></div>
        <div>
          <div className="stars">★★★★★<span className="date">Sara K. · il y a 2 semaines</span></div>
          <p>Vendeur réactif, il a répondu à mes questions avant l'achat.</p>
        </div>
      </div>
    </div>
  </div>

</main>

<> {modalOpen && (

<div className="modal-card">
    <h3>Signaler cette boutique</h3>
    <div style={{ textAlign: "right" }}>
  <button onClick={fermerModal}>
    <i className="fas fa-times"></i>X
  </button>
</div>
    <p className="hint">Merci de nous indiquer la raison. Notre équipe examinera votre signalement rapidement.</p>

    <label className="report-reason">
        <input type="radio" name="reportReason" value="contrefacon"/>
         Produits contrefaits ou non conformes</label>
    <label className="report-reason"><input type="radio" name="reportReason" value="arnaque"/> Comportement suspect / arnaque</label>
    <label className="report-reason"><input type="radio" name="reportReason" value="contenu"/> Contenu inapproprié</label>
    <label className="report-reason"><input type="radio" name="reportReason" value="autre"/> Autre raison</label>

    <div className="field" style={{ marginTop: '12px' }}>
      <label>Précisez (facultatif)</label>
      <textarea id="reportDetails" placeholder="Ajoutez des détails…" style={{ minHeight: '70px' }}></textarea>
    </div>

    <div className="modal-actions">
      <button className="btn outline" id="closeReportBtn" onClick={fermerModal}>
        Annuler
      </button>
      <button className="btn danger-outline" id="submitReportBtn">
        Envoyer le signalement
      </button>
    </div>
      </div>

)}</>

    </>

    );
}

export default Boutique;