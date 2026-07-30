import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/Publicites.css';

const API_URL = 'http://localhost:3000';

function Publicites() {
  const navigate = useNavigate();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchActivePromotions() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/promotions/active`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data = await res.json();
        setPromotions(data || []);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les promotions actives.');
      } finally {
        setLoading(false);
      }
    }

    fetchActivePromotions();
  }, []);

  return (
    <main className="pub-page">
      <section className="pub-hero">
        <div className="pub-hero__content">
          <span className="pub-eyebrow">Marketing</span>
          <h1>Publicités</h1>
          <p>Boostez la visibilité de vos meilleurs produits avec des campagnes ciblées et suivez leur statut en temps réel.</p>
        </div>
        <button className="btn teal pub-hero__action" onClick={() => navigate('/mes-produits')}>
          + Créer une campagne
        </button>
      </section>

      <section className="pub-overview">
        <div className="pub-stats">
          <div>
            <span className="stat-title">Promotions actives</span>
            <strong>{promotions.length}</strong>
          </div>
          <div>
            <span className="stat-title">Plans disponibles</span>
            <strong>Forfait fixe</strong>
          </div>
        </div>
      </section>

      <section className="pub-table-card">
        <div className="pub-table-header">
          <div>
            <h2>Promotions en cours</h2>
            <p>Suivez vos produits boostés et leur date de fin de plan.</p>
          </div>
          <button className="btn outline" onClick={() => navigate('/mes-produits')}>
            Poster un produit
          </button>
        </div>

        {loading ? (
          <div className="pub-loading">Chargement des promotions…</div>
        ) : error ? (
          <div className="pub-error">{error}</div>
        ) : promotions.length === 0 ? (
          <div className="pub-empty">Aucune promotion active pour le moment.</div>
        ) : (
          <div className="pub-table-wrap">
            <table className="pub-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Plan</th>
                  <th>Montant</th>
                  <th>Jours restants</th>
                  <th>Fin du plan</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo) => {
                  const dateFin = new Date(promo.date_fin);
                  const now = new Date();
                  const joursRestants = Math.max(
                    0,
                    Math.ceil((dateFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
                  );
                  return (
                    <tr key={promo.id_promotion}>
                      <td>{promo.produit_nom || '—'}</td>
                      <td>{promo.nom_plan || promo.plan || 'Standard'}</td>
                      <td>{promo.plan_prix ? `${Number(promo.plan_prix).toLocaleString('fr-MA')} MAD` : '-'}</td>
                      <td>{joursRestants} jour{joursRestants > 1 ? 's' : ''}</td>
                      <td>{dateFin.toLocaleDateString('fr-FR')}</td>
                      <td className={`pub-status pub-status--${String(promo.statut).replace(/\s/g, '-')}`}>
                        {promo.statut}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default Publicites;
