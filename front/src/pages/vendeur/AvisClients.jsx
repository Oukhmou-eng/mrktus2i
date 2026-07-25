import "../../css/AvisClients.css";
import { useEffect, useState } from "react";


const token = localStorage.getItem('token');
const id_boutique = localStorage.getItem('id_boutique');

function AvisClients() {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [openReplyId, setOpenReplyId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({}); // { [reviewId]: string }
  const [submittingId, setSubmittingId] = useState(null);

  /* =========================================================
     Chargement des données au montage
     ========================================================= */

  useEffect(() => {
    fetchReviews();
  }, []);

  const computeSummary = (avis) => {
    if (!avis?.length) return null;
    const total = avis.length;
    const somme = avis.reduce((sum, item) => sum + Number(item.note || 0), 0);
    const moyenne = Number((somme / total).toFixed(1));
    const repartition = [5, 4, 3, 2, 1].map((note) => {
      const count = avis.filter((item) => Number(item.note) === note).length;
      return {
        note,
        pourcentage: total ? Math.round((count / total) * 100) : 0,
      };
    });
    return { moyenne, total, repartition };
  };

  const fetchReviews = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      if (!token || !id_boutique) {
        setLoadError('Vous devez être connecté pour voir les avis.');
        setReviews([]);
        return;
      }

      const res = await fetch(`http://localhost:3000/boutiques/${id_boutique}/avis`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const data = await res.json();
      const avis = data?.avis ?? [];
      setReviews(avis);
      setSummary(computeSummary(avis));
    } catch (error) {
      console.error('Erreur lors du chargement des avis :', error);
      setLoadError('Impossible de charger les avis pour le moment.');
      setReviews([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  /* =========================================================
     Réponse du vendeur à un avis
     ========================================================= */

  const handleToggleReply = (reviewId) => {
    setOpenReplyId((current) => (current === reviewId ? null : reviewId));
  };

  const handleChangeReplyDraft = (reviewId, value) => {
    setReplyDrafts((drafts) => ({ ...drafts, [reviewId]: value }));
  };

  const handleSubmitReply = async (reviewId) => {
    const texte = (replyDrafts[reviewId] || '').trim();
    if (!texte) return;

    setSubmittingId(reviewId);
    try {
      if (!token || !id_boutique) {
        throw new Error('Vous devez être connecté pour répondre aux avis.');
      }

      const response = await fetch(`http://localhost:3000/boutiques/${id_boutique}/avis/${reviewId}/reponse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reponse: texte }),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.message || `Erreur HTTP ${response.status}`);
      }

      const result = await response.json();
      setReviews((items) =>
        items.map((item) =>
          item.id_avis === reviewId ? { ...item, reponse: result.reponse ?? texte } : item,
        ),
      );
      setOpenReplyId(null);
      setReplyDrafts((drafts) => {
        const next = { ...drafts };
        delete next[reviewId];
        return next;
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse :', error);
      setLoadError(error.message || "Impossible d'envoyer la réponse.");
    } finally {
      setSubmittingId(null);
    }
  };

  /* =========================================================
     Rendu
     ========================================================= */

  if (isLoading) {
    return (
      <main className="avis-page">
        <p className="avis-loading">Chargement des avis…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="avis-page">
        <div className="avis-error">
          <p>{loadError}</p>
          <button className="avis-retry-btn" onClick={fetchReviews}>
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="avis-page">
      <div className="avis-topline">
        <div>
          <span className="avis-kicker">Réputation</span>
          <h1>Avis clients</h1>
        </div>
      </div>

      {summary && (
        <div className="avis-summary">
          <div className="avis-score">
            <div className="avis-score-num">{summary.moyenne}</div>
            <div className="avis-stars-lg" aria-label={`${summary.moyenne} sur 5`}>
              {renderStars(summary.moyenne)}
            </div>
            <div className="avis-score-total">Basé sur {summary.total} avis</div>
          </div>

          <div className="avis-bars">
            {(summary.repartition || []).map((row) => (
              <div className="avis-bar-row" key={row.note}>
                <span>{row.note} étoile{row.note > 1 ? "s" : ""}</span>
                <div className="avis-bar-bg">
                  <div className="avis-bar-fill" style={{ width: `${row.pourcentage}%` }}></div>
                </div>
                <span>{row.pourcentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="avis-empty">
          <p>Aucun avis pour le moment.</p>
        </div>
      ) : (
        reviews.map((review) => (
          <div className="avis-card" key={review.id_avis}>
            <div className="avis-card-head">
              <div className="avis-user">
                <div className="avis-ava" aria-hidden="true">
                  {review.client_initiales || `${review.client_nom?.charAt(0) || ''}${review.client_prenom?.charAt(0) || ''}`}
                </div>
                <div>
                  <div className="avis-user-name">{review.client_nom}</div>
                  <div className="avis-stars-sm" aria-label={`${review.note} sur 5`}>
                    {renderStars(review.note)}
                  </div>
                </div>
              </div>
              <time className="avis-date" dateTime={review.date_creation}>
                {formatRelativeDate(review.date_creation)}
              </time>
            </div>

            <div className="avis-body">{review.commentaire}</div>
            {review.produit_nom ? (
              <div className="avis-product-tag">Produit : {review.produit_nom}</div>
            ) : null}

            <div className="avis-reply">
              {review.reponse ? (
                <>
                  <div className="avis-reply-existing-label">Votre réponse :</div>
                  <div className="avis-reply-existing-text">{review.reponse}</div>
                </>
              ) : openReplyId === review.id_avis ? (
                <div className="avis-reply-form">
                  <textarea
                    className="avis-reply-textarea"
                    rows={3}
                    placeholder="Écrivez votre réponse publique à ce client…"
                    value={replyDrafts[review.id_avis] || ""}
                    onChange={(e) => handleChangeReplyDraft(review.id_avis, e.target.value)}
                  />
                  <div className="avis-reply-actions">
                    <button
                      className="avis-reply-cancel"
                      onClick={() => handleToggleReply(review.id_avis)}
                    >
                      Annuler
                    </button>
                    <button
                      className="avis-reply-submit"
                      onClick={() => handleSubmitReply(review.id_avis)}
                      disabled={submittingId === review.id_avis || !(replyDrafts[review.id_avis] || "").trim()}
                    >
                      {submittingId === review.id_avis ? "Envoi…" : "Envoyer la réponse"}
                    </button>
                  </div>
                </div>
              ) : (
                <button className="avis-reply-btn" onClick={() => handleToggleReply(review.id_avis)}>
                  Répondre à cet avis
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </main>
  );
}

/* =========================================================
   Aides d'affichage
   ========================================================= */

function renderStars(note) {
  const rounded = Math.round(note);
  return "★★★★★".slice(0, rounded) + "☆☆☆☆☆".slice(0, 5 - rounded);
}

function formatRelativeDate(isoDate) {
  if (!isoDate) return "";
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Aujourd'hui";
  if (diffDays === 1) return "Il y a 1 jour";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "Il y a 1 semaine";
  if (diffWeeks < 5) return `Il y a ${diffWeeks} semaines`;
  const diffMonths = Math.floor(diffDays / 30);
  return diffMonths <= 1 ? "Il y a 1 mois" : `Il y a ${diffMonths} mois`;
}

export default AvisClients;