import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Loader from "../../Components/Loader";
import AdminLayout from "../../Layouts/AdminLayout";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType } from "docx";
import jsPDF from "jspdf";
import { Modal, Button, Form } from "react-bootstrap";
import RevisionHistory from "../../Components/RevisionHistory";
import { useNavigate } from "react-router-dom";
import { FileArchiveIcon, FileJson, HistoryIcon, Trash, Edit } from 'lucide-react';

const VITE_API_URL = import.meta.env.VITE_API_URL

const UserReview = () => {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editedProjectData, setEditedProjectData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = location.state?.projectId;

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (projectId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await axios.get(
            `${VITE_API_URL}/proyectos/${projectId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          setProjectData(response.data);
          setEditedProjectData(response.data);
        } catch (error) {
          console.error("Error al obtener los datos del proyecto:", error);
          setError("Error al obtener los datos del proyecto");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setError("No se proporcionó un ID de proyecto.");
      setLoading(false);
    }
  }, [projectId]);

  

  const handleInputChange = (e, seccionIndex = null, tipoIndex = null, field = null) => {
    const { name, value } = e.target;

    if (seccionIndex !== null && tipoIndex !== null && field) {
      setEditedProjectData((prevData) => {
        const updatedSecciones = [...prevData.secciones];
        updatedSecciones[seccionIndex].tipoSeccion[tipoIndex][field] = value;
        return { ...prevData, secciones: updatedSecciones };
      });
    } else {
      setEditedProjectData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleEdit = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  // Función para actualizar una sección específica
  const updateSeccion = async (seccion) => {
    try {
      const response = await axios.patch(
        `${VITE_API_URL}/seccion/${seccion._id}`,
        {
          proyecto: projectId,
          tipoSeccion: seccion.tipoSeccion,
          fechaCreacion: seccion.fechaCreacion,
          __v: seccion.__v,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    } catch (error) {
      console.error(`Error al actualizar la sección ${seccion._id}:`, error);
      throw error;
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true)

    try {
      // Primero actualizamos las secciones
      const seccionesPromises = editedProjectData.secciones.map((seccion) =>
        updateSeccion(seccion)
      );

      await Promise.all(seccionesPromises);

      // Luego actualizamos el proyecto
      const dataToSend = { ...editedProjectData };

      // Actualiza el estado del proyecto a "En Progreso"
      dataToSend.estado = "En progreso";

      delete dataToSend.usuarioId;

      console.log("Datos a enviar:", dataToSend);
      console.log("ID del proyecto:", projectId);

      const response = await axios.patch(
        `${VITE_API_URL}/proyectos/${projectId}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Respuesta del servidor:", response);

      setProjectData(editedProjectData);
      setShowModal(false);
      setLoading(false)
    } catch (error) {
      console.error(
        "Error al guardar los cambios:",
        error.response ? error.response.data : error.message
      );
      setError("Error al guardar los cambios");
      setLoading(false)
    }
  };


  const handleViewRevisionHistory = async () => {
    try {
      const response = await axios.get(`${VITE_API_URL}/revision/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      // Process the response data as needed
      setProjectData(response.data);
    } catch (error) {
      console.error('Error al obtener el historial de revisiones:', error);
      // Handle error
    }
  };

  const generateDocx = () => {
    if (!projectData.secciones || !Array.isArray(projectData.secciones)) {
        console.error("No secciones disponibles o formato incorrecto");
        return;
    }

    const doc = new Document({
        sections: [
            {
                properties: {
                    top: 720,
                    right: 720,
                    bottom: 720,
                    left: 720,
                },
                children: [
                    new Paragraph({
                        text: projectData.titulo,
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: `Descripción: ${projectData.descripcion}`,
                        spacing: { after: 300 },
                    }),
                    new Paragraph({
                        text: `Fecha: ${projectData.fecha}`,
                        spacing: { after: 300 },
                    }),
                    new Paragraph({
                        text: `Estado: ${projectData.estado}`,
                        spacing: { after: 300 },
                    }),
                    new Paragraph({
                        text: "Secciones:",
                        heading: HeadingLevel.HEADING_2,
                        spacing: { after: 300 },
                    }),
                    ...projectData.secciones.flatMap((seccion) =>
                        seccion.tipoSeccion.flatMap((tipo) => {
                            if (tipo.nombre.toLowerCase() === "objetivos especificos") {
                                const listaObjetivos = tipo.contenido
                                    .split("\n")
                                    .filter((line) => /^\d+\./.test(line))
                                    .map((line) => line.trim());

                                return [
                                    new Paragraph({
                                        text: tipo.nombre,
                                        heading: HeadingLevel.HEADING_3,
                                        spacing: { after: 200 },
                                    }),
                                    ...listaObjetivos.map(
                                        (objetivo) =>
                                            new Paragraph({
                                                text: objetivo,
                                                bullet: { level: 0 },
                                                spacing: { after: 200 },
                                            })
                                    ),
                                ];
                            }
                            return [
                                new Paragraph({
                                    text: tipo.nombre,
                                    heading: HeadingLevel.HEADING_3,
                                    spacing: { after: 200 },
                                }),
                                ...tipo.contenido.split("\n").map(
                                    (line) =>
                                        new Paragraph({
                                            text: line.trim(),
                                            spacing: { after: 200 },
                                        })
                                ),
                            ];
                        })
                    ),
                ],
            },
        ],
    });

    Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `PROJECTWIZZARD - ${projectData.titulo}.docx`);
    });
};

  const generatePdf = () => {
    if (!projectData) {
      console.error("No hay datos del proyecto para generar el PDF.");
      return;
    }
  
    const doc = new jsPDF("p", "mm", "a4");
    const margin = 15;
    let yOffset = margin;
  
    // Función para agregar texto y controlar el desbordamiento
    const addText = (text, fontSize, fontStyle = "normal") => {
      doc.setFontSize(fontSize);
      doc.setFont("Helvetica", fontStyle);
      
      // Dividir el texto en líneas que se ajusten al ancho de la página
      const lines = doc.splitTextToSize(text, doc.internal.pageSize.width - 2 * margin);
      
      // Agregar cada línea al PDF
      lines.forEach(line => {
        doc.text(line, margin, yOffset);
        yOffset += fontSize * 1.2; // Incrementar la posición vertical
        // Comprobar si se necesita un salto de página
        if (yOffset > doc.internal.pageSize.height - margin) {
          doc.addPage();
          yOffset = margin; // Reiniciar la posición vertical
        }
      });
    };
  
    addText(`Título: ${projectData.titulo}`, 16, "bold");
    addText(`Descripción: ${projectData.descripcion}`, 12);
    addText(`Fecha: ${projectData.fecha}`, 12);
    addText(`Estado: ${projectData.estado}`, 12);
  
    projectData.secciones.forEach((seccion) => {
      seccion.tipoSeccion.forEach((tipo) => {
        addText(tipo.nombre, 14, "bold");
        addText(tipo.contenido, 12);
      });
    });
  
    doc.save(`PROJECTWIZZARD - ${projectData.titulo}.pdf`);
  };
  
  

  const deleteProject = async () => {
    setLoading(true)

    const response = await axios.delete(`${VITE_API_URL}/proyectos/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.status == 200) {
      setLoading(false)
      navigate('/usuarios/misproyectos')
      return (
        <>
          su proyecto fue borrado
        </>
      )
    } else {
      setLoading(false)
      console.error(response)
    }


  }

  function obtenerFechaSimple(fechaISO) {
    const fecha = new Date(fechaISO);

    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${año}/${mes}/${dia}`;
  }

  if (loading) return <Loader />;
  if (error) return <div className="error-mensaje">{error}</div>;
  if (projectData === null) {
    <Loader />
  }

  return (
    <AdminLayout>
      <div className="detalles-proyecto">

        <div className="headerProyecto">
          <h3>{projectData.titulo}</h3>
          <aside>
            <p>Fecha: {obtenerFechaSimple(projectData.fecha)}</p>
            <p>Estado: {projectData.estado}</p>

            {projectData.convocatoria !== null ? (
              <p>Convocatoria: {projectData.convocatoria.title}</p>
            ) : (<p>Sin convocatoria</p>)}


          </aside>
        </div>
        <hr />
        <h5>Descripcion del proyecto:</h5>
        <p>{projectData.descripcion}</p>

        <hr />

        {projectData.secciones && projectData.secciones.length > 0 ? (
          projectData.secciones.map((seccion, index) => (
            <div key={index}>
              {seccion.tipoSeccion.map((tipo, tipoIndex) => (
                <div key={tipoIndex}>
                  <h5>{tipo.nombre}</h5>
                  {tipo.nombre.toLowerCase() === "objetivos especificos" || tipo.nombre.toLowerCase() === "objetivos específicos" ? (
                    <ul>
                      {tipo.contenido
                        .split("\n")
                        .filter((line) => /^\d+\./.test(line))
                        .map((objetivo, objetivoIndex) => (
                          <li style={{ marginTop: "5px" }} key={objetivoIndex}>{objetivo.trim()}</li>
                        ))}
                    </ul>
                  ) : (
                    <p>{tipo.contenido}</p>
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
          <button className='ReviewButton' onClick={generateDocx}>
            <FileArchiveIcon style={{ marginRight: '8px' }} /> Generar Documento Word
          </button>

          {/* <button className='ReviewButton' onClick={generatePdf}>
            <FileJson style={{ marginRight: '8px' }} /> Generar Documento PDF
          </button> */}
          <>
            <button className='ReviewButton' onClick={() => {
              handleViewRevisionHistory();
              setIsHistoryModalOpen(true);
            }}>
              <HistoryIcon style={{ marginRight: '8px' }} />
              Ver Historial de Revisiones
            </button>

            {isHistoryModalOpen && (
              <RevisionHistory
                projectId={projectId}
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
              />
            )}
          </>

          {projectData.estado === 'Revisado' && (
            <button className='editButton' onClick={handleEdit}>
              <Edit style={{ marginRight: '8px' }}/>
              Editar
            </button>
          )}

          <button
            className="deleteItem"
            type="button"
            onClick={deleteProject}
            disabled={loading}
          >
            {loading ? <><Trash style={{ marginRight: '8px' }}/> Eliminando...</> : <><Trash /> </>}
          </button>
        </div>



        <Modal style={{ width: '100%', height: '100%', overflowY: 'auto', margin: 'auto' }} show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Editar Proyecto</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editedProjectData && (
              <>
                <Form.Group>
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    type="text"
                    name="titulo"
                    value={editedProjectData.titulo}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="descripcion"
                    value={editedProjectData.descripcion}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                {editedProjectData.secciones.map((seccion, seccionIndex) => (
                  <div key={seccionIndex}>
                    {seccion.tipoSeccion.map((tipo, tipoIndex) => (
                      <Form.Group key={tipoIndex}>
                        <Form.Label>{tipo.nombre}</Form.Label>
                        <Form.Control
                          as="textarea"
                          value={tipo.contenido}
                          onChange={(e) =>
                            handleInputChange(e, seccionIndex, tipoIndex, "contenido")
                          }
                        />
                      </Form.Group>
                    ))}
                  </div>
                ))}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cerrar
            </Button>
            <button className="ThirdButton" onClick={handleSaveChanges} disabled={loading}>
              Guardar Cambios
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default UserReview;