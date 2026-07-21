import "../../css/Boutique.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from 'react-router-dom';

function Boutique(){
  const navigate = useNavigate();
  const { id } = useParams();
  

  const [modalOpen, setModalOpen] = useState(false);
  const [ModalAvis, setModalAvis] = useState(false);
  const [note, setNote] = useState(5);
const [commentaire, setCommentaire] = useState("");

  const [afficherTousProduits, setAfficherTousProduits] = useState(true);

  const [boutique, setBoutique] = useState(null);
  const [produits, setProduits] = useState([]);
  const [avis, setAvis] = useState([]);
  const [motif, setMotif] = useState("");
  const [description, setDescription] = useState(""); 

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

const handleGetA = async () => {
    try {
      const res = await fetch(`http://localhost:3000/boutiques/${id}/avis`);
      const data = await res.json();
      setAvis(data?.avis ?? []); 
      
    } catch (error) {
      console.error('An error ', error);
    }
  }

  useEffect(() => { handleGetA(); }, [id]); 



const handleAjouterAvis = async () => { 
    const token = localStorage.getItem("token");

if (!token) {
  navigate("/login");
  return;
}
     try {
        const res = await fetch(`http://localhost:3000/boutiques/avis`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id,note, commentaire }),
        });

        const data = await res.json();
        console.log("Avis ajouté:", data);
        setNote(5); // Réinitialiser la note à 5 étoiles
        setCommentaire("");
        handleGetA(); // Rafraîchir la liste des avis après l'ajout

      } catch (error) {
        console.error(error);
      }
}
    




 const SignalerBoutique = async () => {
      try {
        const res = await fetch("http://localhost:3000/boutiques/signale", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id, motif, description}),
          
        });
        console.log("id:", id, "motif:", motif, "description:", description);

      } catch (error) {
        console.error(error);
      }
    };




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
    setModalAvis(false);
  }

  const ouvrirModal = () => {
    
      setModalOpen(true);
      setAfficherTousProduits(false);
      setModalAvis(false);
   
  }
  const ouvrirModalAvis = () => {
    
      setModalAvis(true);
      setAfficherTousProduits(false);
      setModalOpen(false);
   
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
    <div>{new Date(boutique?.date_creation).getFullYear()}
<span>Sur Le Panier</span></div>
  </div>

  <div className="tabs">
    <button className="btn-report" onClick={() => afficherP()} >Produits</button>
    <button className="btn-report" onClick={() => ouvrirModalAvis()} >Avis ({avis.length})</button>
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

  



  <>
  {ModalAvis && (<div className="reviews-section">

    {/* ================= Ajouter un avis ================= */}

    <div className="add-review-card">

        <h3>Laisser votre avis</h3>

        <div className="star-picker">

            {[1,2,3,4,5].map((star)=>(

                <span
                    key={star}
                    className={star<=note ? "active" : ""}
                    onClick={()=>setNote(star)}
                >
                    ★
                </span>

            ))}

        </div>

        <div className="field">

            <label>Votre commentaire</label>

            <textarea
                value={commentaire}
                onChange={(e)=>setCommentaire(e.target.value)}
                placeholder="Partagez votre expérience avec cette boutique..."
            />

        </div>

        <div className="add-review-actions">

            <button
                className="btn teal"
                onClick={handleAjouterAvis}
            >
                Publier l'avis
            </button>

        </div>

    </div>


    {/* ================= Résumé ================= */}

    <div className="reviews-summary">

        <div>

            <div className="score">
                {boutique?.note_moyenne ?? "0.0"}
            </div>

            <div className="score-sub">
                sur 5
            </div>

        </div>

        <div>

            <div className="stars-big">

                {"★".repeat(Math.round(boutique?.note_moyenne || 0))}
                {"☆".repeat(5-Math.round(boutique?.note_moyenne || 0))}

            </div>

            <div className="score-sub">

                {avis.length} avis

            </div>

        </div>

    </div>


    {/* ================= Liste ================= */}

    <div className="reviews-list">

        {
            avis.length===0 ?

            <div className="no-review">

                Aucun avis pour cette boutique.

            </div>

            :

            avis.map((item,index)=>(

                <div
                    className="review"
                    key={index}
                >

                    <div className="avatar">

                        {
                            item.logo_url &&
                            <img
                                src={item.logo_url}
                                alt=""
                            />
                        }

                    </div>

                    <div className="review-content">

                        <div className="review-header">

                            <span className="review-user">

                                {item.prenom} {item.nom}

                            </span>

                            <span className="stars">

                                {"★".repeat(item.note)}
                                {"☆".repeat(5-item.note)}

                            </span>

                        </div>

                        <p>

                            {item.commentaire}

                        </p>

                    </div>

                </div>

            ))
        }

    </div>

</div>) }
  
  
  </>




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

    <label className="report-reason"> <input type="radio" name="reportReason" value="contrefacon"  onChange={(e) => setMotif(e.target.value)}  /> Produits contrefaits ou non conformes</label>
    <label className="report-reason"><input type="radio" name="reportReason" value="arnaque"  onChange={(e) => setMotif(e.target.value)}/> Comportement suspect / arnaque</label>
    <label className="report-reason"><input type="radio" name="reportReason" value="contenu"  onChange={(e) => setMotif(e.target.value)}/> Contenu inapproprié</label>
    <label className="report-reason"><input type="radio" name="reportReason" value="autre"  onChange={(e) => setMotif(e.target.value)}/> Autre raison</label>

    <div className="field" style={{ marginTop: '12px' }}>
      <label>Précisez (facultatif)</label>
      <textarea id="reportDetails" placeholder="Ajoutez des détails…"  value={description} onChange={(e) => setDescription(e.target.value)} style={{ minHeight: '70px' }}></textarea>
    </div>

    <div className="modal-actions">
      <button className="btn outline" id="closeReportBtn" onClick={fermerModal}>
        Annuler
      </button>
      <button className="btn danger-outline" id="submitReportBtn" onClick={() => { SignalerBoutique(); fermerModal(); }}>
        Envoyer le signalement
      </button>
    </div>
      </div>

)}</>

    </>

    );
}

export default Boutique;
