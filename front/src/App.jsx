import { BrowserRouter,Routes, Route } from 'react-router-dom';
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

import Favoris from './pages/Compte/Favoris'

function App() {

  return (


  
      <Routes>
        <Route path="/"    element={<Navbar/> } />
        <Route path="/login"    element={<><Navbar/><Login /></> } />
        <Route path="/registre" element={<><Navbar/><Registre /></> } />
        <Route path="/home"    element={<><Navbar/><Home /></> } />
        <Route path="/boutiques"    element={<><Navbar/><Boutiques /></> } />
        <Route path="/boutique/:id"    element={<><Navbar/><Boutique /></> } />
        <Route path="/signaler"    element={<><Navbar/><SignaleCard /></> } />
        <Route path="/catalogue"    element={<><Navbar/><Catalogue /></> } />
        <Route path="/soldes"    element={<><Navbar/><Soldes/></> } />
        <Route path="/produit/:id"    element={<><Navbar/><Produit /></> } />
        <Route path="/favoris"    element={<> <Comptelayout/><Favoris/></> } />
      </Routes>
   
  )
}

export default App
