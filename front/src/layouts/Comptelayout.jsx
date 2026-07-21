import '../css/Comptelayout.css';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';

function Comptelayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const boutiquesSuiviesPath = id ? `/boutiques-suivies/${id}` : '/boutiques';

  const deconnecter = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nom');
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    sessionStorage.clear();
    navigate('/home', { replace: true });
  };

  return (
    <aside className='sidebar' id='sidebar'>
      <a className='user-card' href='parametres.html' style={{ textDecoration: 'none' }}>
        <div className='ava'>SE</div>
        <div className='who'>
          <div className='name'>Sara El Amrani</div>
          <div className='email'>sara.elamrani@gmail.com</div>
        </div>
      </a>

      <Link className='create-shop-btn' to='/creer-boutique' style={{ textDecoration: 'none' }}>
        ➕ Créer ma boutique
      </Link>

      <div className='sidebar-sep'></div>

      <nav className='sidebar-nav'>
        <Link className='snav-item' to='/dashboard'><span className='ic'>🏠</span>Tableau de bord</Link>
        <Link className='snav-item' to='/mes-commandes'><span className='ic'>🛒</span>Mes commandes</Link>
        <Link className='snav-item' to={id ? `/fav/${id}` : '/home'}><span className='ic'>❤️</span>Favoris</Link>
        <Link className='snav-item' to='/suivi-commandes'><span className='ic'>📦</span>Suivi des commandes</Link>
        <Link className='snav-item' to='/messages'><span className='ic'>💬</span>Messages</Link>
        <Link className='snav-item' to={id ? `/notifications/${id}` : '/notifications'}><span className='ic'>🔔</span>Notifications</Link>
        <NavLink className='snav-item' to={boutiquesSuiviesPath}><span className='ic'>🏪</span>Boutiques suivies</NavLink>
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
