import React, { useState, useEffect } from 'react';
import { CCard, CCardBody, CCardTitle, CCardText, CButton } from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css';
import axios from 'axios';
import SkeletonCard from './SkeletonCard';
import { useNavigate } from 'react-router-dom';

const VITE_API_URL = import.meta.env.VITE_API_URL

const ProjectOverviewCard = ({ data }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${VITE_API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  const isUser = user ? user.sub.role === 'Usuario' : false;

  const getBackgroundColor = (estado) => {
    switch (estado) {
      case 'revisado':
        return 'bg-green-200';
      case 'En progreso':
        return 'bg-orange-400';
      case 'rechazado':
        return 'bg-red-200';
      default:
        return 'bg-gray-200';
    }
  };

  if (loading) {
    return (
      <SkeletonCard/>
    );
  }

  const handleReviewClick = () => {
    if (isUser) {
      navigate('/usuarios/review', { state: { projectId: data._id } });
    } else {
      navigate('/administrador/review', { state: { projectId: data._id } });
    }
  };

  return (
    <CCard className={`project-overview-card ${getBackgroundColor(data.estado)}`}>
      <CCardBody>
        <CCardTitle>{data.titulo}</CCardTitle>
        <CCardText className="card-description">{data.descripcion}</CCardText>
        <div className='stateAndButton'>
          {isUser ? (
            <CCardText>
              <span className="status-label">{data.estado}</span>
            </CCardText>
          ) : (
            <CCardText>
              <span className="created-by-label">Creado por:</span> {data.usuarioId?.nombre} {data.usuarioId?.apellido}
            </CCardText>
          )}
          <CButton className='ThirdButton' onClick={handleReviewClick}>
            {isUser ? 'Ver' : 'Revisar'}
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  );
};

export default ProjectOverviewCard;
