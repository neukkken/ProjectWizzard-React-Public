import React, { useEffect, useState } from 'react';
import Loader from '../Components/Loader';

const VITE_API_URL = import.meta.env.VITE_API_URL

const RevisionHistory = ({ projectId, isOpen, onClose }) => {
  const [revisiones, setRevisiones] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (isOpen) {
      const fetchRevisiones = async () => {
        try {
          const response = await fetch(`${VITE_API_URL}/proyectos/${projectId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
          }

          const data = await response.json();
          setRevisiones((data.revisiones || []).reverse());
        } catch (error) {
          console.error("Error al obtener las revisiones:", error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchRevisiones();
    }
  }, [isOpen, projectId, token]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event) => {
      if (event.target.classList.contains('modal-overlay')) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  if(!revisiones) {
    return (
      <Loader/>
    )
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h4>Historial de Revisiones</h4>
        {loading && <Loader />}
        {error && <p className="error">{error}</p>}
        {revisiones.length > 0 ? (
          <ul>
            {revisiones.map((revision, index) => {
              const fecha = new Date(revision.fechaRevision);
              const fechaFormateada = fecha.toString() === 'Invalid Date' ? 'Fecha inválida' : fecha.toLocaleString();

              return (
                <li style={{ display: "flex", flexDirection: "column"}} key={index}>
                  <p className='StateLabelRev'>{revision.titulo}</p>
                  
                  <strong>Estado:</strong> {revision.estado}
                
                  <strong>Fecha:</strong> {fechaFormateada}
                  {revision.estado === 'Desaprobado' && (
                    <>
                      <br />
                      <strong style={{backgroundColor: "red", borderRadius: "5px", color: "white", width: "fit-content", padding: "0px 5px"}}>Sugerencia</strong> {revision.sugerencia || 'No hay sugerencia'}
                    </>
                  )}
                  {revision.titulo.toLowerCase() === "objetivos especificos" || revision.titulo.toLowerCase() === "objetivos específicos" ? (
                    <ul>
                      {revision.descripcion
                        .split("\n")
                        .filter((line) => /^\d+\./.test(line))
                        .map((objetivo, objetivoIndex) => (
                          <li style={{ marginTop: "5px", borderBottom: 'none' }} key={objetivoIndex}>{objetivo.trim()}</li>
                        ))}
                    </ul>
                  ) : (
                    <p>{revision.descripcion}</p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          !loading && <p>No hay revisiones disponibles para este proyecto.</p>
        )}
        {loading && <Loader/>}
      </div>
    </div>
  );
};

export default RevisionHistory;