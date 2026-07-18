
  import "../css/Comptelayout.css";
import { useState } from "react";
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'
  
  
  import { Link, NavLink } from "react-router-dom";
  
  


function Comptelayout() {


    return (

 <div className="app-connected active">
    <aside className="sidebar" id="sidebar">

      <a className="user-card" href="parametres.html"  style={{ textDecoration: "none" }}>
        <div className="ava">SE</div>
        <div className="who">
          <div className="name">Sara El Amrani</div>
          <div className="email">sara.elamrani@gmail.com</div>
        </div>
      </a>

      <a className="create-shop-btn" href="../index.html#wizard-boutique" style={{textDecoration:'none'}}>➕ Créer ma boutique</a>

      <div className="sidebar-sep"></div>

      <nav className="sidebar-nav">

        <Link className="snav-item" to="/dashboard"> <span class="ic">🏠</span>Tableau de bord</Link>
        <Link className="snav-item" to="/dashboard"> <span class="ic">🛒</span>Mes commandes</Link>
        <Link className="snav-item" to="/dashboard"> <span class="ic">❤️</span>Favoris</Link>
        <Link className="snav-item" to="/dashboard"> <span class="ic">📦</span>Suivi des commandes</Link>
        <Link className="snav-item" to="/dashboard"> <span class="ic">💬</span>Messages</Link>
        <Link className="snav-item" to="/dashboard"> <span class="ic">🔔</span>Notifications</Link>
        <Link className="snav-item" to="/dashboard"> <span class="ic">🏪</span>Boutiques suivies</Link>
        <Link className="snav-item" to="/dashboard"> <span class="ic">⚙</span>Paramètres</Link>

        
  
      </nav>

      <div className="sidebar-foot">
        <div className="sidebar-sep"></div>
        <a className="btn-logout" href="../index.html"  style={{ textDecoration: "none" }}>⏻ Se déconnecter</a>
      </div>
    </aside>
    
    
    
    </div>



    );


}


export default Comptelayout ; 
  
  