import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/CreerBoutique.css';

const API_URL = 'http://localhost:3000';

const initialForm = {
  nom: '',
  description: '',
  adresse: '',
  tele: '',
  emailprof: '',
  instagram: '',
  facebook: '',
};

const STEPS = ['Informations', 'Contact', 'Réseaux sociaux'];

function CreerBoutique() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState({ logo: null, banniere: null });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const token = localStorage.getItem('token');
   

  const updateField = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const selectImage = (event) => {
    const { name, files } = event.target;
    setImages((current) => ({ ...current, [name]: files?.[0] || null }));
  };

  const goNext = (event) => {
    event.preventDefault(); // sécurité : ce clic ne doit jamais soumettre le formulaire
    if (step === 1 && form.nom.trim().length < 2) {
      setError('Le nom de la boutique doit contenir au moins 2 caractères.');
      return;
    }
    setError('');
    setStep((current) => Math.min(current + 1, 3));
  };

  const goPrevious = (event) => {
    event.preventDefault();
    setStep((current) => Math.max(current - 1, 1));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([name, value]) => payload.append(name, value));
      if (images.logo) payload.append('logo', images.logo);
      if (images.banniere) payload.append('banniere', images.banniere);

      const response = await fetch(`${API_URL}/boutiques`, {
        method: 'POST',
        body: payload,
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
        throw new Error(message);
      }

      setSuccess(`La boutique « ${data.nom} » a été créée avec succès.`);
      setForm(initialForm);
      setImages({ logo: null, banniere: null });
      setStep(1);
    } catch (requestError) {
      setError(requestError.message || 'Impossible de créer la boutique. Réessayez dans un instant.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="create-shop-page">
      <section className="cview active" aria-labelledby="create-shop-title">
        <div className="topline">
          <div>
            <span className="kicker">Nouvelle boutique</span>
            <h1 id="create-shop-title">Créer votre boutique</h1>
          </div>
        </div>

        <form className="wizard-card" onSubmit={submit}>
          <div className="wizard-steps" aria-label={`Étape ${step} sur 3`}>
            {STEPS.map((label, index) => {
              const number = index + 1;
              return (
                <div
                  className={`wstep ${number === step ? 'active' : ''} ${number < step ? 'done' : ''}`}
                  key={label}
                >
                  <div className="num">{number}</div>
                  <div className="lbl">{label}</div>
                </div>
              );
            })}
          </div>

          {step === 1 && (
            <div className="wpane active">
              <label className="field">
                Nom de la boutique
                <input
                  name="nom"
                  value={form.nom}
                  onChange={updateField}
                  placeholder="Ex. Atelier Sara"
                  required
                />
              </label>

              <label className="field">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  placeholder="Décrivez votre boutique en quelques mots…"
                />
              </label>

              <div className="field-row">
                <label className="field">
                  Logo
                  <input
                    className="image-picker"
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={selectImage}
                  />
                  <span className="selected-image">
                    {images.logo ? images.logo.name : 'Choisir une image'}
                  </span>
                </label>

                <label className="field">
                  Bannière
                  <input
                    className="image-picker"
                    type="file"
                    name="banniere"
                    accept="image/*"
                    onChange={selectImage}
                  />
                  <span className="selected-image">
                    {images.banniere ? images.banniere.name : 'Choisir une image'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="wpane active">
              <div className="field-row">
                <label className="field">
                  Adresse
                  <input
                    name="adresse"
                    value={form.adresse}
                    onChange={updateField}
                    placeholder="Ville, quartier…"
                  />
                </label>

                <label className="field">
                  Téléphone
                  <input
                    name="tele"
                    value={form.tele}
                    onChange={updateField}
                    placeholder="+212 6…"
                  />
                </label>
              </div>

              <label className="field">
                E-mail professionnel
                <input
                  type="email"
                  name="emailprof"
                  value={form.emailprof}
                  onChange={updateField}
                  placeholder="contact@atelier-sara.ma"
                />
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="wpane active">
              <label className="field">
                Instagram
                <input
                  name="instagram"
                  value={form.instagram}
                  onChange={updateField}
                  placeholder="@atelier.sara"
                />
              </label>

              <label className="field">
                Facebook
                <input
                  name="facebook"
                  value={form.facebook}
                  onChange={updateField}
                  placeholder="facebook.com/atelier.sara"
                />
              </label>
            </div>
          )}

          {error && (
            <p className="form-message form-message--error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="form-message form-message--success" role="status">
              {success}{' '}
              <button type="button" onClick={() => navigate('/boutiques')}>
                Voir les boutiques
              </button>
            </p>
          )}

          <div className="wizard-actions">
            <button
              className="btn outline"
              type="button"
              onClick={goPrevious}
              disabled={step === 1 || submitting}
            >
              ← Précédent
            </button>

            {step < 3 ? (
              <button className="btn teal" type="button" onClick={goNext}>
                Continuer →
              </button>
            ) : (
              <button className="btn teal" type="submit" disabled={submitting}>
                {submitting ? 'Création…' : 'Créer ma boutique'}
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}

export default CreerBoutique;