import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  BadgeCheck,
  Edit,
  LogOut,
  Settings,
} from "lucide-react";
import AdminLayout from "../Layouts/AdminLayout";
import Loader from "./Loader";
import GetUser from "../../utils/GetUser";
import { useNavigate } from "react-router-dom";

const VITE_API_URL = import.meta.env.VITE_API_URL
const URL_API_LOGOUT = `${VITE_API_URL}/auth/logout`;
const URL_API_USERCOUNT = `${VITE_API_URL}/auth/usuario/counter`

const ProfileView = () => {
  const [user, setUser] = useState(null);
  const [isSavingChanges, setIsSavingChanges] = useState(null)
  const [proyects, setProyects] = useState([]);
  const [loadingProyects, setLoadingProyects] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const navigate = useNavigate();


  useEffect(() => {
    const fetchCounterUser = async () => {
      try {
        const response = await axios.get(URL_API_USERCOUNT);

        setUserCount(response.data);
      } catch (error) {
        console.error("Error al obtener el contador de usuarios:", error);
      }
    }

    const fetchUser = async () => {
      try {
        const user = await GetUser(token);
        setUser(user.sub);
        setNotificationsEnabled(user.sub.notificaciones)
        setEditForm({
          nombre: user.sub.nombre,
          apellido: user.sub.apellido,
          email: user.sub.email,
          telefono: user.sub.telefono,
        });
      } catch (error) {
        console.log("Error fetching user:", error);
      }
    };

    const fetchProyects = async () => {
      try {
        const response = await axios.get(
          `${VITE_API_URL}/mis-proyectos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProyects(response.data);
      } catch (error) {
        console.log("Error fetching projects:", error);
      } finally {
        setLoadingProyects(false);
      }
    };

    fetchUser();
    fetchProyects();
    fetchCounterUser();
  }, [token, showModal]);

  const logout = async () => {
    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await axios.post(
        URL_API_LOGOUT,
        { token },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(
          `Error HTTP ${response.status} - ${response.statusText}`
        );
      }

      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error(`Error al cerrar sesión: ${error.message}`);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleEditAccount = () => {
    setShowModal(true);
  };

  const handleNotificationToggle = async () => {
    const nuevoEstado = !notificationsEnabled; 
  
    try {
      const response = await axios.patch(
        `${VITE_API_URL}/auth/usuario/${user._id}`,
        { notificaciones: nuevoEstado }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log(response);
      setNotificationsEnabled(nuevoEstado); 
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleUpdateUser = async () => {
    const updatedFields = {};

    if (editForm.nombre !== user.nombre) {
      updatedFields.nombre = editForm.nombre;
    }
    if (editForm.apellido !== user.apellido) {
      updatedFields.apellido = editForm.apellido;
    }
    if (editForm.email !== user.email) {
      updatedFields.email = editForm.email;
    }
    if (editForm.telefono !== user.telefono) {
      updatedFields.telefono = editForm.telefono;
    }

    if (Object.keys(updatedFields).length > 0) {
      try {
        setIsSavingChanges(true)
        await axios.patch(
          `${VITE_API_URL}/auth/usuario/${user._id}`,
          updatedFields,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setShowModal(false);
      } catch (error) {
        console.log("Error updating user:", error);
      } finally {
        setIsSavingChanges(false)
      }
    } else {
      console.log("No hay cambios para actualizar");
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (!user || loadingProyects) {
    return <Loader />;
  }

  return (
    <AdminLayout>
      <div className="profile">
        <h1 style={{ fontSize: "40px", margin: "20px 0px" }}>Mi perfil</h1>
        <div className="profileInfo">
          <section className="myprofile">
            <div className="imgAndName">
              <User className="icon-class" size="100px" />
              <div>
                <h1>
                  {user.nombre} {user.apellido}
                </h1>
                <div className="role iconProfile">
                  <BadgeCheck className="icon-class" size="18px" />
                  <p>{user.role}</p>
                </div>
              </div>
            </div>
            <div className="contact-info">
              <div className="email iconProfile">
                <Mail className="icon-class" size="18px" />
                <p>{user.email}</p>
              </div>
              <div className="phone iconProfile">
                <Phone className="icon-class" size="18px" />
                <p>+57 {user.telefono}</p>
              </div>
            </div>
          </section>

          {user.role === "Administrador" ? (
            <section className="myestatus">
              <h1>Total de usuarios registrados</h1>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: "10px",
                  height: "116px"
                }}
              >
                <h2>{userCount}</h2>
                <span className="status"></span>
              </div>
            </section>
          ) : (
            <section className="myestatus">
              <h1>Mis proyectos</h1>
              <div className="proyectsStatus" style={{ marginTop: "20px" }}>
                {proyects.length === 0 ? (
                  <p>No hay proyectos</p>
                ) : (
                  proyects.map((proyecto) => (
                    <div
                      key={proyecto._id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <p>{proyecto.titulo}</p>
                      <span className="status">{proyecto.estado}</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
        <section className="account-settings">
          <h1>Ajustes de cuenta</h1>
          <div className="notification-toggle">
            <p>Notificaciones por Email</p>
            <label className="switch">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={handleNotificationToggle}
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>
        <div className="account-buttons" style={{ marginTop: "20px" }}>
          <button onClick={handleEditAccount}>
            <Settings size={20} style={{ marginRight: "8px" }} />
            Editar cuenta
          </button>
          <button onClick={logout} style={{ marginLeft: "10px" }}>
            {isLoggingOut ? (
              <span>Cerrando sesión...</span>
            ) : (
              <>
                <LogOut size={20} style={{ marginRight: "8px" }} />
                Cerrar sesión
              </>
            )}
          </button>
        </div>

        {showModal && (
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 999,
              }}
              onClick={closeModal}
            />
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "#fff",
                padding: "40px",
                borderRadius: "8px",
                zIndex: 1000,
                width: "80%",
                maxWidth: "600px",
                boxShadow: "0px 4px 8px rgba(0, 0, 3, 0.5)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ margin: 0 }}>Editar cuenta</h2>
                <button
                  onClick={closeModal}
                  style={{
                    fontSize: "16px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  X
                </button>
              </div>

              <div className="formEditAccount">
                <label>
                  Nombre:
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={editForm.nombre}
                  onChange={handleInputChange}
                />
                <label>
                  Apellido:
                </label>
                <input
                  type="text"
                  name="apellido"
                  value={editForm.apellido}
                  onChange={handleInputChange}
                />
                <label>
                  Correo electrónico:
                </label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleInputChange}
                />
                <label>
                  Teléfono:
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={editForm.telefono}
                  onChange={handleInputChange}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={handleUpdateUser}
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    border: "none",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {!isSavingChanges ? ('Guardar cambios') : ('Guardando cambios...')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ProfileView;
