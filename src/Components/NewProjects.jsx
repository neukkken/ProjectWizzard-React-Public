import React from 'react';

function NewProjects({ projects = [] }) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-purple-400 border-b-2 border-gray-300 mb-4">Nuevos Proyectos</h2>
      {projects.length > 0 ? (
        <ul className="space-y-2">
          {projects.map((project, index) => (
            <li key={index} className="border-b pb-2 last:border-b-0">
              <div className="flex items-center mb-2">
                {project.image && (
                  <img src={project.image} alt={project.titulo} className="w-10 h-10 object-cover rounded mr-3" />
                )}
                <div>
                  <p className="font-medium text-lg">{project.titulo}</p>
                  <p className="text-xs text-gray-400">
                    Creado el: {new Date(project.fecha).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-500">{project.descripcion}</p>
              <p className="text-xs text-gray-400 mt-1">Estado: {project.estado}</p>
              <p className="text-xs text-gray-400">
                Creado por: {project.usuarioId ? `${project.usuarioId.nombre || ''} ${project.usuarioId.apellido || ''}` : 'Usuario desconocido'}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No hay nuevos proyectos esta semana.</p>
      )}
    </div>
  );
}

export default NewProjects;