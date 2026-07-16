import{ useState } from 'react';
import "../../css/Registre.css";



function Registre() {

    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);  
    
    

    const handleRegister = async () => {
    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, prenom, email, password , confirmPassword})
      });
      const data = await res.json();

      if (!res.ok) {   
        console.error('Registration failed:', data);
        return;
      }

      if (data.error) {     
        console.error('Registration failed:', data.error);
        return;
      }

      console.log('Registration successful:', data);
    } catch (error) {
      console.error('An error occurred during registration.', error);
    }
  }
  const handleForgotPassword = () => {
    console.log({
      email,
    });
  }
   
   
    return (
     <>

  

  <main className="auth-wrap">
    <div className="auth-card">
      <h2 style={{ fontSize: '19px', marginBottom: '20px' }}>Créer un compte</h2>

      <div className="auth-pane active" id="pane-register">
        <div className="field">
          <label htmlFor="register-name">Nom</label>
          <input id="register-name" placeholder="Votre nom" value={nom} onChange={(e) => setNom(e.target.value)}/>
        </div>
        <div className="field">  
          <label htmlFor="register-name">Prenom</label>
          <input id="register-name" placeholder="Votre prenom" value={prenom} onChange={(e) => setPrenom(e.target.value)}/>
        </div>
        <div className="field">
          <label htmlFor="register-email">Adresse e-mail</label>
          <input type="email" id="register-email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <div className="field">
          <label htmlFor="register-password">Mot de passe</label>
          <input type="password" id="register-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}/>
          <div className="field-hint">8 caractères minimum</div>
        </div>
        <div className="field">
          <label htmlFor="register-password-confirm">Confirmer le mot de passe</label>
          <input type="password" id="register-password-confirm" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
        </div>
        <div className="field-check">
          <input type="checkbox" id="register-terms" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)}/>
          <label htmlFor="register-terms">J'accepte les <a href="#">conditions d'utilisation</a> et la <a href="#">politique de confidentialité</a></label>
        </div>
        <button className="btn teal" id="registerSubmitBtn" onClick={handleRegister}>Créer mon compte</button>
        <div className="auth-sep">— ou —</div>
        <button className="btn outline" style={{ width: '100%' }}>Continuer avec Google</button>
        <a className="auth-back" href="login.html">Déjà un compte ? Se connecter</a>
      </div>
    </div>
  </main>

  
  </>
);
}


export default Registre;