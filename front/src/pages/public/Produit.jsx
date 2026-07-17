import "../../css/Boutique.css";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";


const TABS = [
  { id: "description", label: "Description" },
  { id: "avis", label: "Avis clients" },
  { id: "livraison", label: "Livraison" },
];

function Produit() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [media, setMedia] = useState([]);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const [reviews, setReviews] = useState([]);
  const [note, setNote] = useState(5);
  const [commentaire, setCommentaire] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [similarBy, setSimilarBy] = useState("categorie");
  const [similarProducts, setSimilarProducts] = useState([]);










  // TODO: confirmer la route réelle côté backend (ex: GET /produits/:id)
const fetchProduct = async () => {
  try {
    const res = await fetch(`http://localhost:3000/produits/${id}`);
    const data = await res.json();

    // Adapte les champs SQL au format attendu par le composant.
    // TODO: ajuster les clés (data.nom, data.prix, etc.) selon la vraie
    // forme de la réponse renvoyée par votre service.
    setProduct({
      name: data?.nom,
      price: data?.prix,
      description: data?.description,
      deliveryInfo: data?.livraison_info,
      shopName: data?.boutique_nom,
      shopId: data?.id_boutique,
      categoryId: data?.id_categorie,
    });

    // TODO: confirmer que le backend renvoie bien un tableau de médias
    // (ex: data.medias = [{ type: 'image'|'video', url }]).
    const mediaList = (data?.medias ?? []).map((m) => ({
      type: m.type,
      url: m.url,
    }));
    setMedia(mediaList);
  } catch (error) {
    console.error("An error ", error);
  }
};










  // TODO: récupérer les avis clients du produit (ex: GET /produits/:id/avis)
  // Doit alimenter setReviews([...]).
  



