import axios from 'axios';

const URL_API_AUTH = "https://projetback-r7o8.onrender.com/auth/profile";

const roleToRouteMap = {
  "Administrador": ["/administrador/home", "/administrador/proyectos", '/administrador/usuarios', '/administrador/review', '/administrador/crear-convocatoria', '/administrador/perfil', '/administrador/convocatorias'],
  "Usuario": ['/usuarios/convocatorias', "/usuarios/misproyectos", '/usuarios/review', '/usuarios/plantillas', '/usuarios/plantilla/libre', '/usuarios/plantillas/no-libre' , '/usuarios/perfil'],
};

const AuthUser = async (accessToken, setUser, navigate, currentRoute) => {

  try {
    const response = await axios.get(URL_API_AUTH, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = response.data;
    setUser(result);

    const userRole = result.sub.role;

    if (!userRole) {
      console.error("El usuario no tiene un rol definido");
      navigate('/login');
      return;
    }

    const allowedRoutes = roleToRouteMap[userRole];

    if (allowedRoutes) {
      if (!allowedRoutes.includes(currentRoute)) {
        navigate(allowedRoutes[0]);
      }
    } else {
      console.error("Rol desconocido o ruta no definida para el rol: " + userRole);
      navigate('/login');
    }
  } catch (error) {
    console.error(`Error al verificar la autenticación: ${error.message}`);
    navigate('/login');
  }
};

export default AuthUser;
