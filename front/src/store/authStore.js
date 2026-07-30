/* =========================================================
   Décodage du payload d'un token JWT, sans dépendance externe.
   Ne vérifie PAS la signature (ce n'est pas son rôle côté
   frontend) — sert uniquement à lire les infos utiles
   (id_user, id_boutique...) déjà validées par le backend.
   ========================================================= */
export function getTokenPayload(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch (error) {
    console.error("Token invalide, impossible de le décoder :", error);
    return null;
  }
}

/* =========================================================
   Détermine le contexte courant à partir du token :
   - si id_boutique est présent → on agit en tant que boutique
   - sinon → on agit en tant que simple utilisateur
   ========================================================= */
export function getCurrentContext() {
  const token = localStorage.getItem("token");
  const payload = getTokenPayload(token);
  if (!payload) return { idUser: null, idBoutique: null, isBoutique: false };

  return {
    idUser: payload.id_user ?? payload.sub ?? null,
    idBoutique: payload.id_boutique ?? null,
    isBoutique: Boolean(payload.id_boutique),
  };
}