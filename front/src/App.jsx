import { BrowserRouter,Routes, Route, Navigate } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Navbar from './layouts/PublicLayout'
import './App.css'

import Login from './pages/public/Login'
import Registre from './pages/public/Registre'
import Home from './pages/public/Home'
import Boutiques from './pages/public/Boutiques'
import Boutique from './pages/public/Boutique'
import SignaleCard from './components/signaleCard'
import Catalogue from    './pages/public/Catalogue'
import Soldes from    './pages/public/Soldes'
import Produit from './pages/public/Produit'
import Comptelayout from './layouts/Comptelayout'
import VendeurSidebar from './layouts/VendeurLayout'

import Messages from './pages/compte/Messages'
import Favoris from './pages/compte/Favoris'
import BoutiquesS from './pages/compte/BoutiquesSuivies'
import Notifications from './pages/compte/Notifications'
import MesProduits from './pages/vendeur/MesProduits'
import CreerBoutique from './pages/compte/CreerBoutique'
import PublierProduit from './pages/vendeur/PublierProduit'
import Commandes from './pages/compte/Commandes'

const token = localStorage.getItem('token')

function App() {

   
  return (


  
      <Routes>
        <Route path="/"    element={<><Navbar/><Home /></> } />
        <Route path="/login"    element={<><Navbar/><Login /></> } />
        <Route path="/registre" element={<><Navbar/><Registre /></> } />
        <Route path="/home"    element={<><Navbar/><Home /></> } />
         
         <Route path="/vendeur"    element={<><Navbar/><VendeurSidebar/></> } />
        <Route path="/boutiques"    element={<><Navbar/><Boutiques /></> } />
        <Route path="/boutique/:id"    element={<><Navbar/><Boutique /></> } />


        <Route path="/signaler"    element={<><Navbar/><SignaleCard /></> } />


        <Route path="/catalogue"    element={<><Navbar/><Catalogue /></> } />
        <Route path="/soldes"    element={<><Navbar/><Soldes/></> } />
        <Route path="/produit/:id"    element={<><Navbar/><Produit /></> } />
        

       
        <Route path="/mes-produits/:id" element={<><Navbar/><MesProduits/></>} />
        
       
      
        <Route path="/publierProduit" element={<><Navbar/><VendeurSidebar/><PublierProduit/></>} />



       <Route path="/espConnecter" element={
          token ? <><Navbar/><Comptelayout/><Home /></> : <Navigate to="/login" />
        } />
        <Route path="/favoris" element={
          token ? <><Navbar/><Comptelayout/><Favoris/> </> : <Navigate to="/login" />
        } />
        <Route path="/mes-commandes" element={
          token ? <><Navbar/><Comptelayout/><Commandes /> </> : <Navigate to="/login" />
        } />
       <Route path="/notifications" element={
          token ? <><Navbar/><Comptelayout/><Notifications/> </> : <Navigate to="/login" />
        } />
        <Route path="/boutiques-suivies" element={
          token ? <><Navbar/><Comptelayout/><BoutiquesS/> </> : <Navigate to="/login" />
        } />
        <Route path="/creer-boutique" element={
          token ? <><Navbar/><Comptelayout/><CreerBoutique /> </> : <Navigate to="/login" />
        } />





      </Routes>
   
  )
}

export default App
