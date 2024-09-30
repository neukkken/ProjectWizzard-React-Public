import React, { useEffect, useState } from 'react';
import AdminLayout from '../../Layouts/AdminLayout';
import axios from 'axios';
import Loader from '../../Components/Loader';
import { Edit2Icon, Trash } from 'lucide-react';

const VITE_API_URL = import.meta.env.VITE_API_URL

export default function AdminConvocatoria() {
  const [convocatorias, setConvocatorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [hasEdited, setHasEdited] = useState(false);
  const [isDeleting, setIsDeliting] = useState(false);

  const [convocatoriaData, setConvocatoriaData] = useState({
    title: "",
    descripcion: "",
    fechaInicio: "",
    fechaCierre: "",
    template: [],
  });

  const [formData, setFormData] = useState({
    title: "",
    descripcion: "",
    fechaInicio: "",
    fechaCierre: "",
    estado: "Activa",
    template: [{ titulo: "" }],
  });

  function formatDateTransform(dateString) {
    if (!dateString) return "Fecha no disponible";
    return dateString.split("T")[0];
  }


  useEffect(() => {
    if (selectedConvocatoria !== null) {
      setConvocatoriaData({
        title: selectedConvocatoria.title || "",
        descripcion: selectedConvocatoria.descripcion || "",
        fechaInicio: selectedConvocatoria.fechaInicio || "",
        fechaCierre: selectedConvocatoria.fechaCierre || "",
        template: selectedConvocatoria.template ? JSON.parse(selectedConvocatoria.template[0]) : [],
      });
    }
  }, [selectedConvocatoria]);

  const handleChange = (e) => {
    setHasEdited(true);
    const { name, value } = e.target;
    setConvocatoriaData({
      ...convocatoriaData,
      [name]: value,
    });
  };

  const handleTemplateChange = (index, value) => {
    setHasEdited(true);
    const newTemplate = [...convocatoriaData.template];
    newTemplate[index] = {
      ...newTemplate[index],
      titulo: value,
    };
    setConvocatoriaData({
      ...convocatoriaData,
      template: newTemplate,
    });

    console.log(convocatoriaData.template)
  };


  useEffect(() => {
    const fetchConvocatorias = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${VITE_API_URL}/convocatoria`);
        setConvocatorias(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar las convocatorias:", err);
        setLoading(false);
      }
    };

    fetchConvocatorias();
  }, [showModal]);

  const filteredConvocatorias = convocatorias.filter((convocatoria) =>
    convocatoria.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConvocatoriaSelect = (convocatoria) => {
    setSelectedConvocatoria(convocatoria);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setHasEdited(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    formData.title = convocatoriaData.title;
    formData.descripcion = convocatoriaData.descripcion;
    formData.fechaInicio = convocatoriaData.fechaInicio;
    formData.fechaCierre = convocatoriaData.fechaCierre;

    if (convocatoriaData.template.length > 0) {
      const formattedTemplate = JSON.stringify(
        convocatoriaData.template.map(item => ({ titulo: item.titulo }))
      );
      formData.template = formattedTemplate;
    }

    try {
      setLoading(true);
      const response = await axios.patch(`${VITE_API_URL}/convocatoria/${selectedConvocatoria._id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        closeModal();
      }
    } catch (error) {
      console.error('Error al editar la convocatoria:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConvocatoria = async () => {
    try {
      setIsDeliting(true);
      const response = await axios.delete(`${VITE_API_URL}/convocatoria/${selectedConvocatoria._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        closeModal();
      }
    } catch (error) {
      console.error('Error al editar la convocatoria:', error);
    } finally {
      setIsDeliting(false);
    }
  }


  if (!convocatorias) return <Loader />;

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
              <p style={{ height: '100px', overflow: 'hidden' }}>{convocatoria.descripcion || "Sin descripción"}</p>
              <section>
                <p>{new Date(convocatoria.fechaInicio).toLocaleDateString()}</p>
                  <button className='editButton'><Edit2Icon size={'15px'} style={{ marginRight: "5px" }} />Editar</button>
              </section>
            </div>
          ))
        )}

        {showModal && selectedConvocatoria && (
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
                top: 0,
                left: 0,
                margin: '50px 0px',
                position: "absolute",
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "8px",
                zIndex: 1000,
                width: "80%",
                boxShadow: "0px 4px 8px rgba(0, 0, 3, 0.5)",
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {"Editando convocatoria: " + (selectedConvocatoria.title || "Título no disponible")}
                </h2>
                <button onClick={closeModal} className="closeButton">X</button>
              </div>

              <form onSubmit={handleSubmit}>

                <div style={{ marginBottom: "1rem" }} className='editConvocatoriaForm'>
                  <strong>Titulo:</strong>
                  <input
                    type="text"
                    name="title"
                    value={convocatoriaData.title}
                    onChange={handleChange}
                    placeholder="titulo no disponible"
                  />
                </div>

                <div style={{ marginBottom: "1rem" }} className='editConvocatoriaForm'>
                  <strong>Descripción:</strong>
                  <textarea
                    name="descripcion"
                    value={convocatoriaData.descripcion}
                    onChange={handleChange}
                    placeholder="Descripción no disponible"
                    rows="5" 
                    style={{ width: '100%', resize: 'vertical' }} 
                  />

                </div>

                <div style={{ marginBottom: "1rem" }} className='editConvocatoriaForm'>
                  <strong>Fecha de inicio:</strong>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={formatDateTransform(convocatoriaData.fechaInicio)}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() + 100)).toISOString().split("T")[0]}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }} className='editConvocatoriaForm'>
                  <strong>Fecha de cierre:</strong>
                  <input
                    type="date"
                    name="fechaCierre"
                    value={formatDateTransform(convocatoriaData.fechaCierre)}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() + 100)).toISOString().split("T")[0]}
                  />
                </div>
                <strong>Plantilla:</strong>
                {convocatoriaData.template.map((templateItem, index) => (
                  <div key={index} style={{ marginBottom: "1rem" }} className='editConvocatoriaForm'>
                    <input
                      type="text"
                      value={templateItem.titulo || ""}
                      onChange={(e) => handleTemplateChange(index, e.target.value)}
                      placeholder="Nombre de la sección"
                    />
                  </div>
                ))}
                <div className="buttonsActions">
                {
                  hasEdited ? (
                    <button
                      type="submit"
                      style={{
                        backgroundColor: "rgb(76, 175, 80)",
                        color: "white",
                        padding: "5px 15px",
                        borderRadius: "5px",
                        border: "none",
                        fontWeight: "bold",
                        cursor: "pointer",
                        marginBottom: '5px'
                      }}
                    >
                      {!loading ? ('Guardar Convocatoria') : ('Guardando Cambios...')}
                    </button>
                  ) : (
                    <p>No hay cambios para guardar</p>
                  )
                }
                
                <button onClick={() => deleteConvocatoria()} className='deleteButton'><Trash size={'15px'} style={{ marginRight: "5px" }} />
                  {
                    isDeleting ? ('Borrando...') : ('Borrar')
                  }
                </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