const fetchReviews = async () => {
    try {
      const res = await fetch(`http://localhost:3000/produits/${id}/avis`);  
      const data = await res.json();
      



       const avis = (data?.avis ?? []).map((m) => ({
      id :m.id_avis,
      authorName: m.nom + m.prenom,
      rating: m.note,
      comment:m.commentaire,
      avatarUrl:m.logo_url,
    }));
    setReviews(avis);
      
    } catch (error) {
      console.error('An error ', error);
    }
  }








  // TODO: récupérer les produits similaires selon `similarBy`
  // ("categorie" => même id_categorie, "boutique" => même id_boutique).
  // Doit alimenter setSimilarProducts([...]).
  
  const fetchSimilarProducts = async () => {
    if (!product?.shopId || !product?.categoryId) {
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/produits/similaires?shopId=${product.shopId}&id_categorie=${product.categoryId}`
      );

      const data = await res.json();
      const info = (data?.produitsVedette ?? []).map((m) => ({
        id: m.id_produit,
        name: m.nom,
        shop: m.boutique_nom,
        price: m.prix,
        mediaType: m.type,
        mediaUrl: m.url,
      }));
      setSimilarProducts(info);

      console.log(data);
    } catch (error) {
      console.error("An error", error);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    fetchSimilarProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, similarBy]);

  const handleAddToCart = () => {
    
  };

  const handleSubmitReview = async () => {
    if (!commentaire.trim()) {
      return;
    }

    setIsSubmittingReview(true);

    try {
      const res = await fetch("http://localhost:3000/avis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type_cible: "produit",
          id_cible: Number(id),
          note,
          commentaire: commentaire.trim(),
          
          id_user: 1,
        }),
        
      });
           
      if (!res.ok) {
        throw new Error("Impossible d'envoyer l'avis");
          console.log('ok1');
      }

      setNote(5);
      setCommentaire("");
      await fetchReviews();
      setActiveTab("avis");
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'avis", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // TODO: implémenter le contact vendeur (ouvrir un chat, une modale, etc.)
  const handleContactSeller = () => {
    // TODO
  };

  const handleGoToShop = () => {
    if (product?.shopId) {
      navigate(`/boutique/${product.shopId}`);
    }
  };

  const handleSimilarProductClick = (productId) => {
    navigate(`/produit/${productId}`);
  };

  const handleSeeMoreProducts = () => {
    navigate("/catalogue");
  };

  const selectedMedia = media[selectedMediaIndex];

  /* =========================================================
     Rendu
     ========================================================= */

  return (
    <main className="main" id="visitorMain">
      <section className="view active" id="fiche">
        <div className="fiche">
          {/* ---------- Galerie ---------- */}
          <div className="fiche-gallery">
            <div className="fiche-video">
              {selectedMedia?.type === "video" && selectedMedia?.url ? (
                <video
                  key={selectedMedia.url}
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : selectedMedia?.type === "image" && selectedMedia?.url ? (
                <img
                  src={selectedMedia.url}
                  alt={product?.name ?? "Produit"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div className="play-big">▶</div>
              )}
            </div>

            <div className="fiche-thumbs">
              {media.map((item, index) => (
                <div
                  key={`${item.type}-${item.url}-${index}`}
                  className={`th${item.type === "video" ? " video-th" : ""}${
                    index === selectedMediaIndex ? " active" : ""
                  }`}
                  onClick={() => setSelectedMediaIndex(index)}
                  style={
                    item.type === "image"
                      ? {
                          backgroundImage: `url(${item.url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : undefined
                  }
                >
                  {item.type === "video" && "▶"}
                </div>
              ))}
            </div>
          </div>

          {/* ---------- Infos produit ---------- */}
          <div className="fiche-info">
            <div className="fiche-shop">
              {product?.shopName}
              {" · "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoToShop();
                }}
                style={{ color: "inherit" }}
              >
                voir la boutique
              </a>
            </div>
            <h1>{product?.name}</h1>
            <div className="fiche-price">
              {product?.price != null ? `${product.price} MAD` : ""}
            </div>
            <p className="fiche-desc">{product?.description}</p>
            <div className="fiche-actions">
              <button className="btn teal" onClick={handleAddToCart}>
                Ajouter au panier
              </button>
              <button className="btn outline" onClick={handleContactSeller}>
                Contacter le vendeur
              </button>
            </div>
          </div>
        </div>

        {/* ---------- Onglets ---------- */}
        <div className="tabs">
          {TABS.map((tab) => (
            <div
              key={tab.id}
              className={`tab${activeTab === tab.id ? " active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.id === "avis" && ` (${reviews.length})`}
            </div>
          ))}
        </div>

        {/* ---------- Contenu de l'onglet actif ---------- */}
        {activeTab === "description" && (
          <p className="fiche-desc">{product?.description}</p>
        )}

        {activeTab === "avis" && (
          <>
            <div className="add-review-card open">
              <h3>Laisser votre avis</h3>
              <div className="star-picker">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= note ? "active" : ""}
                    onClick={() => setNote(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <div className="field">
                <textarea
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Partagez votre expérience avec ce produit..."
                  rows={4}
                />
              </div>
              <div className="add-review-actions">
                <button
                  className="btn teal"
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview || !commentaire.trim()}
                >
                  {isSubmittingReview ? "Envoi..." : "Ajouter un avis"}
                </button>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="no-review">Aucun avis pour ce produit.</div>
            ) : (
              reviews.map((review) => (
                <div className="review" key={review.id}>
                  <div
                    className="avatar"
                    style={
                      review.avatarUrl
                        ? {
                            backgroundImage: `url(${review.avatarUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />
                  <div>
                    <div className="stars">
                      {"★".repeat(review.rating ?? 0)}
                      {"☆".repeat(5 - (review.rating ?? 0))}
                    </div>
                    <div className="name">{review.authorName}</div>
                    <p>{review.comment}</p>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "livraison" && (
          <p className="fiche-desc">{product?.deliveryInfo}</p>
        )}

        {/* ---------- Produits similaires ---------- */}
        <div className="section-head" style={{ marginTop: "30px" }}>
          <h2>Produits similaires</h2>
          <a
            href="#"
            className="link-sub"
            onClick={(e) => {
              e.preventDefault();
              handleSeeMoreProducts();
            }}
          >
            Voir plus
          </a>
        </div>

        <div className="grid">
          {similarProducts.map((item) => (
            <div
              className="card"
              key={item.id}
              onClick={() => handleSimilarProductClick(item.id)}
            >
              <div
                className="thumb"
                style={
                  item.mediaType === "image" && item.mediaUrl
                    ? {
                        backgroundImage: `url(${item.mediaUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                {item.mediaType === "video" && item.mediaUrl && (
                  <video
                    src={item.mediaUrl}
                    muted
                    loop
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
                <span className="play">▶</span>
              </div>
              <div className="card-body">
                <div className="name">{item.name}</div>
                <div className="shop">{item.shop}</div>
                <div className="price">{item.price} MAD</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Produit;
