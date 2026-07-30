import '../../css/ParametresVendeur.css';
import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000';

function ParametresVendeur() {
  const token = localStorage.getItem('token');
  const idBoutique = localStorage.getItem('id_boutique');

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [banniereUrl, setBanniereUrl] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [banniereFile, setBanniereFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannierePreview, setBannierePreview] = useState('');
  const [adresse, setAdresse] = useState('');
  const [tele, setTele] = useState('');
  const [emailprof, setEmailprof] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchBoutique = async () => {
      if (!token || !idBoutique) {
        setError('Vous devez être connecté et sélectionner une boutique.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URL}/boutiques/mes-boutiques/${idBoutique}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error(`Erreur HTTP ${res.status}`);
        }

        const data = await res.json();
        const boutique = data?.boutiques?.[0] ?? null;
        if (!boutique) {
          throw new Error('Impossible de trouver votre boutique.');
        }

        setNom(boutique.nom ?? '');
        setDescription(boutique.description ?? '');
        setLogoUrl(boutique.logo_url ?? '');
        setBanniereUrl(boutique.banniere_url ?? '');
        setLogoPreview(boutique.logo_url ?? '');
        setBannierePreview(boutique.banniere_url ?? '');
        setAdresse(boutique.adresse ?? '');
        setTele(boutique.tele ?? '');
        setEmailprof(boutique.emailprof ?? '');
        setInstagram(boutique.instagram ?? '');
        setFacebook(boutique.facebook ?? '');
      } catch (requestError) {
        console.error('Erreur de chargement de la boutique :', requestError);
        setError('Impossible de charger les informations de la boutique.');
      } finally {
        setLoading(false);
      }
    };

    fetchBoutique();
  }, [token, idBoutique]);

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBanniereChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBanniereFile(file);
    setBannierePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!token || !idBoutique) {
      setError('Vous devez être connecté et sélectionner une boutique.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('nom', nom);
      formData.append('description', description);
      formData.append('adresse', adresse);
      formData.append('tele', tele);
      formData.append('emailprof', emailprof);
      formData.append('instagram', instagram);
      formData.append('facebook', facebook);
      if (logoFile) formData.append('logo', logoFile);
      if (banniereFile) formData.append('banniere', banniereFile);

      const res = await fetch(`${API_URL}/boutiques/${idBoutique}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || `Erreur HTTP ${res.status}`);
      }

      setSuccess('Modifications enregistrées.');
      if (logoFile) {
        setLogoUrl(logoPreview);
      }
      if (banniereFile) {
        setBanniereUrl(bannierePreview);
      }
    } catch (requestError) {
      console.error('Erreur lors de l’enregistrement :', requestError);
      setError(requestError.message || 'Impossible d’enregistrer les modifications.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="content-area">
      <div className="topline">
        <div>
          <span className="kicker">Configuration</span>
          <h1>Paramètres Boutique</h1>
        </div>
      </div>

      {error && <div className="settings-notice settings-notice--error">{error}</div>}
      {success && <div className="settings-notice settings-notice--success">{success}</div>}
      {loading ? (
        <div className="settings-notice">Chargement des informations…</div>
      ) : (
        <div className="form-card">
          <div className="shop-profile-header">
            <div className="shop-logo-upload">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo boutique" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
              ) : (
                '🏪'
              )}
            </div>
            <div className="shop-header-upload">
              <div>Bannière de boutique</div>
              {bannierePreview ? (
                <img src={bannierePreview} alt="Bannière boutique" style={{ width: '100%', maxHeight: 80, objectFit: 'cover', borderRadius: 12 }} />
              ) : (
                'Sélectionnez une image pour la bannière'
              )}
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Logo de la boutique</label>
              <input type="file" accept="image/*" onChange={handleLogoChange} />
            </div>
            <div className="field">
              <label>Bannière de la boutique</label>
              <input type="file" accept="image/*" onChange={handleBanniereChange} />
            </div>
          </div>

          <div className="field">
            <label>Nom de la boutique</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>

          <div className="field">
            <label>Description de la boutique</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Adresse</label>
              <input type="text" value={adresse} onChange={(e) => setAdresse(e.target.value)} />
            </div>
            <div className="field">
              <label>Téléphone</label>
              <input type="text" value={tele} onChange={(e) => setTele(e.target.value)} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Email professionnel</label>
              <input type="email" value={emailprof} onChange={(e) => setEmailprof(e.target.value)} />
            </div>
            <div className="field">
              <label>Instagram</label>
              <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Facebook</label>
              <input type="text" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
            <button className="btn teal" type="button" onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default ParametresVendeur;
