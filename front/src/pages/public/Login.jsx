import "../../css/Login.css";
import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        console.error('Login failed:', data);
        return;
      }

      if (data.error) {
        console.error('Login failed:', data.error);
        return;
      }

      console.log('Login successful:', data);
    } catch (error) {
      console.error('An error occurred during login.', error);
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
      <h2 style={{ color: '#000' }}> Se connecter</h2>

   
      <div className="auth-pane active" id="pane-login">
        <div className="field">
          <label  htmlFor="login-email">Adresse e-mail</label>
          <input type="email" id="login-email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <div className="field">
          <label  htmlFor="login-password">Mot de passe</label>
          <input type="password" id="login-password" placeholder="••••••••"   value={password} onChange={(e) => setPassword(e.target.value)}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <a className="auth-forgot" data-goto-pane="forgot" href="#">Mot de passe oublié ?</a>
        </div>
        <button className="btn teal" id="loginSubmitBtn" onClick={handleLogin}>Se connecter</button>
        <div className="auth-sep">— ou —</div>
        <button className="btn outline" style={{ width: '100%' }}>Continuer avec Google</button>
      </div>

     
      <div className="auth-pane" id="pane-forgot">
        <h3 style={{ marginBottom: '8px' }}>Réinitialiser le mot de passe</h3>
        <p style={{ fontSize: '12.5px', color: 'var(--ink-soft)', margin: '0 0 16px' }}>Entrez votre e-mail, un lien de réinitialisation vous sera envoyé.</p>
        <div className="field">
          <label htmlFor="forgot-email">Adresse e-mail</label>
          <input type="email" id="forgot-email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <button className="btn teal" id="forgotSubmitBtn" onClick={handleForgotPassword}>Envoyer le lien</button>
        <a className="auth-back" data-goto-pane="login" href="#">← Retour à la connexion</a>
      </div>
    </div>
  </main>

  




</>
  );
}

export default Login;