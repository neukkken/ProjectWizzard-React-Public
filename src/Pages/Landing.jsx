import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OutTeamCard from '../Components/OutTeamCard';

function Loader() {
  return (
    <div className="loaderCont">
      <div className="loader"></div>
    </div>
  );
}

const VITE_API_URL = import.meta.env.VITE_API_URL;

export default function Home() {
  const [convocatorias, setConvocatorias] = useState([]);
  const navigate = useNavigate();
  const landingLayoutRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  function formatDateTransform(dateString) {
    if (!dateString) return "Fecha no disponible";
    return dateString.split("T")[0];
  }


  useEffect(() => {
    if (localStorage.getItem('token') !== null) {
      navigate("/login")
    }

    const fetchConvocatorias = async () => {
      try {
        const response = await axios.get(`${VITE_API_URL}/convocatoria`)

        console.log(response.data)
        setConvocatorias(response.data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchConvocatorias()

    let isScrolling = false;

    const smoothScroll = (element, distance, duration) => {
      const start = element.scrollLeft;
      const startTime = performance.now();

      const animate = (time) => {
        const elapsedTime = time - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        element.scrollLeft = start + distance * easeInOutQuad(progress);

        if (elapsedTime < duration) {
          requestAnimationFrame(animate);
        } else {
          isScrolling = false;
        }
      };

      requestAnimationFrame(animate);
    };

    const easeInOutQuad = (t) => {
      return t < 0.5
        ? 2 * t * t
        : -1 + (4 - 2 * t) * t;
    };

    const handleWheel = (event) => {
      if (!landingLayoutRef.current || isScrolling) return;

      event.preventDefault();
      const container = landingLayoutRef.current;
      const sections = Array.from(container.children);
      if (sections.length === 0) return;

      const sectionWidth = sections[0].offsetWidth;
      const scrollAmount = event.deltaY > 0 ? sectionWidth : -sectionWidth;

      isScrolling = true;
      smoothScroll(container, scrollAmount, 1000);
    };

    document.addEventListener('wheel', handleWheel, { passive: false });

    setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };

  }, []);

  function goToRegister() {
    navigate('/register')
  }

  function goToForms(path) {
    navigate(path);
  }

  if (!convocatorias) {
    return <Loader />;
  }


  return (
    <div className='landingLayout fade-in' ref={landingLayoutRef}>
      <header className='landingHeader'>
        <img src="https://sena.edu.co/Style%20Library/alayout/images/logoSena.png" alt="sena logo" className="iconHeader" style={{ width: '50px', height: '50px' }} />
        <div className="labelsHeader">
          <a href="#caracteristicas" onClick={(e) => { e.preventDefault(); scrollToSection('caracteristicas'); }}>Características</a>
          <a href="#acercadenosotros" onClick={(e) => { e.preventDefault(); scrollToSection('acercadenosotros'); }}>Acerca de SENNOVA</a>
          <a href="#convocatorias" onClick={(e) => { e.preventDefault(); scrollToSection('convocatorias'); }}>Convocatorias</a>

          <a target='_blank' href="https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=projectwizzardteam@gmail.com">Contacto & PQRS</a>
          <button onClick={() => goToForms('/login')} className='loginButtonHeader'>Iniciar Sesion</button>
          <button onClick={() => goToForms('/register')} className='registerButtonHeader'>Registro</button>
        </div>
      </header>
      <div className="scrollHorizontalConteiner">
        <div className='landingContent'>
          <div className="welcomeLanding" id='inicio'>
            <h1>Gestiona proyectos, simplifica el éxito.</h1>
            <p>Utiliza IA para formular proyectos y permite a los administradores revisar y asegurar su calidad. Optimiza tu gestión de proyectos con tecnología avanzada y supervisión experta.</p>
          </div>
          <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            <img src="https://sennovacaag.wordpress.com/wp-content/uploads/2020/09/sennova-logo.png" alt="sennova logo" className='sennalogo'/>
          </div>
        </div>
        <div className='landingContent'>
          <div className="featuresLanding" id='caracteristicas'>
            <h1>Características</h1>
            <p className='text-center'>Descubre las funciones destacadas de nuestra herramienta que facilitan la formulación y gestión de proyectos.</p>
            <div className="featuresContainer">
              <li className="feature">
                <h4>
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
                    className="icon icon-tabler icon-tabler-robot"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M6 4m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
                    <path d="M12 2v2" />
                    <path d="M9 12v9" />
                    <path d="M15 12v9" />
                    <path d="M5 16l4 -2" />
                    <path d="M15 14l4 2" />
                    <path d="M9 18h6" />
                    <path d="M10 8v.01" />
                    <path d="M14 8v.01" />
                  </svg>
                  Asistente de IA
                </h4>
                <p>Utiliza la Inteligencia Artificial para perfeccionar la formulación y redacción de tus proyectos, ahorrando tiempo y garantizando precisión en cada detalle.</p>
              </li>
              <li className="feature">
                <h4>
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
                    className="icon icon-tabler icons-tabler-outline icon-tabler-eye-check"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                    <path d="M11.102 17.957c-3.204 -.307 -5.904 -2.294 -8.102 -5.957c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6a19.5 19.5 0 0 1 -.663 1.032" />
                    <path d="M15 19l2 2l4 -4" />
                  </svg>

                  Revisión Administrativa
                </h4>
                <p>Los administradores revisan los proyectos para asegurar que cumplen con los estándares y requisitos antes de su aprobación final.</p>
              </li>
              <li className="feature">
                <h4>
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
                    className="icon icon-tabler icons-tabler-outline icon-tabler-ad-2"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M11.933 5h-6.933v16h13v-8" />
                    <path d="M14 17h-5" />
                    <path d="M9 13h5v-4h-5z" />
                    <path d="M15 5v-2" />
                    <path d="M18 6l2 -2" />
                    <path d="M19 9h2" />
                  </svg>

                  Gestión Flexible de Secciones
                </h4>
                <p>Añade y edita secciones según las necesidades específicas de tu proyecto, adaptándote a cualquier tipo de iniciativa.</p>
              </li>
            </div>
          </div>
        </div>
        <div className='landingContent'>

          <div className="aboutusLanding">
            <h1>Acerca de SENNOVA</h1>
            <p style={{ textAlign: "center" }}><span>SENNOVA</span> Es el Sistema de Investigación, Innovación y Desarrollo Tecnológico a través del cual se ejecuta la política de contribución del SENA a la Ciencia y Tecnología del País; fortaleciendo capacidades locales en productividad, competitividad, generación de conocimiento y pertinencia de la Formación Profesional Integral impartida en la institución. </p>
            <p style={{ textAlign: "center" }}>Toda la comunidad SENA hace parte de SENNOVA, una iniciativa por medio de la cual aprendices e instructores tienen la oportunidad de participar y adquirir conocimientos.</p>
            <p style={{ textAlign: "center" }}>
              <h2>Portal SENNOVA</h2>
              <a href="http://sennova.senaedu.edu.co/">http://sennova.senaedu.edu.co/</a>
            </p>
          </div>
          <div id='acercadenosotros'></div>
        </div>
        <div className='landingContent'>
          <div className="aboutusLanding">
            <h1>Convocatorias</h1>
            <p style={{ textAlign: "center" }}><span>Estas son las Convocatorias</span> a las que puedes unirte!</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "2em", justifyContent: 'center', alignItems: 'center' }}>
              {
                convocatorias.slice(0, 3).map((convocatoria) => (
                  <div
                    className="convocatoriaCard"
                    key={convocatoria._id}
                    onClick={() => goToRegister()}
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
                    <section style={{ textAlign: "start", display: "flex", justifyContent: "start", alignItems: "start" }}>
                      <p>{formatDateTransform(convocatoria.fechaInicio)}</p>
                      <button>Unirte</button>
                    </section>
                  </div>
                ))
              }
            </div>
          </div>
          <div id='convocatorias'></div>
        </div>

        <div className='landingContent'>

          <div className="outTeamLanding">
            <h2>Nuestro Equipo</h2>
            <div className="containerOurTeam">
              <OutTeamCard nombre={"Santiago Narvaez Lasso"} rol={"Desarrollador FrontEnd"} urlIg={"https://www.instagram.com/_mxxn.js/"} urlGithub={""}/>
              <OutTeamCard nombre={"Darwin Steven Gómez Camayo"} rol={"Desarrollador Backend"} urlIg={"https://www.instagram.com/el_darwon/"} urlGithub={"https://github.com/ElDarwon123"}/>
              <OutTeamCard nombre={"Jossie Fernando Aranda"} rol={"Desarrollador FrontEnd"} urlIg={"https://www.instagram.com/ferchoarand/"} urlGithub={"https://github.com/JOSSIE2463"}/>
              <OutTeamCard nombre={"Esthefani Ibarra Rodríguez"} rol={"Desarrolladora FrontEnd"} urlIg={"https://www.instagram.com/sthefa__2907/"} urlGithub={"https://github.com/sthefa2907"}/>
              <OutTeamCard nombre={"Andrea Yulieth Salazar Pérez"} rol={"Desarrolladora Movil"} urlIg={"https://www.instagram.com/andrea.salazar35/"} urlGithub={"https://github.com/Andreasalazar31"}/>
              <OutTeamCard nombre={"Edinson Ferney Becoche"} rol={"Desarrollador Movil"} urlIg={""} urlGithub={"https://github.com/Edinson2005"}/>
              <OutTeamCard nombre={"Kevin Danilo López"} rol={"Desarrollador"} urlIg={""} urlGithub={""}/>
            </div>

          </div>
          <div id='outTeam'></div>
        </div>
      </div>
    </div >
  );
}
