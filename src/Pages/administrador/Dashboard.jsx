import React from 'react';
import NewUsers from '../../Components/NewUsers';
import NewProjects from '../../Components/NewProjects';
import useWeeklyData from '../../hooks/useWeeklyData';

function Dashboard() {
  const { users, projects, error } = useWeeklyData(); 

  if (error) {
    return (
      <div className="p-6 bg-red-100 text-red-700">
        <h2 className="text-3xl font-bold mb-4 border-b-2 border-gray-300">Error al cargar datos</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!users || !projects) {
    return <div className="p-6 text-3xl font-bold mb-4 border-b-2 border-gray-300">Cargando...</div>;
  }

  return (
    <div className="p-6 bg-gray-800 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-blue-500 border-b-2 border-gray-300">Dashboard de Administrador</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NewUsers users={users} />
        <NewProjects projects={projects} />
      </div>
    </div>
  );
}

export default Dashboard;