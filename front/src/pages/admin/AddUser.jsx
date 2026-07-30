import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTokenPayload } from "../../store/authStore";
import "../../css/Boutiques.css";

const API_BASE_URL = "http://localhost:3000/utilisateurs";

export default function AddUser() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tele, setTele] = useState("");
  const [role, setRole] = useState("client");
  const [statut, setStatut] = useState("actif");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté(e) pour ajouter un utilisateur.");
      return;
    }

    const payload = getTokenPayload(token);
    if (!payload?.role || payload.role !== "admin") {
      setError("Accès refusé : vous devez être administrateur pour ajouter un utilisateur.");
      return;
    }

    if (!prenom.trim() || !nom.trim() || !email.trim() || password.length < 8) {
      setError("Prénom, nom, email et mot de passe (8 caractères min.) sont requis.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prenom, nom, email, password, tele, role, statut }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || `Erreur HTTP ${response.status}`);
      }

      setMessage(`Utilisateur ${prenom} ${nom} créé avec succès.`);
      setTimeout(() => navigate("/admin/users"), 1200);
    } catch (requestError) {
      console.error("Erreur lors de la création de l'utilisateur :", requestError);
      setError(requestError.message || "Impossible de créer l'utilisateur.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="directory-shops-page">
      <section className="directory-shops" aria-labelledby="admin-add-user-title">
        <header className="directory-shops__header">
          <span className="directory-shops__eyebrow">Administration</span>
          <h1 id="admin-add-user-title">Ajouter un nouvel utilisateur</h1>
          <p>Créez un compte administrateur ou utilisateur avec rôle et statut.</p>
        </header>

        <form className="directory-shops__form" onSubmit={handleSubmit}>
          {message && <div className="directory-shops__notice">{message}</div>}
          {error && <div className="directory-shops__notice directory-shops__notice--error">{error}</div>}

          <div className="directory-shops__grid">
            <label>
              Prénom
              <input value={prenom} onChange={(event) => setPrenom(event.target.value)} required />
            </label>
            <label>
              Nom
              <input value={nom} onChange={(event) => setNom(event.target.value)} required />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label>
              Mot de passe
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
            </label>
            <label>
              Téléphone
              <input value={tele} onChange={(event) => setTele(event.target.value)} />
            </label>
            <label>
              Rôle
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                <option value="client">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label>
              Statut
              <select value={statut} onChange={(event) => setStatut(event.target.value)}>
                <option value="actif">Actif</option>
                <option value="suspendu">Suspendu</option>
              </select>
            </label>
          </div>

          <div className="directory-shops__actions" style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn teal btn-sm" disabled={submitting}>
              {submitting ? "Création…" : "Créer l'utilisateur"}
            </button>
            <button type="button" className="btn secondary btn-sm" onClick={() => navigate('/admin/users')}>
              Annuler
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
