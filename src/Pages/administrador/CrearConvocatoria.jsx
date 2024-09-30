import React, { useState } from "react";
import {
  CCard,
  CCardBody,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CSpinner,
  CFormTextarea,
} from "@coreui/react";
import axios from "axios";
import AdminLayout from "../../Layouts/AdminLayout";
import { useNavigate } from "react-router-dom";

const VITE_API_URL = import.meta.env.VITE_API_URL_2

const CrearConvocatoria = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    descripcion: "",
    fechaInicio: "",
    fechaCierre: "",
    estado: "Activa",
    template: [{ titulo: "" }],
    files: null,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const today = new Date();
  const todayISOString = today.toISOString().slice(0, 16);
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 50);
  const maxDateISOString = futureDate.toISOString().slice(0, 16);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      files: e.target.files[0],
    }));
  };

  const handleTemplateChange = (index, value) => {
    const updatedTemplate = [...formData.template];
    updatedTemplate[index].titulo = value;
    setFormData((prevState) => ({
      ...prevState,
      template: updatedTemplate,
    }));
  };

  const addSection = () => {
    setFormData((prevState) => ({
      ...prevState,
      template: [...prevState.template, { titulo: "" }],
    }));
  };

  const removeSection = (index) => {
    const updatedTemplate = formData.template.filter((_, i) => i !== index);
    setFormData((prevState) => ({
      ...prevState,
      template: updatedTemplate,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    const formDataToSend = new FormData();
    formDataToSend.append("fechaInicio", formData.fechaInicio);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("descripcion", formData.descripcion);
    formDataToSend.append("fechaCierre", formData.fechaCierre);
    formDataToSend.append("estado", formData.estado);

    if (formData.files) {
      if (Array.isArray(formData.files)) {
        formData.files.forEach((file) => formDataToSend.append("files", file));
      } else {
        formDataToSend.append("files", formData.files);
      }
    }
    

    formDataToSend.append("template", JSON.stringify(formData.template));


    try {
      setLoading(true);
      const response = await axios.post(
        `${VITE_API_URL}/convocatoria`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 201) {

        setSuccess(true);
        setFormData({
          title: "",
          descripcion: "",
          fechaInicio: "",
          fechaCierre: "",
          estado: "Activa",
          template: [{ titulo: "" }],
          files: null,
        });

        navigate('/administrador/convocatorias')
      }

      console.log(response)
    } catch (error) {
      console.error("Error submitting form:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTextareaResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };


  return (
    <AdminLayout>
      <CCard className="card-container">
        <CCardBody className="formProyecto">
          <CForm onSubmit={handleSubmit}>
            <h2 className="mb-">Crear Convocatoria</h2>

            <div className="mb-3">
              <CFormLabel htmlFor="title">Título de la Convocatoria</CFormLabel>
              <CFormInput
                required
                type="text"
                id="title"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <CFormLabel htmlFor="fechaInicio">Fecha de Inicio</CFormLabel>
              <CFormInput
                required
                type="datetime-local"
                id="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
                min={todayISOString}
              />
            </div>

            <div className="mb-3">
              <CFormLabel htmlFor="fechaCierre">Fecha de Cierre</CFormLabel>
              <CFormInput
                required
                type="datetime-local"
                id="fechaCierre"
                value={formData.fechaCierre}
                onChange={handleChange}
                min={todayISOString}
                max={maxDateISOString}
              />
            </div>

            <div className="mb-3">
              <CFormLabel htmlFor="descripcion">Descripción de la Convocatoria</CFormLabel>
              <CFormTextarea
                required
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => {
                  handleChange(e); 
                  handleTextareaResize(e);
                }}
                rows="5"
                style={{ overflow: 'hidden' }}
              />

            </div>

            <div className="mb-3">
              <CFormLabel htmlFor="files">Subir archivo</CFormLabel>
              <input type="file" id="files" onChange={handleFileChange} />
            </div>

            <div className="plantilla-container">
              <h2>Plantilla</h2>
              {formData.template.map((section, index) => (
                <div key={index} className="mb-3">
                  <CFormLabel htmlFor={`template-${index}`}>
                    Título de la Sección {index + 1}
                  </CFormLabel>
                  <CFormInput
                    required
                    type="text"
                    id={`template-${index}`}
                    value={section.titulo}
                    onChange={(e) => handleTemplateChange(index, e.target.value)}
                  />
                  {formData.template.length > 1 && (
                    <CButton
                      type="button"
                      color="danger"
                      className="mt-2"
                      onClick={() => removeSection(index)}
                    >
                      Eliminar Sección
                    </CButton>
                  )}
                </div>
              ))}

              <CButton
                type="button"
                color="secondary"
                className="mt-2"
                onClick={addSection}
              >
                Agregar Sección
              </CButton>
            </div>

            <CButton
              type="submit"
              className="PrimaryButton mt-4"
              disabled={loading}
            >
              {loading ? <CSpinner size="sm" /> : "Crear Convocatoria"}
            </CButton>
          </CForm>

          {success && (
            <p className="text-success mt-3">
              ¡Convocatoria creada exitosamente!
            </p>
          )}
        </CCardBody>
      </CCard>
    </AdminLayout>
  );
};

export default CrearConvocatoria;