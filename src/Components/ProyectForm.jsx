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
import "../../SubirProyecto.css";
import PopupInfo from "./PopupInfo";
import { useNavigate } from "react-router-dom";

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

const SubirProyecto = () => {
  const [formData, setFormData] = useState({
    titulo: "",
    fecha: "",
    estado: "En progreso",
    descripcion: "",
    camposAdicionales: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [precioDesglosado, setPrecioDesglosado] = useState(null);
  const [costosLoading, setCostosLoading] = useState(false);
  const [viabilidad, setViabilidad] = useState(null);
  const token = localStorage.getItem("token");


  const descriptionRef = useRef(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleCampoAdicionalChange = (index, field, value) => {
    setFormData((prevState) => {
      const newCamposAdicionales = [...prevState.camposAdicionales];
      if (!newCamposAdicionales[index]) {
        newCamposAdicionales[index] = {};
      }
      newCamposAdicionales[index][field] = value;
      return {
        ...prevState,
        camposAdicionales: newCamposAdicionales,
      };
    });
  };

  const agregarCampoAdicional = () => {
    setFormData((prevState) => ({
      ...prevState,
      camposAdicionales: [
        ...prevState.camposAdicionales,
        { titulo: "", descripcion: "" },
      ],
    }));
  };

  const eliminarCampoAdicional = (index) => {
    setFormData((prevState) => {
      const newCamposAdicionales = prevState.camposAdicionales.filter(
        (_, i) => i !== index
      );
      return {
        ...prevState,
        camposAdicionales: newCamposAdicionales,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

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

      const seccionesData = formData.camposAdicionales.map((seccion) => ({
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
        camposAdicionales: [],
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
                "Eres un asistente útil que mejora la formulacion de proyectos, no respondas nada que no tenga que ver con la formulacion de proyectos, solo responde con la descripcion mejorada",
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
    const seccion = formData.camposAdicionales[index];
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
              content: `Mejora el siguiente texto teniendo en cuenta el título del proyecto "${formData.titulo}", el título de la sección "${seccion.titulo}" y la descripción del proyecto "${formData.descripcion}". Considera que el proyecto debe estar alineado con las metodologías MML y MGA: ${seccion.descripcion}. No quiero nada aparte de la respuesta y dámelo sin estilo, en texto plano.`,
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
        const newCamposAdicionales = [...prevState.camposAdicionales];
        newCamposAdicionales[index].descripcion = improvedDescription;
        return {
          ...prevState,
          camposAdicionales: newCamposAdicionales,
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


  const adjustTextareaHeight = (textarea) => {
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  const getCostBreakdownFromGPT = async (description) => {
    setCostosLoading(true);
    try {
      const response = await axios.post(
        GPT_API_URL,
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Eres un asistente experto en costos de proyectos. Proporciona un desglose detallado de costos para proyectos en base a la descripción proporcionada. Debes ser preciso con los precios, usando promedios de la industria si no tienes datos exactos. Todos los valores deben ser en pesos colombianos (COP).",
            },
            {
              role: "user",
              content: `Dado el siguiente proyecto y su descripción: "${description}", proporciona un desglose detallado de los costos estimados. Asegúrate de que cada categoría tenga un valor en pesos colombianos (COP) y proporciona los valores completos sin conversión. Devuelve los valores en el formato numérico exacto.`,
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

      const costBreakdown = response.data.choices[0].message.content;
      console.log("Respuesta del modelo:", costBreakdown);

      const breakdownObject = costBreakdown
        .split("\n")
        .map((line) => line.split(":"))
        .filter((pair) => pair.length === 2)
        .reduce((acc, [key, value]) => {
          
          const cleanedValue = value.replace(/[^0-9.,]/g, '').replace(',', '.').trim();
          const parsedValue = parseFloat(cleanedValue);

          acc[key.trim()] = isNaN(parsedValue) ? "Desconocido" : parsedValue;
          return acc;
        }, {});

      const calculateTotal = (categories) => {
        return Object.values(categories).reduce((total, value) => {
          if (typeof value === 'number') {
            return total + value;
          }
          return total;
        }, 0);
      };

      const infraestructureCost = calculateTotal({
        'Alquiler del local (3 meses)': breakdownObject['Alquiler del local (3 meses)'],
        'Renovaciones y adecuaciones': breakdownObject['Renovaciones y adecuaciones'],
        'Pintura': breakdownObject['Pintura'],
        'Instalación eléctrica': breakdownObject['Instalación eléctrica'],
        'Contratación de mano de obra': breakdownObject['Contratación de mano de obra'],
        'Mobiliario': breakdownObject['Mobiliario'],
        'Mesas y estanterías': breakdownObject['Mesas y estanterías'],
        'Cajas registradoras (1)': breakdownObject['Cajas registradoras (1)'],
        'Señalización y decoración': breakdownObject['Señalización y decoración']
      });

      const equipmentCost = calculateTotal({
        'Refrigerador (1)': breakdownObject['Refrigerador (1)'],
        'Balanza digital (1)': breakdownObject['Balanza digital (1)'],
        'Computador o tablet para inventarios (1)': breakdownObject['Computador o tablet para inventarios (1)'],
        'Software de gestión de inventario': breakdownObject['Software de gestión de inventario'],
        'Otros equipos menores (cajas, bolsas, etc.)': breakdownObject['Otros equipos menores (cajas, bolsas, etc.)']
      });

      const merchandiseCost = calculateTotal({
        'Frutas y verduras (inicial)': breakdownObject['Frutas y verduras (inicial)'],
        'Otros productos (snacks, jugos, etc.)': breakdownObject['Otros productos (snacks, jugos, etc.)'],
        'Efectivo para cambios y cobros iniciales': breakdownObject['Efectivo para cambios y cobros iniciales']
      });

      const licensesCost = calculateTotal({
        'Licencia de funcionamiento': breakdownObject['Licencia de funcionamiento'],
        'Registro de comercio': breakdownObject['Registro de comercio'],
        'Salubridad': breakdownObject['Salubridad']
      });

      const advertisingCost = calculateTotal({
        'Diseño de logo y papelería': breakdownObject['Diseño de logo y papelería'],
        'Publicidad en redes sociales (2 meses)': breakdownObject['Publicidad en redes sociales (2 meses)']
      });

      const contingencyCost = breakdownObject['Fondo de imprevistos'];

      const total = calculateTotal({
        'Infraestructura y adecuaciones': infraestructureCost,
        'Equipos y tecnología': equipmentCost,
        'Mercancía inicial': merchandiseCost,
        'Licencias y permisos': licensesCost,
        'Publicidad y marketing': advertisingCost,
        'Fondo de imprevistos': contingencyCost
      });

      breakdownObject['Desglose total'] = total;
      breakdownObject['Total estimado'] = total;

      console.log("Desglose procesado:", breakdownObject);
      setPrecioDesglosado(breakdownObject);
    } catch (error) {
      console.error("Error al obtener el desglose de costos con GPT:", error);
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
      setCostosLoading(false);
    }
  };

  const markdownToHtml = (markdown) => {
    const withHeadings = markdown.replace(/^\s*##\s+(.*)$/gm, '<h2>$1</h2>');

    const withBold = withHeadings.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    const withItalic = withBold.replace(/\*(.*?)\*/g, '<em>$1</em>');

    const withLists = withItalic.replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>');

    const withUlLists = withLists.replace(/<\/li>\s*<li>/g, '</li><li>');
    const withListTags = `<ul>${withUlLists}</ul>`.replace(/<\/ul>\s*<ul>/g, '');

    const withParagraphs = withListTags.replace(/\n\n/g, '</p><p>');

    return `<p>${withParagraphs}</p>`;
  };

  const processContent = (content) => {
    const sections = content.split('\n\n'); 

    return sections.map((section, index) => {
      
      const [title, ...rest] = section.split('\n');
      const htmlContent = markdownToHtml(rest.join('\n'));
      return {
        title: title.replace(/^\d+\.\s*/, ''), 
        content: htmlContent,
      };
    });
  };

  const calculateViabilidad = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        GPT_API_URL,
        {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Eres un asistente experto en calcular la viabilidad de proyectos. Proporciona una evaluación firme sobre la viabilidad del proyecto junto a los precios.",
            },
            {
              role: "user",
              content: `Dado el siguiente proyecto y su descripción: "${formData.descripcion}", proporciona la viabilidad del mismo.`,
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

      const content = response.data.choices[0].message.content.trim();
      const sections = processContent(content);
      setViabilidad(sections);
    } catch (err) {
      console.error("Error al calcular la viabilidad:", err);
      setError("Error al calcular la viabilidad");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    adjustTextareaHeight(descriptionRef.current);
  }, [formData.descripcion]);

  useEffect(() => {
    document.querySelectorAll(".section-description-textarea").forEach((textarea) => {
      adjustTextareaHeight(textarea);
    });
  }, [formData.camposAdicionales]);

  const navigate = useNavigate()

  useEffect(() => {
    if(success){
      navigate('/usuarios/misproyectos')
    }
  }, [success])

  const isButtonDisabled = !(formData.titulo && formData.descripcion);

  return (
    <CCard className="card-container">
      <h2>Crear Proyecto</h2>
      <CCardBody className="formProyecto">
        <CForm onSubmit={handleSubmit}>
          <div className="mb-3">
            <CFormLabel htmlFor="titulo">Título del Proyecto
              <PopupInfo icon={'?'} info={'Proporciónanos el nombre que deseas darle a tu proyecto. Este título será utilizado para identificar y referenciar tu proyecto en futuras comunicaciones y documentación.'} />
            </CFormLabel>
            <CFormInput
              required
              type="text"
              id="titulo"
              value={formData.titulo}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="fecha">Fecha
              <PopupInfo icon={'?'} info={'Indica la fecha desde la cual tu proyecto está activo, si ya está en marcha. Si estás iniciando el proyecto ahora, por favor proporciona la fecha en la que estás completando este formulario.'} />
            </CFormLabel>

            <CFormInput
              required
              type="date"
              id="fecha"
              value={formData.fecha}
              onChange={handleChange}
              min="1960-01-01"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="mb-3">
            <CFormLabel htmlFor="descripcion">Descripción
              <PopupInfo icon={'?'} info={'Proporciona una breve descripción de tu proyecto. Esta información será fundamental para que la IA pueda crear las secciones correspondientes. Además, puedes mejorar esta descripción automáticamente haciendo clic en Mejorar Descripción.'} />
            </CFormLabel>
            <textarea
              required
              id="descripcion"
              value={formData.descripcion}
              onChange={handleDescriptionChange}
              ref={descriptionRef}
              className="form-control"
              rows="3"
            />

            <div className="buttonWithPopup">
              <CButton
                type="button"
                onClick={() => processDescriptionWithGPT(formData.descripcion)}
                disabled={loading}
                className="mt-3 buttonImproveText"
              >
                {loading ? <CSpinner size="sm" /> : ""}
                Mejorar Descripción
              </CButton>

  
            </div>



          </div>
          {formData.camposAdicionales.map((campo, index) => (
            <div key={index} className="mb-3">
              <CFormLabel htmlFor={`titulo-seccion-${index}`}>
                Título de la Sección
                <PopupInfo icon={'?'} info={'Indica la sección que deseas crear o mejorar, como por ejemplo: Planteamiento del problema, Objetivos específicos, Objetivo general, etc. Esta información ayudará a estructurar tu proyecto de manera efectiva.'} />
              </CFormLabel>
              <CFormInput
                required
                type="text"
                id={`titulo-seccion-${index}`}
                value={campo.titulo}
                onChange={(e) =>
                  handleCampoAdicionalChange(index, "titulo", e.target.value)
                }
              />
              <CFormLabel htmlFor={`descripcion-seccion-${index}`}>
                Descripción de la Sección
                <PopupInfo icon={'?'} info={'Escribe una descripción que se alinee con el título de la sección. Puedes mejorar esta descripción haciendo clic en el botón "Mejorar Sección". Si prefieres, puedes dejar este espacio en blanco y la IA generará una descripción basada en el título de la sección.'} />
              </CFormLabel>
              <textarea
                required
                id={`descripcion-seccion-${index}`}
                value={campo.descripcion}
                onChange={(e) => handleCampoAdicionalChange(index, "descripcion", e.target.value)}
                className="form-control section-description-textarea"
                rows="3"
              />
              <CButton
                type="button"
                onClick={() => processSectionWithGPT(index)}
                disabled={loading}
                className="mt-3 buttonImproveText"
              >
                {loading ? <CSpinner size="sm" /> : "Mejorar Sección"}
                <svg
                  style={{ margin: '0px 5px' }}
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="icon icon-tabler icons-tabler-outline icon-tabler-wand"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M6 21l15 -15l-3 -3l-15 15l3 3" />
                  <path d="M15 6l3 3" />
                  <path d="M9 3a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
                  <path d="M19 13a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
                </svg>
              </CButton>
              <CButton
                type="button"
                onClick={() => eliminarCampoAdicional(index)}
                color="danger"
                className="mt-2 ms-2"
              >
                Eliminar Sección
              </CButton>
            </div>
          ))}
          <CButton className='buttonWithInfo outline-none' type="button" onClick={agregarCampoAdicional}>
            Agregar Sección
            <PopupInfo icon={'?'} info={'Crea las secciones de tu proyecto de acuerdo con tus necesidades. Puedes añadir tantas secciones como desees para estructurar tu proyecto de manera flexible. ¡Aprovecha esta opción para desarrollar un proyecto completo y bien estructurado!'} />
          </CButton>

          <CButton
            type="button"
            onClick={calculateViabilidad}
            disabled={isButtonDisabled}
            className="mt-2 buttonWithInfo"
          >
            {loading ? <CSpinner size="sm" /> : "Calcular Viabilidad"}
            <PopupInfo icon={'?'} info={'Esta función calcula la viabilidad y costos necesarios para tu proyecto. ESTA FUNCION AUN ESTA EN FASE EXPERIMENTAL, POR LO CUAL LOS DATOS DADOS PUEDEN TENER ERRORES.'} />
          </CButton>
          {viabilidad && (
            <div className="viabilidad-container">
              <h2>Evaluación de Viabilidad</h2>
              <div className="viabilidad-content">
                {viabilidad.map((section, index) => (
                  <div key={index} className="viabilidad-section">
                    <h3 className="viabilidad-title">{section.title}</h3>
                    <div className="viabilidad-text" dangerouslySetInnerHTML={{ __html: section.content }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          <CButton type="submit" className="PrimaryButton mt-4" disabled={loading}>
            {loading ? <CSpinner size="sm" /> : "Subir Proyecto"}
          </CButton>
        </CForm>
        {success && (
          <p className="text-success mt-3">Proyecto subido exitosamente!</p>
        )}
      </CCardBody>
    </CCard>
  );
};

export default SubirProyecto;