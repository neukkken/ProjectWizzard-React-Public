import AdminLayout from "../../Layouts/AdminLayout";
import ProjectOverviewCard from "../../Components/CardProyect";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const VITE_API_URL = import.meta.env.VITE_API_URL
const PROFILE_URL = `${VITE_API_URL}/auth/profile`;

const MyProjects = () => {
  const token = localStorage.getItem("token");
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  if (token == null) {
    navigate('/login');
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(PROFILE_URL, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data.sub._id);
      } catch (error) {
        setError(error);
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  useEffect(() => {
    if (user !== null) {
      const ID_USER_URL = `${VITE_API_URL}/auth/usuario/${user}`;

      const fetchProjects = async () => {
        try {
          const response = await axios.get(ID_USER_URL, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          const filteredData = response.data.proyectos.filter(project =>
            ["En progreso", "Pendiente", "En Revision", "Revisado", "Revisado con errores", "Cancelado", "Completado"].includes(project.estado)
          );
          setProjects(filteredData);
          setFilteredProjects(filteredData);
          console.log("datos filtrados", filteredData)
        } catch (error) {
          setError(error);
          console.error("Error fetching projects:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProjects();
    }
  }, [user, token]);

  useEffect(() => {
    const filtered = projects.filter(project =>
      (statusFilter ? project.estado === statusFilter : true) &&
      (searchTerm 
        ? project.titulo && project.titulo.toLowerCase().includes(searchTerm.toLowerCase()) 
        : true)
    );
    setFilteredProjects(filtered);
  }, [statusFilter, searchTerm, projects]);
  
  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-4 SearchAndFilter">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="" defaultValue='Todos los Estados'>Todos los Estados</option>
          <option value="En progreso">En progreso</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En Revision">En Revision</option>
          <option value="Revisado">Revisado</option>
          <option value="Revisado con errores">Revisado con errores</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Completado">Completado</option>
        </select>
        <input
          type="text"
          placeholder="Buscar proyecto"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="cardsContainer">
        {projects.length === 0 && statusFilter === "" ? (
          <div className="flex flex-col items-center justify-center h-screen text-white font-bold">
            <p className="text-2xl">No tienes ningún proyecto aún 😢</p>
          </div>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectOverviewCard key={project._id} data={project} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-screen text-white font-bold">
            <p className="text-2xl">No hay ningún proyecto con estado {statusFilter || 'todos'} 😢</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MyProjects;
