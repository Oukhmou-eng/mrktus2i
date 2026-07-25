import "../../css/Parametres.css";
import { useEffect, useState, useRef } from 'react';

function Parametres() {
  const token = localStorage.getItem('token');

  // ---- Profil ----
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [ville, setVille] = useState('');
  const [codep, setCodep] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null); // preview locale avant upload
  const fileInputRef = useRef(null);

  // ---- Notifications ----
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifPromo, setNotifPromo] = useState(false);

  // ---- Langue & région ----
  const [langue, setLangue] = useState('Français');
  const [devise, setDevise] = useState('MAD (Dirham)');

  // ---- Sécurité ----
  const [motDePasseActuel, setMotDePasseActuel] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmerMotDePasse, setConfirmerMotDePasse] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('http://localhost:3000/boutiques/mes-boutiques', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.ok ? res.json() : { boutiques: [] })
      .then((data) => setHasBoutique((data?.boutiques?.length ?? 0) > 0))
      .catch(() => setHasBoutique(false));
  }, [token]);
  // ---- Chargement initial des données utilisateur ----
  useEffect(() => {
    const fetchProfil = async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:3000/utilisateurs/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data = await res.json();

        setPrenom(data.user?.prenom ?? '');
        console.log(prenom)
        setNom(data.user?.nom ?? '');
        setEmail(data.user?.email ?? '');
        setTelephone(data.user?.tele ?? '');
         setAvatarUrl(data.user?.logo_url ?? '');
         setVille(data.user?.ville ?? '')
         
        setAdresse(data.user?.adresse ?? '');
        setCodep(data.user?.code_postal ?? '')
       

      } catch (requestError) {
        console.error('Erreur lors du chargement du profil :', requestError);
        setError('Impossible de charger vos informations. Réessayez dans un instant.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfil();
  }, [token]);

  // Initiales pour l'avatar par défaut
  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || '?';

  const handleChoisirPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFichierChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    setError('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch('http://localhost:3000/utilisateurs/me/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      const data = await res.json();
      setAvatarUrl(data.user?.logo_url ?? '');
      setAvatarPreview(null);
    } catch (requestError) {
      console.error('Erreur lors de la mise à jour du profil :', requestError);
      setAvatarPreview(null);
      setError('Impossible de mettre à jour votre photo. Réessayez dans un instant.');
    }
  };

  const handleRetirerPhoto = async () => {
    setError('');
    try {
      const res = await fetch('http://localhost:3000/utilisateurs/me/avatar', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      setAvatarPreview(null);
      setAvatarUrl('');
    } catch (requestError) {
      console.error('Erreur lors de la suppression de la photo :', requestError);
      setError('Impossible de supprimer votre photo. Réessayez dans un instant.');
    }
  };
  const handleEnregistrerProfil = async () => {
    setError('');
    try {
      const res = await fetch('http://localhost:3000/utilisateurs/me', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prenom,
          nom,
          email,
          tele: telephone,
          adresse,
          ville,
          code_postal: codep,
        }),
      });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
    } catch (requestError) {
      console.error('Erreur lors de la mise à jour du profil :', requestError);
      setError('Impossible de mettre à jour vos informations. Réessayez dans un instant.');
    }
  };

  const handleToggleNotif = (setter, valeurActuelle) => {
    setter(!valeurActuelle);
    // TODO: PATCH /users/me/notifications avec les nouvelles valeurs
  };

  const handleEnregistrerLangueRegion = () => {
    // TODO: PATCH /users/me/preferences avec { langue, devise }
  };

  const handleMettreAJourMotDePasse = async () => {
    if (nouveauMotDePasse !== confirmerMotDePasse) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setError('');
    try {
      const res = await fetch('http://localhost:3000/utilisateurs/me/password', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ motDePasseActuel, nouveauMotDePasse }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || `Erreur HTTP ${res.status}`);
      }

      setMotDePasseActuel('');
      setNouveauMotDePasse('');
      setConfirmerMotDePasse('');
    } catch (requestError) {
      setError(requestError.message || 'Impossible de mettre à jour le mot de passe.');
    }
  };

  const handleSupprimerCompte = () => {
    // TODO: demander confirmation puis DELETE /users/me
  };

  const imageAffichee = avatarPreview || avatarUrl;

  return (
    <main className="content-area">
      <section className="cview active" id="page-parametres">
        <div className="topline">
          <div>
            <span className="kicker">Compte</span>
            <h1>Paramètres</h1>
          </div>
        </div>

        {error && <div className="settings-notice settings-notice--error">{error}</div>}
        {loading && <div className="settings-notice">Chargement de vos informations…</div>}

        {!loading && (
          <div style={{ maxWidth: '600px' }}>
            {/* ================= Profil ================= */}
            <div className="panel-card settings-section">
              <h3>Profil</h3>
              <div className="desc">
                Ces informations sont visibles par les boutiques lors de vos commandes et de vos avis.
              </div>

              <div className="avatar-edit">
                <div className="ava-lg">
                  {imageAffichee ? <img src={imageAffichee} alt="Avatar" /> : initiales}
                </div>
                <div className="ava-actions">
                  <label className="upload-box" onClick={handleChoisirPhoto}>
                     Changer la photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFichierChange}
                  />
                  <span className="hint">JPG ou PNG, 2 Mo maximum.</span>
                  {imageAffichee && (
                    <button className="remove-photo" onClick={handleRetirerPhoto}>
                      Retirer la photo
                    </button>
                  )}
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Prenom</label>
                  <input value={prenom} onChange={(e) => setPrenom(e.target.value)} />
                </div>
                <div className="field">
                  <label>Nom</label>
                  <input value={nom} onChange={(e) => setNom(e.target.value)} />
                </div>
              </div>

              <div className="field">
                <label>E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="field-row">
                <div className="field">
                  <label>Telephone</label>
                  <input
                    placeholder="+212 666666666"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Adresse</label>
                  <input
                    placeholder="quartier"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                  />
                </div>
              </div>

               <div className="field-row">
                <div className="field">
                  <label>Ville</label>
                  <input
                    placeholder="Beni Mella , rabat ..."
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Code Postal</label>
                  <input
                    placeholder="20000 "
                    value={codep}
                    onChange={(e) => setCodep(e.target.value)}
                  />
                </div>
              </div>

              <button className="btn teal" onClick={handleEnregistrerProfil}>
                Enregistrer les modifications
              </button>
            </div>

            {/* ================= Notifications ================= */}
            <div className="panel-card settings-section">
              <h3>Notifications</h3>
              <div className="desc">Choisissez comment Le Panier vous tient informe.</div>

              <div className="toggle-row">
                <div>
                  <div className="t-label">Notifications par e-mail</div>
                  <div className="t-desc">Commandes, livraisons, messages des boutiques</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notifEmail}
                    onChange={() => handleToggleNotif(setNotifEmail, notifEmail)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div>
                  <div className="t-label">Notifications push</div>
                  <div className="t-desc">Alertes en temps reel sur votre appareil</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notifPush}
                    onChange={() => handleToggleNotif(setNotifPush, notifPush)}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="toggle-row">
                <div>
                  <div className="t-label">Offres et promotions</div>
                  <div className="t-desc">Bons plans des boutiques que vous suivez</div>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={notifPromo}
                    onChange={() => handleToggleNotif(setNotifPromo, notifPromo)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            {/* ================= Langue & région ================= */}
            <div className="panel-card settings-section">
              <h3>Langue &amp; région</h3>
              <div className="desc">Adaptez l'affichage à vos préférences.</div>
              <div className="field-row">
                <div className="field">
                  <label>Langue</label>
                  <select
                    className="settings-select"
                    value={langue}
                    onChange={(e) => setLangue(e.target.value)}
                  >
                    <option>Francais</option>
                    <option>???????</option>
                    <option>English</option>
                  </select>
                </div>
                <div className="field">
                  <label>Devise</label>
                  <select
                    className="settings-select"
                    value={devise}
                    onChange={(e) => setDevise(e.target.value)}
                  >
                    <option>MAD (Dirham)</option>
                    <option>EUR (Euro)</option>
                    <option>USD (Dollar)</option>
                  </select>
                </div>
              </div>
              <button className="btn teal" onClick={handleEnregistrerLangueRegion}>
                Enregistrer
              </button>
            </div>

            {/* ================= Sécurité ================= */}
            <div className="panel-card settings-section">
              <h3>Sécurité</h3>
              <div className="desc">Modifiez votre mot de passe régulièrement pour protéger votre compte.</div>

              <div className="field">
                <label>Mot de passe actuel</label>
                <input
                  type="password"
                  placeholder="......."
                  value={motDePasseActuel}
                  onChange={(e) => setMotDePasseActuel(e.target.value)}
                />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Nouveau mot de passe</label>
                  <input
                    type="password"
                    placeholder="......"
                    value={nouveauMotDePasse}
                    onChange={(e) => setNouveauMotDePasse(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Confirmer</label>
                  <input
                    type="password"
                    placeholder="......."
                    value={confirmerMotDePasse}
                    onChange={(e) => setConfirmerMotDePasse(e.target.value)}
                  />
                </div>
              </div>
              <button className="btn teal" onClick={handleMettreAJourMotDePasse}>
                Mettre à jour le mot de passe
              </button>
            </div>

            {/* ================= Zone de danger ================= */}
            <div className="danger-zone">
              <h3>Zone de danger</h3>
              <div className="desc">La suppression de votre compte est définitive et irréversible.</div>
              <button className="btn-danger" onClick={handleSupprimerCompte}>
                Supprimer mon compte
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default Parametres;