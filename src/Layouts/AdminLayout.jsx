import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../Components/SideBar";
import AuthUser from "../../utils/AuthUser";
import NotificationModal from "../Components/NotificationModal";
import Background from "../Components/background";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [isModalOpen, setModalOpen] = useState(false);

  let currentRoute = location.pathname;

  useEffect(() => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      AuthUser(accessToken, (userData) => {
        setUser(userData); 
        setLoading(false); 
      }, navigate, currentRoute);
    } else {
      console.error("No hay token de acceso disponible");
      navigate('/login');
    }
  }, []);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  if (loading) {
    return (
      <div className="app-container">
      <div className="content-wrapper">
        <div className="main-content mb-96">  
          <button onClick={openModal} className="notificationBtn">
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
      <Sidebar />
      <NotificationModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
    ); 
  }

  

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="main-content mb-96">
          {/* <Pattern/> */}
          {children}
          <button onClick={openModal} className="notificationBtn">
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
      <Sidebar />
      <NotificationModal
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default AdminLayout;
