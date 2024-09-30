import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./Loader";
import StatusLabel from "./StatusLabel";
import { useNavigate } from "react-router-dom";

const VITE_API_URL = import.meta.env.VITE_API_URL_2;
const URL_API_NOTIFICATIONS_ADMIN = `${VITE_API_URL}/notificaciones/proyectos`;
const URL_API_NOTIFICATIONS = `${VITE_API_URL}/notificaciones/mis-proyectos`;
const URL_API_AUTH = `${VITE_API_URL}/auth/profile`;

const NotificationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(5);
  const [isDeleting, setIsDeleting] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const userResponse = await axios.get(URL_API_AUTH, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(userResponse.data);

        const notificationsUrl =
          userResponse.data.sub.role === "Administrador"
            ? URL_API_NOTIFICATIONS_ADMIN
            : URL_API_NOTIFICATIONS;

        const notificationsResponse = await axios.get(notificationsUrl, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(notificationsResponse)

        setNotifications(notificationsResponse.data.reverse());
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleReviewClick = (projectId) => {
    if (user?.sub?.role === "Usuario") {
      navigate("/usuarios/review", { state: { projectId } });
    } else {
      navigate("/administrador/review", { state: { projectId } });
    }
  };

  const indexOfLastNotification = currentPage * notificationsPerPage;
  const indexOfFirstNotification =
    indexOfLastNotification - notificationsPerPage;
  const currentNotifications = notifications.slice(
    indexOfFirstNotification,
    indexOfLastNotification
  );
  const totalPages = Math.ceil(notifications.length / notificationsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${VITE_API_URL}/notificaciones/mis-proyectos/${notificationId}`,
        { estado: "Vista" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Actualiza la notificación localmente sin hacer un nuevo fetch
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, estado: "Vista" }
            : notification
        )
      );
    } catch (error) {
      console.error("Error al marcar como leída:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    setIsDeleting(true);
    try {
      await axios.delete(
        `${VITE_API_URL}/notificaciones/mis-proyectos/${notificationId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Elimina la notificación localmente
      setNotifications((prevNotifications) =>
        prevNotifications.filter(
          (notification) => notification._id !== notificationId
        )
      );
    } catch (error) {
      console.error("Error al eliminar la notificación:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const halfMaxPagesToShow = Math.floor(5 / 2);
    let startPage = Math.max(currentPage - halfMaxPagesToShow, 1);
    let endPage = Math.min(currentPage + halfMaxPagesToShow, totalPages);

    if (endPage - startPage < 5 - 1) {
      if (currentPage < halfMaxPagesToShow + 1) {
        endPage = Math.min(5, totalPages);
      } else {
        startPage = Math.max(totalPages - 5 + 1, 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={i === currentPage ? "active" : ""}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="fixed z-50 flex items-center justify-center notificationsContainer">
      <div className="ntfCont">
        {loading ? (
          <Loader />
        ) : currentNotifications.length > 0 ? (
          <ul>
            {currentNotifications.map((notification) => (
              <li key={notification._id} className="mb-2 cardNotification">
                <div className="containerNotification">
                  <div className="rightNotification">
                    <div className="text-wrapNotification">
                      <p className="text-contentNotification">
                        <a
                          className="text-linkNotification"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {notification.title}
                        </a>
                      </p>
                      <p className="bodyNotification">
                        {notification.proyecto.titulo}
                      </p>
                    </div>
                    <div className="button-wrapNotification">
                      <button
                        onClick={() =>
                          handleReviewClick(notification.proyecto._id)
                        }
                        className="primary-ctaNotification"
                      >
                        Ver Proyecto
                      </button>
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="secondary-ctaNotification"
                      >
                        Marcar como leído
                      </button>
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="secondary-ctaNotification"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
                  <div className="leftNotification">
                    <StatusLabel estado={notification.estado} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "80vh",
            }}
          >
            No hay notificaciones.
          </p>
        )}
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            &lt;
          </button>
          {renderPageNumbers()}
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            &gt;
          </button>
        </div>
        <button onClick={onClose} className="notificationBtn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
            <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationModal;
