import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminLayout from "../../Layouts/AdminLayout";
import Loader from "../../Components/Loader";

const VITE_API_URL = import.meta.env.VITE_API_URL

const Convocatorias = () => {
  const [convocatorias, setConvocatorias] = useState([]);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  function formatDateTransform(dateString) {
    if (!dateString) return "Fecha no disponible";
    return dateString.split("T")[0];
  }

  const documentIconUrl = "https://img.icons8.com/carbon-copy/100/document.png";

  useEffect(() => {
    const fetchConvocatorias = async () => {
      try {
        const response = await axios.get(
          `${VITE_API_URL}/convocatoria`
        );
        setConvocatorias(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar las convocatorias:", err);
        setError(`Error al cargar las convocatorias: ${err.message}`);
        setLoading(false);
      }
    };

    fetchConvocatorias();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "Fecha no disponible";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Fecha inválida" : date.toLocaleDateString();
  };

  const handleConvocatoriaSelect = (convocatoria) => {
    setSelectedConvocatoria(convocatoria);
    setShowModal(true);
  };

  const handleFileDownload = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const filteredConvocatorias = convocatorias.filter((convocatoria) =>
    convocatoria.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    convocatoria.estado === "Activa"
  );
  

  if (loading) return <Loader />;

  return (
    <AdminLayout>
      <input
        className="searchInput"
        type="text"
        placeholder="Buscar convocatoria"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="cardsContainer">
        {filteredConvocatorias.length === 0 ? (
          <p>No hay convocatorias disponibles</p>
        ) : (
          filteredConvocatorias.map((convocatoria) => (
            <div
              className="convocatoriaCard"
              key={convocatoria._id}
              onClick={() => handleConvocatoriaSelect(convocatoria)}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "16px",
                cursor: "pointer",
              }}
            >
              <img src="https://us.123rf.com/450wm/keronn/keronn2211/keronn221100104/196659260-female-doctor-writing-medical-prescription-woman-in-white-medical-coat-sitting-at-table-and-write.jpg" alt="convocatoria img" />
              <h3 style={{height: '50px', overflow: 'hidden'}}>{convocatoria.title || "Convocatoria sin título"}</h3>
              <p style={{height: '100px', overflow: 'hidden'}}>{convocatoria.descripcion || "Sin descripción"}</p>
              <section>
                <p>{formatDateTransform(convocatoria.fechaInicio)}</p>
                <button className='editButton'>Ver detalles</button>
              </section>
            </div>
          ))
        )}
      </div>


      {showModal && selectedConvocatoria && (
        <>
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 999,
            }}
            onClick={closeModal}
          />
          <div
            style={{
              position: "absolute",
              margin: '50px 0px',
              top: 0,
              left: 0,
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              zIndex: 1000,
              width: "80%",
              boxShadow: "0px 4px 8px rgba(0, 0, 3, 0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                {selectedConvocatoria.title || "Título no disponible"}
              </h2>
              <button onClick={closeModal} className="closeButton">
                X
              </button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <strong>Descripción:</strong>
              <p>
                {selectedConvocatoria.descripcion ||
                  "Descripción no disponible"}
              </p>
            </div>
            <section
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <strong>Fecha de inicio:</strong>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M11.795 21h-6.795a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4" />
                    <path d="M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                    <path d="M15 3v4" />
                    <path d="M7 3v4" />
                    <path d="M3 11h16" />
                    <path d="M18 16.496v1.504l1 1" />
                  </svg>
                  {formatDate(selectedConvocatoria.fechaInicio)}
                </p>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Fecha de cierre:</strong>
                <p
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.2rem",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M11.795 21h-6.795a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v4" />
                    <path d="M18 18m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                    <path d="M15 3v4" />
                    <path d="M7 3v4" />
                    <path d="M3 11h16" />
                    <path d="M18 16.496v1.504l1 1" />
                  </svg>
                  {formatDate(selectedConvocatoria.fechaCierre)}
                </p>
              </div>
            </section>

            {selectedConvocatoria.files ? (
              <div
                style={{
                  marginBottom: "1rem",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <strong>Archivos:</strong>
                <button
                  onClick={() => handleFileDownload(selectedConvocatoria.files)}
                  className="downloadFiles"
                >
                  <img
                    src={documentIconUrl}
                    alt="Documento"
                    style={{
                      width: "45px",
                      height: "45px",
                      marginRight: "5px",
                    }}
                  />
                  <p style={{ display: "flex", alignItems: "center", gap: "0.2rem", justifyContent: "center", margin: "0px" }}>
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
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                      <path d="M7 11l5 5l5 -5" />
                      <path d="M12 4l0 12" />
                    </svg>
                    Descargar Archivo
                  </p>
                </button>
              </div>
            ) : (
              <p>No hay archivos disponibles</p>
            )}
            {selectedConvocatoria.template && (
              <div style={{ marginBottom: "1rem" }}>
                <strong style={{ marginBottom: "10px" }}>Plantilla:</strong>
                {Array.isArray(selectedConvocatoria.template) ? (
                  JSON.parse(selectedConvocatoria.template[0]).map((section, index) => (
                    <p style={{fontWeight: "normal"}} key={index}>- {section.titulo || "Plantilla no disponible"}</p>
                  ))
                ) : (
                  <p>No hay plantilla disponible</p>
                )}
              </div>
            )}

          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default Convocatorias;
