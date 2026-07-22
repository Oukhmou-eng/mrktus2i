import '../css/Comptelayout.css';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Comptelayout() {
  const navigate = useNavigate();

  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [boutiques, setBoutiques] = useState([]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    setEmail(localStorage.getItem('email'));
    setNom(localStorage.getItem('nom'));
  }, []);

  useEffect(() => {
    const fetchMesBoutiques = async () => {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:3000/boutiques/mes-boutiques', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data = await res.json();
        setBoutiques(data?.boutiques ?? []);
        
      } catch (error) {
        console.error('Erreur lors du chargement de mes boutiques :', error);
      }
    };

    fetchMesBoutiques();
  }, [token]);

  const deconnecter = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nom');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    localStorage.removeItem("id_boutique");

    sessionStorage.clear();
    navigate('/home', { replace: true });
  };

  const boutiquesAffichees = boutiques.slice(0, 2);
  const limiteAtteinte = boutiques.length >= 2;

  return (
    <aside className='sidebar' id='sidebar'>
      <a className='user-card' href='parametres.html' style={{ textDecoration: 'none' }}>
        <div className='ava'>SE</div>
        <div className='who'>
          <div className='name'>{nom}</div>
          <div className='email'>{email}</div>
        </div>
      </a>

      {boutiquesAffichees.length > 0 && (
        <div className='my-shops'>
          {boutiquesAffichees.map((boutique) => (
            <Link
              key={boutique.id_boutique}
              className='my-shop-item'
              to={`/vendeur`}
              style={{ textDecoration: 'none' }}
               onClick={() => {
          localStorage.setItem(
            "id_boutique",
            boutique.id_boutique
          );
        }}
            >
              <div className='my-shop-logo'>
                {boutique.logo_url ? (
                  <img src={boutique.logo_url} alt='' />
                ) : (
                  boutique.nom?.slice(0, 1).toUpperCase()
                )}
              </div>
              <span className='my-shop-name'>{boutique.nom}</span>
            </Link>
          ))}
        </div>
      )}

      {limiteAtteinte ? (
        <span
          className='create-shop-btn create-shop-btn--disabled'
          title='Vous avez atteint la limite de 2 boutiques'
          aria-disabled='true'
        >
          ➕ Créer ma boutique
        </span>
      ) : (
        <Link className='create-shop-btn' to='/creer-boutique' style={{ textDecoration: 'none' }}>
          ➕ Créer ma boutique
        </Link>
      )}

      <div className='sidebar-sep'></div>

      <nav className='sidebar-nav'>
        <Link className='snav-item' to='/dashboard'><span className='ic'>🏠</span>Tableau de bord</Link>
        <Link className='snav-item' to='/mes-commandes'><span className='ic'>🛒</span>Mes commandes</Link>
        <Link className='snav-item' to='/favoris'><span className='ic'>❤️</span>Favoris</Link>
        <Link className='snav-item' to='/suivi-commandes'><span className='ic'>📦</span>Suivi des commandes</Link>
        <Link className='snav-item' to='/messages'><span className='ic'>💬</span>Messages</Link>
        <Link className='snav-item' to='/notifications'><span className='ic'>🔔</span>Notifications</Link>
        <Link className='snav-item' to='/boutiques-suivies'><span className='ic'>🏪</span>Boutiques suivies</Link>
        <Link className='snav-item' to='/parametres'><span className='ic'>⚙️</span>Paramètres</Link>
      </nav>

      <div className='sidebar-foot'>
        <div className='sidebar-sep'></div>
        <button type='button' className='btn-logout' onClick={deconnecter}>
          ⏻ Se déconnecter
        </button>
      </div>
    </aside>
  );
}

export default Comptelayout;