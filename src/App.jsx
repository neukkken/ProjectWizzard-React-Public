import React from 'react';
import '@coreui/coreui/dist/css/coreui.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRoutes, BrowserRouter } from 'react-router-dom';
import Landing from './Pages/Landing';
import '../style.css';
import Login from './Pages/Login';
import HomeAdmin from './Pages/administrador/Home';
import Register from './Pages/Register';
import UploadProyect from './Pages/usuarios/UploadProyect';
import MyProyects from './Pages/usuarios/MyProyects';
import ForgotPasswordForm from './Pages/ForgotPassword';
import Projects from './Pages/administrador/Projects';
import VisualizarUsuarios from './Pages/administrador/VisualizarUsuarios';
import ResetPassword from './Pages/ResetPassword';
import Review from './Pages/Review'
import UserReview from './Pages/usuarios/UserReview';
import Plantillas from './Pages/usuarios/Plantillas';
import ProjectSena from './Pages/usuarios/ProjectSena';
import CrearConvocatoria from './Pages/administrador/CrearConvocatoria';
import Convocatoria from './Pages/usuarios/Convocatoria';
import Profile from './Pages/usuarios/Profile';
import AdminProfile from './Pages/administrador/Profile';
import NotFound from './Pages/NotFound';
import AdminConvocatoria from './Pages/administrador/Convocatorias';

const AppRoutes = () => {
  let routes = useRoutes([
    { path: "/", element: <Landing /> },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/reset-password', element: <ResetPassword/> },
    { path: '/forgot-password', element: <ForgotPasswordForm/> },
    { path: '/administrador/home', element: <HomeAdmin /> },
    { path: '/administrador/proyectos', element: <Projects /> },
    { path: '/administrador/usuarios', element: <VisualizarUsuarios /> },
    { path: '/administrador/review', element: <Review /> },
    { path: '/administrador/crear-convocatoria', element: <CrearConvocatoria /> },
    { path: '/administrador/convocatorias', element: <AdminConvocatoria /> },
    { path: '/administrador/perfil', element: <AdminProfile /> },
    { path: '/usuarios/plantillas', element: <Plantillas /> },
    { path: '/usuarios/plantillas/no-libre', element: <ProjectSena /> },
    { path: '/usuarios/review', element: <UserReview/> },
    { path: '/usuarios/plantilla/libre', element: <UploadProyect /> },
    { path: '/usuarios/misproyectos', element: <MyProyects /> },
    { path: '/usuarios/convocatorias', element: <Convocatoria /> },
    { path: '/usuarios/perfil', element: <Profile /> },
    { path: '/*', element: <NotFound /> },
  ]);

  return routes;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
