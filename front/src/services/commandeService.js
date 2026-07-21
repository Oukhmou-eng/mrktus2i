const API_URL = 'http://localhost:3000';

export async function getCommandesUtilisateur(userId = 1) {
  const response = await fetch(`${API_URL}/commandes/utilisateur/${userId}`);
  const data = await response.json();

  if (!response.ok) {
    const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
    throw new Error(message || 'Impossible de récupérer les commandes.');
  }

  return data?.commandes ?? [];
}