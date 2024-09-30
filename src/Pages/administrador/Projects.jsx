import React, { lazy, Suspense, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Loader from "../../Components/Loader";

const AdminLayout = lazy(() => import("../../Layouts/AdminLayout"));
const ProjectOverviewCard = lazy(() => import("../../Components/CardProyect"));

const VITE_API_URL = import.meta.env.VITE_API_URL
const API_URL_PROYECTS = `${VITE_API_URL}/proyectos`;

const Projects = () => {
  const token = localStorage.getItem("token");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(API_URL_PROYECTS, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const filteredData = response.data.filter(project =>
          ["En progreso", "Pendiente", "En Revision", "Revisado", "Cancelado", "Completado", "Revisado con errores"].includes(project.estado)
        );
        setProjects(filteredData);
      } catch (error) {
        setError('Error al obtener los proyectos.');
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [token, projects]);

  const filteredProjects = useMemo(() => {
    const filterByDate = (project) => {
      const now = new Date();
      const projectDate = new Date(project.fechaCreacion);

      switch (dateFilter) {
        case "mostRecent":
          return true;
        case "lastWeek":
          return now - projectDate <= 7 * 24 * 60 * 60 * 1000;
        case "lastMonth":
          return now - projectDate <= 30 * 24 * 60 * 60 * 1000;
        default:
          return true;
      }
    };

    return projects.filter(
      (project) =>
        (statusFilter ? project.estado === statusFilter : true) &&
        (searchTerm
          ? project.titulo && project.titulo.toLowerCase().includes(searchTerm.toLowerCase())
          : true) &&
        filterByDate(project)
    );
  }, [statusFilter, searchTerm, dateFilter, projects]);

  if (loading) return <Loader/>;
  if (error) return <p>Error loading projects: {error}</p>;
  if(projects === null){
    return(
      <Loader/>
    )
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-4 SearchAndFilter">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Todos los Estados</option>
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
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="cardsContainer">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => <ProjectOverviewCard key={project._id} data={project} />)
        ) : (
          <div className="flex flex-col items-center justify-center h-screen text-white font-bold">
            <p className="text-2xl">No hay ningún proyecto con estado {statusFilter || "todos"} 😢</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Projects;
