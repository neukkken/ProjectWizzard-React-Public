import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import GetUser from "../../utils/GetUser";
import Loader from "./Loader";
import { Link } from "react-router-dom";

const VITE_API_URL = import.meta.env.VITE_API_URL
const URL_API_LOGOUT = `${VITE_API_URL}/auth/logout`;

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await GetUser(token);
      setUser(user.sub.role);
    };
    fetchUser();
  }, []);

  const logout = async () => {
    if (!token) {
      console.error("No token found in localStorage.");
      return;
    }

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
    }
  };

  const getNavItemClass = (path) => {
    return location.pathname === path ? "nav-item-active" : "";
  };

  if (user == null) {
    return <Loader />;
  }

  const adminNavItems = (
    <>
      <Link
        to="/administrador/home"
        className={`nav-item${getNavItemClass("/administrador/home")}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="iconSideBar"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 13m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
          <path d="M13.45 11.55l2.05 -2.05" />
          <path d="M6.4 20a9 9 0 1 1 11.2 0z" />
        </svg>
        Estadisticas
      </Link>
      <Link
        to="/administrador/usuarios"
        className={`nav-item${getNavItemClass("/administrador/usuarios")}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="iconSideBar"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
          <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
        </svg>
        Usuarios
      </Link>
      <Link
        to="/administrador/proyectos"
        className={`nav-item${getNavItemClass("/administrador/proyectos")}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="iconSideBar"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M20 6h-13a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h13" />
          <path d="M13 12a2 2 0 1 1 -4 0a2 2 0 0 1 4 0" />
          <path d="M13 12h7" />
        </svg>
        Proyectos
      </Link>
      <Link
        to="/administrador/crear-convocatoria"
        className={`nav-item${getNavItemClass(
          "/administrador/crear-convocatoria"
        )}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="iconSideBar"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4 5h2" />
          <path d="M5 4v2" />
          <path d="M11.5 4l-.5 2" />
          <path d="M18 5h2" />
          <path d="M19 4v2" />
          <path d="M15 9l-1 1" />
          <path d="M18 13l2 -.5" />
          <path d="M18 19h2" />
          <path d="M19 18v2" />
          <path d="M14 16.518l-6.518 -6.518l-4.39 9.58a1 1 0 0 0 1.329 1.329l9.579 -4.39z" />
        </svg>
        Crear Convocatoria
      </Link>
      <Link
        to="/administrador/convocatorias"
        className={`nav-item${getNavItemClass("/administrador/convocatorias")}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="iconSideBar"
        >
          <path d="M4 4h16v16H4z" />
          <path d="M12 12l8-8" />
        </svg>
        Convocatorias
      </Link>
      <Link
        to="/administrador/perfil"
        className={`nav-item${getNavItemClass("/administrador/perfil")}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="iconSideBar"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
          <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
        </svg>
        Perfil
      </Link>
    </>
  );

  const userNavItems = (
    <>
      <Link
        to="/usuarios/convocatorias"
        className={`nav-item${getNavItemClass("/usuarios/convocatorias")}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="iconSideBar"
        >
          <path d="M4 4h16v16H4z" />
          <path d="M12 12l8-8" />
        </svg>
        <p>Convocatorias</p>
      </Link>
      <Link
        to="/usuarios/plantillas"
        className={`nav-item${getNavItemClass("/usuarios/plantillas")}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="iconSideBar"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M4.929 4.929a10 10 0 1 1 14.141 14.141a10 10 0 0 1 -14.14 -14.14zm8.071 4.071a1 1 0 1 0 -2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0 -2h-2v-2z" />
        </svg>
        <p>Crear Proyecto</p>
      </Link>
      <Link
        to="/usuarios/misproyectos"
        className={`nav-item${getNavItemClass("/usuarios/misproyectos")}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="iconSideBar"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M21 16.008v-8.018a1.98 1.98 0 0 0 -1 -1.717l-7 -4.008a2.016 2.016 0 0 0 -2 0l-7 4.008c-.619 .355 -1 1.01 -1 1.718v8.018c0 .709 .381 1.363 1 1.717l7 4.008c.62 .354 1.38 .354 2 0l7 -4.008c.619 -.355 1 -1.01 1 -1.718z" />
          <path d="M12 22v-10" />
          <path d="M12 12l8.73 -5.04" />
          <path d="M3.27 6.96l8.73 5.04" />
          <path d="M12 17l3.003 -1.668m3 -1.667l2.997 -1.665m-9 5l-9 -5" />
          <path d="M15 17l3 -1.67v-3l-3 1.67z" />
        </svg>
        <p>Mis Proyectos</p>
      </Link>
      
      <Link
        to="/usuarios/perfil"
        className={`nav-item${getNavItemClass("/usuarios/perfil")}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="iconSideBar"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
          <path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
          <path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" />
        </svg>
        <p>Perfil</p>
      </Link>
    </>
  );

  return (
    <div className="custom-sidebar-bg">
      <div className="sidebar-header">
        <img
          src="https://sena.edu.co/Style%20Library/alayout/images/logoSena.png"
          alt="sena logo"
          style={{ width: "60px", height: "60px" }}
        />
        <img
          src="https://sennovacaag.wordpress.com/wp-content/uploads/2020/09/sennova-logo.png"
          alt="sennova logo"
        />
      </div>
      <div className="sidebar-nav">
        {user === "Administrador" ? adminNavItems : userNavItems}
        <div className="sidebar-footer">
          <button type="button" onClick={logout}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className=""
            >
              <path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <path d="M15 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
              <path d="M21 12h-13l3 -3" />
              <path d="M11 15l-3 -3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
