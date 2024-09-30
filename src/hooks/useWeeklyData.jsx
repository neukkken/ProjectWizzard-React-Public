import { useState, useEffect } from 'react';

const VITE_API_URL = import.meta.env.VITE_API_URL
const API_URL_PROJECTS = `${VITE_API_URL}/proyectos`;
const API_URL_USERS = `${VITE_API_URL}/auth/usuario`;

function useWeeklyData() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('No se encontró token de autenticación');
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [projectsResponse, usersResponse] = await Promise.all([
          fetch(API_URL_PROJECTS, { headers }),
          fetch(API_URL_USERS, { headers })
        ]);

        if (!projectsResponse.ok) {
          const projectsError = await projectsResponse.text();
          throw new Error(`Projects HTTP error! status: ${projectsResponse.status}, message: ${projectsError}`);
        }
        if (!usersResponse.ok) {
          const usersError = await usersResponse.text();
          throw new Error(`Users HTTP error! status: ${usersResponse.status}, message: ${usersError}`);
        }

        const projectsData = await projectsResponse.json();
        const usersData = await usersResponse.json();

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() -7);

        const filteredProjects = projectsData.filter(project => new Date(project.fecha) > oneWeekAgo);
        const filteredUsers = usersData.filter(user => new Date(user.createdAt) > oneWeekAgo);

        setProjects(filteredProjects);
        setUsers(filteredUsers);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setProjects([]);
        setUsers([]);
      }
    };

    fetchData();
  }, []);

  return { users, projects, error };
}

export default useWeeklyData;