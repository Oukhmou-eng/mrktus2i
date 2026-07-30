import "../../css/Boutiques.css";
import { useEffect, useMemo, useState } from "react";
import { getTokenPayload } from "../../store/authStore";

const API_BASE_URL = "http://localhost:3000/utilisateurs";

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statutFilter, setStatutFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPrenom, setNewPrenom] = useState("");
  const [newNom, setNewNom] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newTele, setNewTele] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [newStatut, setNewStatut] = useState("actif");
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté(e) pour accéder à cette page admin.");
      setLoading(false);
      return;
    }

    const payload = getTokenPayload(token);
    if (!payload?.role || payload.role !== "admin") {
      setError("Accès refusé : vous devez être administrateur pour voir cette page.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const params = new URLSearchParams();
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (statutFilter !== "all") params.set("statut", statutFilter);
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`${API_BASE_URL}/admin?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || `Erreur HTTP ${response.status}`);
      }

      const data = await response.json();
      setUsers(data?.users ?? []);
    } catch (requestError) {
      console.error("Erreur lors du chargement des utilisateurs :", requestError);
      setError(requestError.message || "Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, statutFilter]);

  const saveUserField = async (userId, field, value) => {
    if (!value) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vous devez être connecté(e) pour modifier un utilisateur.");
      return;
    }
    setSavingId(userId);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/admin/${userId}/${field}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !(data?.success ?? true)) {
        throw new Error(data?.message || `Erreur HTTP ${response.status}`);
      }
      setUsers((current) =>
        current.map((user) =>
          user.id_user === userId ? { ...user, [field]: data[field] ?? value } : user,
        ),
      );
      setMessage(`Utilisateur #${userId} mis à jour.`);
    } catch (requestError) {
      console.error("Erreur de mise à jour utilisateur :", requestError);
      setError(requestError.message || "Impossible de mettre à jour l'utilisateur.");
    } finally {
      setSavingId(null);
    }
  };

  const handleRoleChange = (user, nextRole) => {
    saveUserField(user.id_user, "role", nextRole);
  };

  const handleStatutChange = (user, nextStatut) => {
    saveUserField(user.id_user, "statut", nextStatut);
  };

  const displayedUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users
      .filter((user) => {
        if (roleFilter !== "all" && user.role !== roleFilter) {
          return false;
        }
        if (statutFilter !== "all" && user.statut !== statutFilter) {
          return false;
        }
        if (!normalizedSearch) {
          return true;
        }
        return (
          user.prenom?.toLowerCase().includes(normalizedSearch) ||
          user.nom?.toLowerCase().includes(normalizedSearch) ||
          user.email?.toLowerCase().includes(normalizedSearch)
        );
      })
      .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  }, [users, search, roleFilter, statutFilter]);

  const resetCreateForm = () => {
    setNewPrenom("");
    setNewNom("");
    setNewEmail("");
    setNewPassword("");
    setNewTele("");
    setNewRole("user");
    setNewStatut("actif");
  };

  const handleCreateUser = async (event) => {
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

    const form = event.currentTarget;
    const formData = new FormData(form);
    const prenom = String(formData.get("prenom_user") ?? "").trim();
    const nom = String(formData.get("nom_user") ?? "").trim();
    const email = String(formData.get("email_user") ?? "").trim();
    const password = String(formData.get("password_user") ?? "");
    const tele = String(formData.get("tele_user") ?? "").trim();
    const role = String(formData.get("role_user") ?? "user");
    const statut = String(formData.get("statut_user") ?? "actif");

    console.log('create-user payload', { prenom, nom, email, password, tele, role, statut });

    if (!prenom || !nom || !email || password.length < 8) {
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
        body: JSON.stringify({
          prenom,
          nom,
          email,
          password,
          tele,
          role,
          statut,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || `Erreur HTTP ${response.status}`);
      }

      setUsers((current) => [{ ...data, prenom, nom, email, tele, role, statut }, ...current]);
      setMessage(`Utilisateur ${prenom} ${nom} créé avec succès.`);
      resetCreateForm();
      setShowCreateForm(false);
    } catch (requestError) {
      console.error("Erreur lors de la création de l'utilisateur :", requestError);
      setError(requestError.message || "Impossible de créer l'utilisateur.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="directory-shops-page">
      <section className="directory-shops" aria-labelledby="admin-users-title">
        <header className="directory-shops__header">
          <span className="directory-shops__eyebrow">Administration</span>
          <h1 id="admin-users-title">Gestion des utilisateurs</h1>
          <p>Ajoutez des comptes, modifiez rôle et statut, et filtrez facilement.</p>
          <button className="btn teal btn-sm" onClick={() => { resetCreateForm(); setShowCreateForm(true); }}>
            Ajouter un utilisateur
          </button>
        </header>
        {showCreateForm && (
          <div className="directory-shops__overlay">
            <div className="directory-shops__modal">
              <div className="directory-shops__modal-header">
                <div>
                  <h2>Créer un nouvel utilisateur</h2>
                  <p>Remplissez ces informations pour ajouter un compte administrateur ou utilisateur.</p>
                </div>
                <button type="button" className="btn secondary btn-sm" onClick={() => { resetCreateForm(); setShowCreateForm(false); }}>
                  Fermer
                </button>
              </div>
              <form className="directory-shops__form" onSubmit={handleCreateUser} autoComplete="off" noValidate>
                <div className="directory-shops__grid">
                  <div className="directory-shops__field">
                    <label>Prénom</label>
                    <input
                      className="directory-shops__input"
                      name="prenom_user"
                      autoComplete="off"
                      spellCheck="false"
                      value={newPrenom}
                      onChange={(event) => setNewPrenom(event.target.value)}
                      required
                    />
                  </div>
                  <div className="directory-shops__field">
                    <label>Nom</label>
                    <input
                      className="directory-shops__input"
                      name="nom_user"
                      autoComplete="off"
                      spellCheck="false"
                      value={newNom}
                      onChange={(event) => setNewNom(event.target.value)}
                      required
                    />
                  </div>
                  <div className="directory-shops__field">
                    <label>Email</label>
                    <input
                      className="directory-shops__input"
                      name="email_user"
                      autoComplete="off"
                      spellCheck="false"
                      type="email"
                      value={newEmail}
                      onChange={(event) => setNewEmail(event.target.value)}
                      required
                    />
                  </div>
                  <div className="directory-shops__field">
                    <label>Mot de passe</label>
                    <input
                      className="directory-shops__input"
                      name="password_user"
                      autoComplete="new-password"
                      spellCheck="false"
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="directory-shops__field">
                    <label>Téléphone</label>
                    <input
                      className="directory-shops__input"
                      name="tele_user"
                      autoComplete="off"
                      spellCheck="false"
                      value={newTele}
                      onChange={(event) => setNewTele(event.target.value)}
                    />
                  </div>
                  <div className="directory-shops__field">
                    <label>Rôle</label>
                    <select
                      className="directory-shops__input"
                      name="role_user"
                      value={newRole}
                      onChange={(event) => setNewRole(event.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="directory-shops__field">
                    <label>Statut</label>
                    <select
                      className="directory-shops__input"
                      name="statut_user"
                      value={newStatut}
                      onChange={(event) => setNewStatut(event.target.value)}
                    >
                      <option value="actif">Actif</option>
                      <option value="suspendu">Suspendu</option>
                    </select>
                  </div>
                </div>
                <div className="directory-shops__actions directory-shops__actions--form">
                  <button type="submit" className="btn teal btn-sm" disabled={submitting}>
                    {submitting ? "Création…" : "Créer l'utilisateur"}
                  </button>
                  <button type="button" className="btn secondary btn-sm" onClick={() => setShowCreateForm(false)}>
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="directory-shops__tools">
          <label className="directory-shops__search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Rechercher un utilisateur"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <div className="directory-shops__sort" style={{ gap: '10px' }}>
            <label>
              Rôle
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                <option value="all">Tous</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label>
              Statut
              <select value={statutFilter} onChange={(event) => setStatutFilter(event.target.value)}>
                <option value="all">Tous</option>
                <option value="actif">Actif</option>
                <option value="suspendu">Suspendu</option>
              </select>
            </label>
          </div>
        </div>

        {message && <div className="directory-shops__notice">{message}</div>}
        {error && <div className="directory-shops__notice directory-shops__notice--error">{error}</div>}

        {loading && <div className="directory-shops__notice">Chargement des utilisateurs…</div>}
        {!loading && !error && displayedUsers.length === 0 && (
          <div className="directory-shops__empty">
            <span aria-hidden="true">⌕</span>
            <h2>Aucun utilisateur trouvé</h2>
            <p>Essayez un autre filtre ou recherche.</p>
          </div>
        )}

        <div className="directory-shops__list">
          {displayedUsers.map((user) => (
            <article className="directory-shop-card" key={user.id_user}>
              <div className="directory-shop-card__logo">
                {user.logo_url ? (
                  <img src={user.logo_url} alt={`${user.prenom} ${user.nom}`} />
                ) : (
                  user.prenom?.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="directory-shop-card__content" style={{ flex: 1 }}>
                <h2>{user.prenom} {user.nom}</h2>
                <div className="directory-shop-card__details">
                  <span>{user.email}</span>
                  <span>{user.tele || '—'}</span>
                </div>
              </div>
              <div className="directory-shop-card__actions" style={{ alignItems: 'flex-start' }}>
                <label>
                  Rôle
                  <select
                    value={user.role}
                    disabled={savingId === user.id_user}
                    onChange={(event) => handleRoleChange(user, event.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
                <label>
                  Statut
                  <select
                    value={user.statut}
                    disabled={savingId === user.id_user}
                    onChange={(event) => handleStatutChange(user, event.target.value)}
                  >
                    <option value="actif">Actif</option>
                    <option value="suspendu">Suspendu</option>
                  </select>
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
