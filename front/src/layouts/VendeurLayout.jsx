import '../css/VendeurSidebar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState,  } from 'react';

function VendeurSidebar() {
  const navigate = useNavigate();
  const [boutique, setBoutique] = useState(null);
  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const id_b =  localStorage.getItem('id_boutique');

  useEffect(() => {
    setNomUtilisateur(localStorage.getItem('nom') || '');
  }, []);

  useEffect(() => {
    const fetchBoutiqueActive = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/boutiques/mes-boutiques/${id_b}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data = await res.json();
        const premiereBoutique = data?.boutiques?.[0] ?? null;
        setBoutique(premiereBoutique);
      } catch (error) {
        console.error('Erreur lors du chargement de la boutique :', error);
        setBoutique(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBoutiqueActive();
  }, [token]);








  const retourVersAcheteur = () => {
    navigate('/home');
  };

  const deconnecter = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nom');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem("id_boutique");
    sessionStorage.clear();
    navigate('/home', { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="shop-card">
        <div
          className="logo"
          style={boutique?.logo_url ? { backgroundImage: `url(${boutique.logo_url})` } : undefined}
        ></div>
        <div className="info">
          <div className="name">
            {loading ? '...' : boutique?.nom ?? 'Ma boutique'}
          </div>
          {boutique?.estVerifier && <span className="badge">✓ Vendeur</span>}
        </div>
      </div>

      <div className="mode-switch vendeur" id="modeSwitch">
        <div className="thumb"></div>
        <button data-mode="" onClick={retourVersAcheteur}>
          {nomUtilisateur || 'Mon compte'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          className={({ isActive }) => `snav-item ${isActive ? 'active' : ''}`}
          to="/dashboard-vendeur"
        >
          <span className="ic">🏠</span>Dashboard
        </NavLink>
        <NavLink
          className={({ isActive }) => `snav-item ${isActive ? 'active' : ''}`}
          to="/publierProduit"
        >
          <span className="ic">➕</span>Publier un produit
        </NavLink>
        <NavLink
          className={({ isActive }) => `snav-item ${isActive ? 'active' : ''}`}
          to="/mes-produits"
        >
          <span className="ic">📦</span>Mes produits
        </NavLink>
        <NavLink
          className={({ isActive }) => `snav-item ${isActive ? 'active' : ''}`}
          to="/commandes-recues"
        >
          <span className="ic">📑</span>Commandes reçues
        </NavLink>
        <NavLink
          className={({ isActive }) => `snav-item ${isActive ? 'active' : ''}`}
          to="/statistiques"
        >
          <span className="ic">📈</span>Statistiques
        </NavLink>
        <NavLink
          className={({ isActive }) => `snav-item ${isActive ? 'active' : ''}`}
          to="/avis-clients"
        >
          <span className="ic">⭐</span>Avis clients
        </NavLink>
        <NavLink
          className={({ isActive }) => `snav-item ${isActive ? 'active' : ''}`}
          to="/messages-vendeur"
        >
          <span className="ic">💬</span>Messages
        </NavLink>
        <NavLink
          className={({ isActive }) => `snav-item ${isActive ? 'active' : ''}`}
          to="/parametres-vendeur"
        >
          <span className="ic">⚙</span>Paramètres
        </NavLink>
      </nav>

      <div className="sidebar-foot">
        <div className="sidebar-sep"></div>
        <button type="button" className="btn-logout" onClick={deconnecter}>
          ⏻ Se déconnecter
        </button>
      </div>
    </aside>
  );
}

export default VendeurSidebar;