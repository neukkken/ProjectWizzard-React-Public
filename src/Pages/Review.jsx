import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../Layouts/AdminLayout';
import Loader from '../Components/Loader';
import RevisionHistory from "../Components/RevisionHistory";
import { HistoryIcon, Check, X } from 'lucide-react';

const VITE_API_URL = import.meta.env.VITE_API_URL

const Review = () => {
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState(null);
  const [aprobacionMensaje, setAprobacionMensaje] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRev, setIsRev] = useState(false);

  const location = useLocation();
  const projectId = location.state?.projectId;
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!projectId) {
      setError("No se ha proporcionado un ID de proyecto.");
      return;
    }

    const fetchProjectData = async () => {
      try {
        const response = await axios.get(`${VITE_API_URL}/proyectos/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setProjectData(response.data);
      } catch (err) {
        setError("Error al obtener los datos del proyecto.");
        console.error("Error al obtener los datos del proyecto:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId, token]);

  const handleAprobacion = async (esAprobado, seccionIndex, tipoIndex) => {
    if (!projectData) return;

    const seccion = projectData.secciones[seccionIndex];
    const tipo = seccion.tipoSeccion[tipoIndex];

    if (tipo.revision) {
      alert('Esta sección ya ha sido revisada.');
      return;
    }

    const estado = esAprobado ? "Aprobado" : "Desaprobado";
    const sugerencia = esAprobado ? "Sin sugerencias" : prompt("Por favor, ingrese una sugerencia:");

    const nuevaRevision = {
      estado,
      sugerencia,
      descripcion: tipo.contenido,
      titulo: tipo.nombre,
      usuario: projectData.usuarioId._id,
      seccion: seccion._id,
      proyecto: projectData._id,
      fechaRevision: new Date().toISOString(),
    };

    try {
      setIsRev(true)
      await axios.post(`${VITE_API_URL}/revision`, nuevaRevision, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const updatedSecciones = [...projectData.secciones];
      updatedSecciones[seccionIndex].tipoSeccion[tipoIndex].revision = nuevaRevision;

      const algunaSeccionDesaprobada = updatedSecciones.some(seccion =>
        seccion.tipoSeccion.some(tipo => tipo.revision && tipo.revision.estado === 'Desaprobado')
      );

      const todasSeccionesRevisadasYAprobadas = updatedSecciones.every(seccion =>
        seccion.tipoSeccion.every(tipo => tipo.revision && tipo.revision.estado === 'Aprobado')
      );

      let nuevoEstado = 'Revisado';
      if (todasSeccionesRevisadasYAprobadas) {
        nuevoEstado = 'Completado';
      }

      await axios.patch(`${VITE_API_URL}/proyectos/${projectId}`, {
        estado: nuevoEstado,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setProjectData(prevData => ({
        ...prevData,
        estado: nuevoEstado,
        revisiones: [
          ...(prevData.revisiones || []),
          nuevaRevision,
        ],
        secciones: updatedSecciones,
      }));

      setAprobacionMensaje({
        texto: esAprobado ? "¡Sección aprobada con éxito!" : "La sección ha sido desaprobada.",
        tipo: esAprobado ? "aprobado" : "no-aprobado",
      });
      setTimeout(() => setAprobacionMensaje(null), 3000);

    } catch (error) {
      console.error('Error al guardar la revisión:', error.response?.data || error.message);
      setError('Error al realizar la aprobación.');
    } finally {
      setIsRev(false)
    }
  };

  const handleRevisarErrores = async () => {
    if (!projectData) return;

    const algunaSeccionDesaprobada = projectData.secciones.some(seccion =>
      seccion.tipoSeccion.some(tipo => tipo.revision && tipo.revision.estado === 'Desaprobado')
    );

    if (algunaSeccionDesaprobada) {
      try {
        await axios.patch(`${VITE_API_URL}/proyectos/${projectId}`, {
          estado: 'Revisado con Errores',
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setProjectData(prevData => ({
          ...prevData,
          estado: 'Revisado con Errores',
        }));

        setAprobacionMensaje({
          texto: "El estado del proyecto se ha actualizado a 'Revisado con Errores'.",
          tipo: "error",
        });
        setTimeout(() => setAprobacionMensaje(null), 3000);

      } catch (error) {
        console.error('Error al actualizar el estado del proyecto:', error.response?.data || error.message);
        setError('Error al actualizar el estado del proyecto.');
      }
    } else {
      alert('No hay secciones en estado "Desaprobado".');
    }
  };

  function obtenerFechaSimple(fechaISO) {
    const fecha = new Date(fechaISO);

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${año}/${mes}/${dia}`;
  }

  if (loading) return <Loader />;
  if (!projectData) return <p>No se encontró la información del proyecto.</p>;

  return (
    <AdminLayout>
      <div className="contenedor-revision">
        {aprobacionMensaje && (
          <div style={{position: "fixed", bottom: "0%", right: "1%"}} className={`mensaje-aprobacion ${aprobacionMensaje.tipo}`}>
            {aprobacionMensaje.texto}
          </div>
        )}
        <div className="detalles-proyecto">


          <div className="headerProyecto">
            <h3>{projectData.titulo}</h3>
            <aside>
              <p>Fecha: {obtenerFechaSimple(projectData.createdAt)}</p>
              <p>Estado: {projectData.estado}</p>

              {projectData.convocatoria !== null ? (
                <p>Convocatoria: {projectData.convocatoria.title}</p>
              ) : (<p>Sin convocatoria</p>)}
            </aside>
          </div>
          <div className="headerProyecto" style={{ marginBottom: '1em' }}>

            <strong>Creado por:</strong>
            <aside>
              <p> {projectData.usuarioId?.nombre} {projectData.usuarioId?.apellido}</p>
            </aside>
          </div>
          {projectData.secciones && projectData.secciones.length > 0 ? (
            projectData.secciones.map((seccion, seccionIndex) => (
              <div key={seccionIndex} className="item-seccion">
                {seccion.tipoSeccion.map((tipo, tipoIndex) => (
                  <div key={tipoIndex}>
                    <h4>{tipo.nombre}</h4>
                    {tipo.nombre.toLowerCase() === "objetivos especificos" || tipo.nombre.toLowerCase() === "objetivos específicos" ? (
                      <ul>
                        {tipo.contenido
                          .split("\n")
                          .filter((line) => /^\d+\./.test(line))
                          .map((objetivo, objetivoIndex) => (
                            <li style={{ marginTop: "5px" }} key={objetivoIndex}>
                              {objetivo.trim()}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p>{tipo.contenido}</p>
                    )}
                    {!tipo.revision ? (
                      <div className="iconos-aprobacion">
                        <span className="icono-aprobado" onClick={() => handleAprobacion(true, seccionIndex, tipoIndex)}>
                          {isRev ? ('...') : ('Aprobar')}
                        </span>
                        <span className="icono-no-aprobado" onClick={() => handleAprobacion(false, seccionIndex, tipoIndex)}>
                          {isRev ? ('...') : ('Dar sugerencia')}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <p><strong>Estado de la revisión:</strong> {tipo.revision.estado}</p>
                        {tipo.revision.sugerencia && (
                          <p><strong>Sugerencia:</strong> {tipo.revision.sugerencia}</p>
                        )}
                      </div>
                    )}
                    <hr />
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p>No hay secciones disponibles.</p>
          )}
          <div className="ReviewButtonContainer">
            <button className='ReviewButton' onClick={() => setIsHistoryModalOpen(true)}>
              <HistoryIcon style={{ marginRight: '8px' }} />
              Ver Historial de Revisiones
            </button>
          </div>
        </div>
      </div>
  
      {isHistoryModalOpen && (
        <RevisionHistory
          projectId={projectId}
          isOpen={isHistoryModalOpen}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}
    </AdminLayout>
  );
};

export default Review;
