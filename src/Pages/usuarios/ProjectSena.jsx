import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CCard,
  CCardBody,
  CSpinner,
} from "@coreui/react";
import "@coreui/coreui/dist/css/coreui.min.css";
import PopupInfo from "../../Components/PopupInfo";
import AdminLayout from "../../Layouts/AdminLayout";
import { useLocation, useNavigate } from "react-router-dom";

const VITE_API_URL = import.meta.env.VITE_API_URL
const API_URL = `${VITE_API_URL}/proyectos`;
const SECCION_API_URL = `${VITE_API_URL}/seccion`;
const GPT_API_URL = import.meta.env.VITE_OPENAI_API_URL;
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const parseJwt = (token) => {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  return JSON.parse(jsonPayload);
};

const ProjectSena = () => {
  const location = useLocation();
  const { template, convocatoriaId } = location.state || {};

  const [formData, setFormData] = useState({
    titulo: "",
    fecha: "",
    estado: "En progreso",
    descripcion: "",
    secciones: [
      { titulo: "Planteamiento del problema", descripcion: "" },
      { titulo: "Justificación", descripcion: "" },
      { titulo: "Objetivo general", descripcion: "" },
      { titulo: "Objetivos específicos", descripcion: "" },
      { titulo: "Antecedentes", descripcion: "" },
    ],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [precioDesglosado, setPrecioDesglosado] = useState(null);
  const [costosLoading, setCostosLoading] = useState(false);
  const navigate = useNavigate();

  

  const descriptionRef = useRef(null);

  useEffect(() => {
    if (template) {
      setFormData((prevState) => ({
        ...prevState,
        secciones: template,
      }));
    }

    if(success){
      navigate('/usuarios/misproyectos')
    }
  }, [template, success]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleSeccionChange = (index, field, value) => {
    setFormData((prevState) => {
      const newSecciones = [...prevState.secciones];
      newSecciones[index][field] = value;
      return {
        ...prevState,
        secciones: newSecciones,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("No se encontró el token de autenticación");
      setLoading(false);
      return;
    }

    try {
      const decodedToken = parseJwt(token);
      const usuarioId = decodedToken.sub._id;

      const dataToSend = {
        titulo: formData.titulo,
        fecha: formData.fecha,
        estado: formData.estado,
        descripcion: formData.descripcion,
        usuarioId: usuarioId,
        convocatoria: convocatoriaId
      };

      await processDescriptionWithGPT(formData.descripcion);

      const response = await axios.post(API_URL, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const projectId = response.data._id;
      console.log("Proyecto creado con ID:", projectId);

      const seccionesData = formData.secciones.map((seccion) => ({
        nombre: seccion.titulo,
        contenido: seccion.descripcion,
      }));

      const finalData = {
        proyecto: projectId,
        tipoSeccion: seccionesData,
      };

      await axios.post(SECCION_API_URL, finalData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Secciones creadas exitosamente");
      setSuccess(true);
      setFormData({
        titulo: "",
        fecha: "",
        estado: "En progreso",
        descripcion: "",
        secciones: [
          { titulo: "Planteamiento del problema", descripcion: "" },
          { titulo: "Justificación", descripcion: "" },
          { titulo: "Objetivo general", descripcion: "" },
          { titulo: "Objetivos específicos", descripcion: "" },
          { titulo: "Antecedentes", descripcion: "" },
        ],
        convocatoria: convocatoriaId
      });
      alert("Proyecto y secciones subidos exitosamente");
    } catch (err) {
      console.error("Error detallado:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
      alert(
        "Error al subir el proyecto: " +
        (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDescriptionChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      descripcion: value,
    }));
  };

  const processDescriptionWithGPT = async (desc) => {
    setLoading(true);
    try {
      const response = await axios.post(
        GPT_API_URL,
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Eres un asistente útil que mejora la formulación de proyectos, no respondas nada que no tenga que ver con la formulación de proyectos, solo responde con la descripción mejorada",
            },
            {
              role: "user",
              content: `Mejora la siguiente descripción, solo dame la respuesta: ${desc}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const improvedDescription = response.data.choices[0].message.content;
      setFormData((prevState) => ({
        ...prevState,
        descripcion: improvedDescription,
      }));
    } catch (error) {
      console.error("Error al procesar la descripción con GPT:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Request data:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const processSectionWithGPT = async (index) => {
    const seccion = formData.secciones[index];
    setLoading(true);
    try {
      const response = await axios.post(
        GPT_API_URL,
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                `Eres un asistente útil que mejora las descripciones de proyectos, basándote en metodologías como el Marco Lógico (MML) y la Metodología General Ajustada (MGA). 
                Te enfocas en la formulación de proyectos de Investigación, Desarrollo Tecnológico e Innovación (I+D+i), alineándolos con las líneas estratégicas, como Producción para la Vida, Transición Energética y Economía Popular, siempre considerando objetivos claros, productos tangibles, y resultados medibles. 
                No respondas nada que no tenga que ver con la formulación de proyectos, y limita tu respuesta a lo que se te pida.`,
            },
            {
              role: "user",
              content: `Mejora el siguiente texto teniendo en cuenta el título del proyecto "${formData.titulo}", el título de la sección "${seccion.titulo}" y la descripción del proyecto "${formData.descripcion}". Considera que el proyecto debe estar alineado con las metodologías MML y MGA: ${seccion.descripcion}. No quiero nada aparte de la respuesta y dámelo sin estilo, en texto plano, exclusivamente quiero el ${seccion.descripcion}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const improvedDescription = response.data.choices[0].message.content;
      setFormData((prevState) => {
        const newSecciones = [...prevState.secciones];
        newSecciones[index].descripcion = improvedDescription;
        return {
          ...prevState,
          secciones: newSecciones,
        };
      });
    } catch (error) {
      console.error("Error al procesar la sección con GPT:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("Request data:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    document.querySelectorAll('textarea').forEach((textarea) => {
      adjustTextareaHeight(textarea);
    });
  }, [formData]);


  const adjustTextareaHeight = (textarea) => {
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  return (
    <AdminLayout>
      <CCard className="card-container">
        <CCardBody className="formProyecto">
          {error && <div className="alert alert-danger">{error}</div>}
          {success && (
            <div className="alert alert-success" style={{ position: "fixed", bottom: "0", right: "2%"}}>
              Proyecto creado exitosamente!
            </div>
          )}
          <CForm onSubmit={handleSubmit}>
            <CFormLabel htmlFor="titulo">
              Título del Proyecto
              <PopupInfo
                icon={"?"}
                info={
                  "Proporciónanos el nombre que deseas darle a tu proyecto."
                }
              />
            </CFormLabel>
            <CFormInput
              required
              type="text"
              id="titulo"
              value={formData.titulo}
              onChange={handleChange}
            />

            <CFormLabel htmlFor="fecha">Fecha</CFormLabel>
            <CFormInput
              required
              type="date"
              id="fecha"
              value={formData.fecha}
              onChange={handleChange}
              min="1960-01-01"
              max={new Date().toISOString().split('T')[0]}
            />
            <CFormLabel htmlFor="descripcion">
              Descripción
              <PopupInfo
                icon={"?"}
                info={
                  "Escribe una descripción general de la idea de tu proyecto."
                }
              />
            </CFormLabel>
            <textarea
              required
              id="descripcion"
              className="form-control section-description-textarea"
              value={formData.descripcion}
              onChange={handleDescriptionChange}
              ref={descriptionRef}
              rows="3"
              onInput={(e) => adjustTextareaHeight(e.target)}
            />

            {formData.secciones.map((seccion, index) => (
              <div key={index} className="seccion">
                <CFormLabel htmlFor={`seccion-titulo-${index}`}>
                  {seccion.titulo}
                  <PopupInfo
                    icon={"?"}
                    info={`Deja el campo en blanco para que la IA genere una descripción para la sección "${seccion.titulo}", o escribe una descripción y la IA la mejorará.`}
                  />
                </CFormLabel>
                <textarea
                  style={{ height: "auto", resize: "none" }}
                  required
                  id={`seccion-descripcion-${index}`}
                  value={seccion.descripcion}
                  onChange={(e) =>
                    handleSeccionChange(index, "descripcion", e.target.value)
                  }
                  rows="3"
                  onInput={(e) => adjustTextareaHeight(e.target)}
                  className="form-control section-description-textarea"
                />
                <CButton
                  className="buttonImproveText"
                  onClick={() => processSectionWithGPT(index)}
                  disabled={loading} 
                >
                  Mejorar Descripción
                  {loading && (
                    <CSpinner
                      style={{
                        width: "1rem",
                        height: "1rem",
                        margin: "0px 10px",
                      }}
                    />
                  )}
                </CButton>

              </div>
            ))}

            <CButton type="submit" className="PrimaryButton mt-3" disabled={loading}>
              Subir Proyecto
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>
    </AdminLayout>
  );
};

export default ProjectSena;
