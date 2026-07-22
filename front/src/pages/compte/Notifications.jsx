import "../../css/Notifications.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const notificationMeta = {
  commande: { icon: "📦", label: "Commande" },
  paiement: { icon: "💳", label: "Paiement" },
  promotion: { icon: "✦", label: "Promotion" },
  boutique: { icon: "🏪", label: "Boutique" },
  message: { icon: "💬", label: "Message" },
  avis: { icon: "★", label: "Avis" },
  default: { icon: "🔔", label: "Information" },
};

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date inconnue";

  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "À l’instant";
  if (minutes < 60) return `Il y a ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours} h`;
  if (hours < 48) return "Hier";

  return new Intl.DateTimeFormat("fr-MA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function Notifications() {
  const [info, setInfo] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleGetNotifications = async () => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`http://localhost:3000/notifications/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);

      const data = await res.json();
      setInfo(data?.notifications ?? []);
    } catch (requestError) {
      console.error("Erreur lors du chargement des notifications :", requestError);
      setInfo([]);
      setError("Impossible de charger vos notifications. Réessayez dans un instant.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetNotifications();
  }, []);

  const unreadCount = info.filter((notification) => !Boolean(notification.lu)).length;
  const notifications = info.filter(
    (notification) => filter === "all" || !Boolean(notification.lu),
  );

  const markAsRead = async (notificationId) => {
    const previousNotification = info.find(
      (notification) => notification.id_notification === notificationId,
    );
    if (!previousNotification || Boolean(previousNotification.lu)) return;

    setInfo((current) =>
      current.map((notification) =>
        notification.id_notification === notificationId
          ? { ...notification, lu: true }
          : notification,
      ),
    );

    try {
      const res = await fetch(`http://localhost:3000/notifications/${notificationId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lu: true }),
      });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
    } catch (requestError) {
      console.error("Erreur lors de la mise à jour de la notification :", requestError);
      setInfo((current) =>
        current.map((notification) =>
          notification.id_notification === notificationId
            ? previousNotification
            : notification,
        ),
      );
      setError("La notification n’a pas pu être mise à jour.");
    }
  };

  const markAllAsRead = async () => {
    if (!token || unreadCount === 0) return;

    const previousNotifications = info;
    setIsMarkingAll(true);
    setError("");
    setInfo((current) => current.map((notification) => ({ ...notification, lu: true })));

    try {
      const res = await fetch(`http://localhost:3000/notifications/user/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
    } catch (requestError) {
      console.error("Erreur lors de la lecture des notifications :", requestError);
      setInfo(previousNotifications);
      setError("Les notifications n’ont pas pu être marquées comme lues.");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const openNotification = (notification) => {
    markAsRead(notification.id_notification);
    if (notification.lien) navigate(notification.lien);
  };

  return (
    <main className="notifications-page">
      <section className="notifications" aria-labelledby="notifications-title">
        <header className="notifications__header">
          <div>
            <span className="notifications__eyebrow">Centre d’activité</span>
            <h1 id="notifications-title">Notifications</h1>
            <p>Suivez les nouveautés liées à vos commandes, boutiques et échanges.</p>
          </div>
          <button
            className="notifications__read-all"
            onClick={markAllAsRead}
            disabled={!unreadCount || isMarkingAll}
          >
            {isMarkingAll ? "Mise à jour…" : "Tout marquer comme lu"}
          </button>
        </header>

        <div className="notifications__toolbar">
          <div className="notifications__filters">
            <button
              className={filter === "all" ? "is-active" : ""}
              onClick={() => setFilter("all")}
            >
              Toutes <span>{info.length}</span>
            </button>
            <button
              className={filter === "unread" ? "is-active" : ""}
              onClick={() => setFilter("unread")}
            >
              Non lues <span>{unreadCount}</span>
            </button>
          </div>
          {unreadCount > 0 && (
            <span className="notifications__unread-count">
              {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {error && (
          <div className="notifications__notice notifications__notice--error">{error}</div>
        )}
        {loading && (
          <div className="notifications__notice">Chargement de vos notifications…</div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className="notifications__empty">
            <span aria-hidden="true">🔔</span>
            <h2>{filter === "unread" ? "Tout est à jour" : "Aucune notification pour le moment"}</h2>
            <p>
              {filter === "unread"
                ? "Vous avez lu toutes vos notifications."
                : "Les informations importantes apparaîtront ici."}
            </p>
          </div>
        )}

        <div className="notifications__list">
          {notifications.map((notification) => {
            const meta =
              notificationMeta[String(notification.type).toLowerCase()] ??
              notificationMeta.default;
            return (
              <article
                className={`notification-card ${
                  Boolean(notification.lu) ? "is-read" : "is-unread"
                }`}
                key={notification.id_notification}
              >
                <div className="notification-card__icon" aria-hidden="true">
                  {meta.icon}
                </div>
                <button
                  className="notification-card__content"
                  onClick={() => openNotification(notification)}
                >
                  <span className="notification-card__type">{meta.label}</span>
                  <span className="notification-card__text">{notification.contenu}</span>
                  <time dateTime={notification.date_creation}>
                    {formatDate(notification.date_creation)}
                  </time>
                </button>
                {!Boolean(notification.lu) && (
                  <button
                    className="notification-card__mark-read"
                    onClick={() => markAsRead(notification.id_notification)}
                  >
                    Marquer comme lue
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Notifications;